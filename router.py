import datetime

from flask import Blueprint, request, render_template

from flask import (
    Blueprint,
    request,
    render_template,
    jsonify,
    session,
)

from loguru import logger

from decorators import apology_decorator
from config import fsm_rep_link, ldap
from data_base_module import DB_conn, SqlPg
from fsm_request_module import FsmSend

from .forms import PamCatalog

from .queries import (
    fetch_ADfindGroupCatalog,
    fetch_FSMfindGroupCatalog,
    fetch_find_UserCatalogt,
    fetch_get_cat,
    request_method_GET,
    request_method_POST,
    set_guid,
)

pam_catalog_route = Blueprint(
    "pam_catalog",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/pam_catalog/static",
)

created_cat = []


@pam_catalog_route.route("/pam_catalog", methods=["GET", "POST"])
@apology_decorator
def pam_catalog():
    global created_cat
    domain_user = request.headers.get("X-Remote-User")
    form = PamCatalog(request.form)

    if domain_user:
        """Список всех групп пользователя"""
        user_group = ldap.members_ldap(domain_user.strip())
        target_group = [
            "***-******",
            "***-***",
        ]
        found = False  # переменная для отслеживания найденного значения

        for item in target_group:
            if item.upper() in user_group:
                found = True
                access_group = [item.upper()]
                break  # прерываем цикл, если нашли хотя бы одно значение
            else:
                access_group = []

        # закрытие ветки только для групп из target_group
        if found:
            pass
        else:
            return render_template("no_service.html")

    guid, you_cat, all_cat, paths, list_result = "", "", "", "", ""

    list_data = []
    root_cat = []
    child_cat = []
    all_owner_dict = {}
    you_owner_dict = {}
    answer = {}

    session["domain_user"] = domain_user
    session["all_owner_dict"] = all_owner_dict
    session["list_data"] = list_data
    session["root_cat"] = root_cat
    session["child_cat"] = child_cat
    session["you_owner_dict"] = you_owner_dict
    session["answer"] = answer
    session["access_group"] = access_group

    set_guid(domain_user)

    if request.method == "GET":
        request_method_GET(domain_user)
        list_data = session.get("list_data")

        return render_template(
            "pam_catalog.html",
            form=form,
            user_name=domain_user,
            all_owner_dict=all_owner_dict,
            you_owner_dict=you_owner_dict,
            list_data=list_data,
            root_cat=root_cat,
            child_cat=child_cat,
            answer=answer,
            access_group=access_group,
        )

    if request.method == "POST":
        data = request.get_json()

        description = request_method_POST(domain_user, data)

        def if_send(domain_user, data):
            send_obj = FsmSend(prod_trigger=True)

            fields_array = {}
            approval_counter = 1

            if data["action"] == "Создать":
                fields_array["theme"] = "create"
                if domain_user != data["catalog_owner"]:
                    fields_array[f"Approval{approval_counter}"] = data["catalog_owner"]
                    approval_counter += 1
                else:
                    pass

                for i in data["table_data"]:
                    if i[0] == "Пользователь" and domain_user != i[1]:
                        fields_array[f"Approval{approval_counter}"] = i[1]
                        approval_counter += 1
                    else:
                        pass

            elif data["action"] == "Удалить":
                fields_array["theme"] = "delete"
                if domain_user != data["catalog_owner"]:
                    fields_array[f"Approval{approval_counter}"] = data["catalog_owner"]
                else:
                    pass

            elif data["action"] == "Сменить владельца":
                fields_array["theme"] = "change_owner"
                if domain_user != data["catalog_owner"]:
                    fields_array[f"Approval{approval_counter}"] = data["catalog_owner"]
                    approval_counter += 1
                else:
                    pass
                if domain_user != data["new_catalog_owner"]:
                    fields_array[f"Approval{approval_counter}"] = data[
                        "new_catalog_owner"
                    ]
                    approval_counter += 1
                else:
                    pass

            elif data["action"] == "Управление доступом":
                fields_array["theme"] = "access_man"
                for i in data["table_data"]:
                    if domain_user != i[2]:
                        fields_array[f"Approval{approval_counter}"] = i[2]
                        approval_counter += 1
                    else:
                        pass

                    if i[3] == "Пользователь" and domain_user != i[4]:
                        fields_array[f"Approval{approval_counter}"] = i[4]
                        approval_counter += 1
                    else:
                        pass

            if data.get("managers"):
                for i in data["managers"]:
                    fields_array[f"Approval{approval_counter}"] = i
                    approval_counter += 1
            else:
                pass

            if data.get("isec_approval"):
                fields_array[f"Approval{approval_counter}"] = "***"
            else:
                pass

            # Сохраняем уникальные значения для ключей, начинающихся с 'Approval'
            unique_values = set()
            filtered_fields_array = {}

            # Обрабатываем сначала все ключи, начинающиеся с 'Approval'
            unique_count = 1
            for key, value in fields_array.items():
                if key.startswith("Approval"):
                    # Пропускаем повторяющиеся значения
                    if value not in unique_values:
                        new_key = f"Approval{unique_count}"
                        filtered_fields_array[new_key] = value
                        unique_values.add(value)
                        unique_count += 1
                else:
                    # Ключи, не начинающиеся с 'Approval', добавляем без изменений
                    filtered_fields_array[key] = value

            # print("unique_count = ", unique_count)
            if unique_count >= 25:
                return {
                    "message": "alert",
                    "user_name": domain_user,
                    "answer": "Внимание",
                    "text": "К сожалению в системе FSM не может быть более 25 согласующих. Пожалуйста указывайте в доступах группы.",
                }
            else:
                pass

            fields_array = filtered_fields_array
            sysdesc = [
                f"Технологические запросы (ИТ,ТД) :: Управление привилегированными УЗ (PAM) :: Single Connect :: Управление Каталогами",
                f"Дата: {str(datetime.datetime.now())}",
            ]

            send_obj.create_sd(
                secret_param=secret_param,
            )

            return send_obj.make_fsm_request()

        answer = if_send(domain_user=domain_user, data=data)
        errors_file_list = []
        list_data = session.get("list_data")

        response = jsonify(
            {
                "message": "DATA OK",
            }
        )
        return response


