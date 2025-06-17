import datetime
import re

from typing import Optional

from flask import session, jsonify

from data_base_module import DB_conn, SqlPg
from fsm_request_module import FsmSend
from config import fsm_rep_link, ldap
from loguru import logger


def set_guid(
    domain_user: Optional[str] = None,
):
    with SqlPg(db_name="ITI_DEF") as db:
        # определяем objectguid вошедшего на форму
        objectguid_sql = f"SELECT DISTINCT objectguid \
                    FROM  fdw_staff.ldap_account \
                    WHERE samaccountname = '{domain_user}'"
        guid = db.exec(objectguid_sql)[0][0]
        session["guid"] = guid
    # print('твой objectguid = ', guid )
    return jsonify(guid)


def request_method_GET(
    domain_user: Optional[str] = None,
):
    list_data = []
    list_sql = f"""with RECURSIVE sub_group AS (
        SELECT 
            0 AS level,
            g.dbid AS id,
            g.parent_sapm_group_id,
            ('/'::text || (g.name)::text) AS path,
            ('/'::text || (g.name)::text) as root_path, 
            (json_data.json_data ->> 'owner_username'::text) AS owner_username
        FROM ****** g
        CROSS JOIN LATERAL users.f_to_json((g.description)::text, true, true) json_data(json_data)
        WHERE g.parent_sapm_group_id = 128410849 --and (json_data.json_data ->> 'owner_username'::text) = '{domain_user}'
        UNION ALL
        select 
            (sub_group_1.level + 1),
            sapm_group.dbid AS id,
            sapm_group.parent_sapm_group_id,
            ((sub_group_1.path || '/'::text) || (sapm_group.name)::text),
            sub_group_1.root_path,
            sub_group_1.owner_username
        FROM (******
            JOIN sub_group sub_group_1 ON ((sub_group_1.id = sapm_group.parent_sapm_group_id)))
        )
        , user_data as ( 
            SELECT
                ldap_map.sc_user_id as user_id
            FROM ****** ldap_map
            JOIN fdw_scdb.t_user sc_user ON sc_user.user_id = ldap_map.sc_user_id
            WHERE 
            sc_user.user_eid = '{domain_user}'
        )
        ,
        group_permissions as (
        SELECT  
            group_perms.sapm_group_id,
            group_perms.permission,
            group_perms.user_group_id
        FROM ****** group_perms 
        )
        ,
        user_access as (
        select  
            sapm_group_id AS id,
            "permission",
            user_group_id
        FROM ****** group_perms
        JOIN fdw_scdb.t_group_users group_users ON (((group_users.group_id)::text = (group_perms.user_group_id)::text))
        JOIN fdw_scdb.t_user usr ON (((usr.user_id)::text = (group_users.user_id)::text))
        WHERE usr.user_id = (select user_id from user_data)
        )
        ,
        owner_access2 as (
        select distinct 
            sub_group.id,
            sub_group.root_path,
            sub_group.path,
            sub_group.owner_username,
            "permission",
            user_group_id
        from ***
        left JOIN group_permissions gp ON gp.sapm_group_id = sub_group.id
        where sub_group.owner_username  = '{domain_user}'
        )
        ,
        user_access2 as (
            SELECT
                user_access.id,
                sub_group.root_path,
                sub_group.path,
                sub_group.owner_username,
                "permission",
                user_group_id
            FROM ***
            inner join sub_group on user_access.id = sub_group.id
        )
        ,
        I as (
        select 
            * 
        from ***
        union all
        select 
            * 
        from *** ua
        where NOT exists(
                SELECT 1 FROM *** oa
                WHERE oa.id = ua.id and oa."permission" = ua."permission" and oa.user_group_id = ua.user_group_id) 
        )
        SELECT distinct 
            oa.root_path,
            oa.path,
            oa.owner_username,
            CASE WHEN gmap.ext_source = 'FSM' THEN 'fsm_group'
                WHEN gmap.ext_source = 'LDAP' THEN 'ldap_group'
                WHEN gmap.ext_source IS NULL AND usr_group.group_eid LIKE 'pg-%' THEN 'employee_account'
                WHEN gmap.ext_source IS NULL AND usr_group.group_eid LIKE 'tg-%' THEN 'service_account'
                ELSE NULL END AS subject_type,
            CASE WHEN gmap.ext_source IS NULL THEN usr_group.group_eid ELSE gmap.ext_group_name END AS subject_name,
            oa."permission"
        FROM * oa
            LEFT JOIN users.group_map gmap ON gmap.sc_group_id = oa.user_group_id
            left JOIN fdw_scdb.t_group usr_group ON (((usr_group.group_id)::text = (oa.user_group_id)::text)) """
    list_result = SqlPg(db_name="ITI_DEF").exec(list_sql)
    for i in list_result:
        list_data.append(
            (
                [
                    i[1][1:],
                    i[2],
                    "FSM группа",
                    i[4] if not i[4].startswith("pg-") else i[4][3:],
                    (
                        "Чтение и изменение"
                        if i[5] in ["FULL_CONTROL", "READ_WRITE"]
                        else "Только чтение"
                    ),
                ]
            )
            if i[3] == "fsm_group"
            else (
                (
                    [
                        i[1][1:],
                        i[2],
                        "LDAP группа",
                        i[4] if not i[4].startswith("pg-") else i[4][3:],
                        (
                            "Чтение и изменение"
                            if i[5] in ["FULL_CONTROL", "READ_WRITE"]
                            else "Только чтение"
                        ),
                    ]
                )
                if i[3] == "ldap_group"
                else (
                    [
                        i[1][1:],
                        i[2],
                        "Пользователь",
                        i[4] if not i[4].startswith("pg-") else i[4][3:],
                        (
                            "Чтение и изменение"
                            if i[5] in ["FULL_CONTROL", "READ_WRITE"]
                            else "Только чтение"
                        ),
                    ]
                )
            )
        )
    session["list_data"] = list_data

    return list_data