@pam_catalog_route.route("/get_cat", methods=["GET", "POST"])
def get_cat():
    response = fetch_get_cat()
    return response


@pam_catalog_route.route("/findUserCatalog", methods=["POST"])
def find_catalog_user():
    def permutations(lst, start=0):
        if start == len(lst):
            yield lst.copy()
        else:
            for i in range(start, len(lst)):
                lst[start], lst[i] = lst[i], lst[start]
                yield from permutations(lst, start + 1)
                lst[start], lst[i] = lst[i], lst[start]

    data = request.get_json()
    FIO = data.strip().split(" ")

    attributes = ["givenName", "sn", "middleName"]

    permutations_list = list(permutations(FIO))

    x = fetch_find_UserCatalogt(data, attributes, permutations_list)

    if len(x) > 0:
        response = jsonify({"message": "users find", "users": x})
    else:
        response = jsonify(
            {
                "message": f"""Учетная запись не найдена. 
                            Проверьте корректность введенных данных и повторите поиск."""
            }
        )
    return response


@pam_catalog_route.route("/ADfindGroupCatalog", methods=["POST"])
def find_catalog_group_ad():
    data = request.get_json()
    x = fetch_ADfindGroupCatalog(data)

    if len(x) > 0:
        response = jsonify({"message": "users find", "users": x})
    else:
        response = jsonify(
            {
                "message": "Данная группа в AD не найдена. \nПроверьте корректность введенных данных и повторите поиск."
            }
        )
    return response


@pam_catalog_route.route("/FSMfindGroupCatalog", methods=["POST"])
def find_catalog_group_fsm():
    data = request.get_json()
    x = fetch_FSMfindGroupCatalog(data)

    if len(x) > 0:
        response = jsonify({"message": "users find", "users": x})
    else:
        response = jsonify(
            {
                "message": "Данная группа в FSM не найдена. \nПроверьте корректность введенных данных и повторите поиск."
            }
        )
    return response


@pam_catalog_route.route("/findOwnerCatalog", methods=["POST"])
def find_catalog_owner():
    find_catalog_user()