def request_method_POST(
    domain_user: Optional[str] = None,
    data: Optional[str] = None,
):
    desc = "Владелец каталога" if data["action"] == "Создать" else "Текущий владелец каталога"

    if "catalog_owner" in data:
        owner = data["catalog_owner"]
        start_index = owner.find("(") + 1
        end_index = owner.find(")")
        if start_index != -1 and end_index != -1 and start_index < end_index:
            owner = owner[start_index:end_index].strip()
    else:
        owner = None

    if data["action"] == "Создать":
        description = [
            f"Действие: {data['action']}" if "action" in data else "",
            f"Тип каталога: {data['catalog_type']}" if "catalog_type" in data else "",
            f"Имя каталога: {data['catalog_name']}" if "catalog_name" in data else "",
            f"{desc}: {owner}" if owner else "",
            (f"Новый владелец: {data['new_catalog_owner']}" if "new_catalog_owner" in data else ""),
            (
                f"Отключить функционал согласования доступа к секретам на уровне каталога: Да"
                if "isec_approval" in data
                else "Отключить функционал согласования доступа к секретам на уровне каталога: Нет"
            ),
            (
                f"Обоснование для ИБ: {data['isec_reason']}"
                if "isec_reason" in data
                else "Обоснование для ИБ: Null"
            ),
        ]
    else:
        description = [
            f"Действие: {data['action']}" if "action" in data else "",
            f"Тип каталога: {data['catalog_type']}" if "catalog_type" in data else "",
            f"Имя каталога: {data['catalog_name']}" if "catalog_name" in data else "",
            f"{desc}: {owner}" if owner else "",
            (f"Новый владелец: {data['new_catalog_owner']}" if "new_catalog_owner" in data else ""),
        ]

    if "table_data" in data and len(data["table_data"]) > 0:
        cat_access = ",".join(
            str(lst).replace("[", "").replace("]", "").replace(",", ";").replace("'", "")
            for lst in data["table_data"]
        )
        cat_access = cat_access.split(",")
        description.append(f"Доступы к каталогам:")
        for i in cat_access:
            description.append(i)
    elif data["action"] == "Удалить" or data["action"] == "Сменить владельца":
        pass
    else:
        description.append(f"Доступы к каталогам:")

    description = [item for item in description if item]
    # for item in description:
    #     print(item)
    return description


def fetch_get_cat():
    global created_cat
    created_cat = []
    main_catalogs = []

    domain_user = session.get("domain_user")
    guid = session.get("guid")
    all_owner_dict = session.get("all_owner_dict")
    you_owner_dict = session.get("you_owner_dict")
    list_data = session.get("list_data")

    with SqlPg(db_name="ITI_DEF") as db:
        created_cat_sql = f"SELECT path FROM ******"
        created_cat_result = db.exec(created_cat_sql)
        unique_values = set()
        for item in created_cat_result:
            # Извлекаем последний элемент пути
            value = item[0].split("/")[1]
            # Проверяем, есть ли значение в множестве unique_values
            if value not in unique_values:
                # Добавляем значение в all_path и unique_values
                created_cat.append(value)
                unique_values.add(value)

        paths_sql = "WITH RECURSIVE sub_group AS (\
                                SELECT \
                                    0 AS level,\
                                    g.dbid AS id,\
                                    ('/'::text || (g.name)::text) AS path,\
                                    ('/'::text || (g.name)::text) as root,\
                                    g.description \
                                FROM f*** g\
                                WHERE g.parent_sapm_group_id = 128410849\
                                UNION ALL\
                                SELECT\
                                    (sub_group_1.level + 1),\
                                    sapm_group.dbid AS id,\
                                    ((sub_group_1.path || '/'::text) || (sapm_group.name)::text),\
                                    sub_group_1.root,\
                                    sub_group_1.description\
                                FROM (*** sapm_group\
                                    JOIN sub_group sub_group_1 ON ((sub_group_1.id = sapm_group.parent_sapm_group_id)))\
                                )\
                        SELECT  \
                            sub_group.root,\
                            sub_group.path, \
                            (json_data.json_data ->> 'owner_username'::text) AS owner_username\
                        FROM ***\
                        CROSS JOIN LATERAL users.f_to_json((sub_group.description)::text, true, true) json_data(json_data)\
                        --where sub_group.level != 0 \
                        "

        paths = db.exec(paths_sql)

        root_cat = sorted(set(i[0][1:] for i in paths))
        child_cat = sorted(set(i[1][1:] for i in paths if i[0] != i[1]))

        for root, path, owner in paths:
            if owner != None:
                if owner not in all_owner_dict:
                    all_owner_dict[owner] = []
                all_owner_dict[owner].append(root[1:])

        you_cat = set((i[0], i[1]) for i in list_data)

        for path, owner in you_cat:
            if owner not in you_owner_dict:
                you_owner_dict[owner] = []
            you_owner_dict[owner].append(path)

        all_catalogs = list({(i[0][1:]) for i in paths})
        catalogs = [str(item[0]) for item in you_cat]
        main_catalogs = list(set(all_owner_dict[domain_user]))

    response = jsonify(
        {
            "message": "DATA OK",
            "root_cat": root_cat,
        }
    )

    return response


def fetch_find_UserCatalogt(data, attributes, permutations_list):
    all_combinations = []
    for perm in permutations_list:
        combination = []
        for i in range(len(perm)):
            combination.append(f"({attributes[i]}={perm[i]})")
        all_combinations.append("".join(combination))

    all_combinations = [f"(&{''.join(comb)}(mail=*@*.ru))" for comb in all_combinations]

    filter1 = f"(&(sAMAccountName=*{data}*)(|(mail=*@*.ru)(mail=*@*.ru)))"
    filter2 = f"(&(description=*{data}*)(mail=*@*.ru))"
    filter3 = f' "".join(all_combinations) + ")" '

    # поиск русского имени или AD-учетки
    in_search_filter = f"(|{filter1}{filter2}" + "".join(all_combinations) + ")"

    search_result = str(
        ldap.search(
            search_filter=in_search_filter,
            attributes=["sAMAccountName", "DistinguishedName", "description", "mail"],
        )
    )

    y = ((search_result).replace("[", "")).replace("]", "").replace(", DN:", "DN:")

    x = y.split("DN:")
    x.pop(0)

    for i in x:
        # Убираем лишние пробелы и символы новой строки
        entry = i.replace("    ", "")

        entry = entry.replace("\n", "||")
        employees = "OU=Employees,OU=IDM,DC=*,DC=ru"

        if employees.lower() in entry.lower():
            # Разделяем строку на части
            parts = entry.split("||")
            # Инициализируем переменные для description и mail и distinguishedName
            description = ""
            sAMAccountName = ""
            distinguishedName = ""

            # Проходим по частям и ищем нужные
            for part in parts:
                if "description:" in part:
                    description = part.split("description:")[1].strip()
                elif "sAMAccountName:" in part:
                    sAMAccountName = part.split("sAMAccountName:")[1].strip()
                    sAMAccountName = f"({sAMAccountName})"
                short = [description, sAMAccountName]
            # Формируем конечный список
            x[x.index(i)] = short
        else:
            x.remove(i)
    return x


def fetch_ADfindGroupCatalog(data: str):
    formatted_result = []
    in_search_filter = f"(&(sAMAccountName=*{data}*)(ObjectClass=group))"
    result = str(
        ldap.search(
            search_base="dc=*,dc=ru",
            search_filter=str(in_search_filter),
            attributes=["sAMAccountName", "mail", "managedBy"],
        )
    )
    search_result = ((result).replace("[", "")).replace("]", "")

    # Функция для извлечения имени менеджера и sAMAccountName из строки
    def extract_group_manager(data):
        # Разделяем данные по запятым, чтобы обработать каждый элемент
        entries = data.split(", ")
        group_info_list = []
        for entry in entries:
            # Регулярные выражения для извлечения имени менеджера и имени группы
            manager_match = re.search(r"managedBy:\s*CN=([A-Za-z\s]+)", entry)
            group_match = re.search(r"sAMAccountName:\s*([^\s]+)", entry)

            manager = manager_match.group(1) if manager_match else "не найдено"
            group_name = group_match.group(1) if group_match else "не найдено"

            if manager == "не найдено":
                pass  # сделано что бы не показывать группы без менеджеров
                # иначе использовать:
                # group_info_list.append(f"{group_name}")
            else:
                search_filter = f"(|(cn=*{manager}*)(displayName=*{manager}*)(givenName=*{manager}*)(sn=*{manager}*))"
                manager_search = str(
                    ldap.search(
                        search_base="OU=Employees,OU=IDM,DC=*,DC=ru",
                        search_filter=search_filter,
                        attributes=["sAMAccountName"],
                    )
                )
                manager = manager_search.split("sAMAccountName: ")
                manager = manager[1].strip().replace("]", "").replace("\n", "").replace("\r", "")
                group_info_list.append(f"{group_name} (менеджер: {manager})")
        return group_info_list

    if len(search_result) > 2:
        formatted_result = extract_group_manager(search_result)
        x = formatted_result
    else:
        x = []

    return x


def fetch_FSMfindGroupCatalog(data):
    sql = f"SELECT name AS group_name, WDMANAGERNAME AS group_manager FROM *** where UPPER(name) like UPPER('%{data}%') and WDMANAGERNAME IS NOT NULL "

    with DB_conn(fsm_rep_link) as db:
        x = db.exec(sql)
        # print('x', x)
    return x
