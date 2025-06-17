// определение что окно находится во фрейме
window.onload = function () {
    inIframe();
};

// функция для скрытия шапки если окно внутри фрейма
function inIframe() {
    try {
        if (window.self !== window.top) {
            navbar = document.querySelector('.navbar');
            navbar.style.display = 'none';
        }
    } catch (e) {

    }
};

function HideUnhide(true_or_false, id = '', tag_class = []) {
    if (Array.isArray(tag_class) && tag_class.length > 0) {
        tag_class.forEach((tag) => {
            area = document.querySelectorAll('.' + tag);
            area.forEach((item) => {
                item.hidden = true_or_false;
            });
        });
    }
    if (typeof tag_class === 'string' && tag_class !== '') {
        area = document.querySelectorAll('.' + tag_class);
        area.forEach((item) => {
            item.hidden = true_or_false;
        });
    }
    if (!!id) {
        tag = document.getElementById(id);
        tag.hidden = true_or_false;
    }
}

function ReqClasses(tag_classes, true_or_false) {
    if (Array.isArray(tag_classes)) {
        tag_classes.forEach((tag_class) => {
            required_area = document.querySelectorAll('.' + tag_class);
            required_area.forEach((item) => {
                item.required = true_or_false;
            })
        })
    } else {
        required_area = document.querySelectorAll('.' + tag_classes);
        required_area.forEach((tag_class) => {
            tag_class.required = true_or_false;
        });
    }
}
// функция добавления строки в таблицу
function RowToTable(id = '', tag_class = '', button) {

    const formContainer = document.getElementById(id);
    const originalForm = formContainer.querySelector("." + id);

    const parentDiv = formContainer.parentElement.parentElement;
    const values = formContainer.querySelectorAll('textarea, select, input');

    const userType = formContainer.querySelector('.UserType');
    const user_group = formContainer.querySelector('#NewCatalogOwner');

    if (formContainer.querySelector('.AccessType')) {
        var accessType = formContainer.querySelector('.AccessType');
    }
    else {
        var accessType = 'None';
    }

    const table_tbody = document.querySelectorAll('.' + tag_class + ' tbody tr');

    // Проверка на пустые значения
    if (userType.value === '' || user_group.disabled === false || accessType.value === '') {
        button.disabled = true;
        return;
    }
    else if (userType.value !== '' && user_group.disabled !== false && accessType.value !== '') {
        button.disabled = false;
    }

    // Проверка на дубликаты
    for (let row of table_tbody) {
        const cells = row.querySelectorAll('td');
        if (cells.length > 3) {
            const [userTypeCell, userGroupCell, accessTypeCell] = cells;
            if (userTypeCell.textContent.trim() === userType.value &&
                userGroupCell.textContent.trim() === user_group.value &&
                accessTypeCell.textContent.trim() === accessType.value) {
                user_group.value = ''
                user_group.placeholder = 'Введите новое значение';
                button.disabled = true;
                button.classList.remove('btn-success');
                alert('Вы пытаетесь добавить дубликат строки');
                return;
            }
        }
        else {
            const [userTypeCell, userGroupCell] = cells;
            if (userTypeCell.textContent.trim() === userType.value &&
                userGroupCell.textContent.trim() === user_group.value) {
                user_group.value = ''
                user_group.placeholder = 'Введите новое значение';
                button.disabled = true;
                button.classList.remove('btn-success');
                alert('Вы пытаетесь добавить дубликат строки');
                return;
            }
        }
    }

    // Добавление новой строки
    const tbody = document.querySelector('.' + tag_class + ' tbody');

    const removeButton = document.createElement("button");
    removeButton.setAttribute("type", "button");
    removeButton.setAttribute("class", 'btn btn-secondary btn-danger btn-sm ml-2 align-middle');
    removeButton.setAttribute("onclick", "removeRow(this)");
    removeButton.setAttribute("data-toggle", "tooltip");
    removeButton.setAttribute("title", "Удалить строку");
    removeButton.textContent = "X";

    const tbodyRow = document.createElement('tr');
    for (var j = 0; j < values.length; j++) {

        const td = document.createElement('td');
        td.textContent = values[j].value;

        tbodyRow.appendChild(td);
    }

    const td = document.createElement('td');
    tbodyRow.appendChild(td);
    const lastTd = tbodyRow.querySelector('td:last-of-type');
    lastTd.appendChild(removeButton);

    tbody.appendChild(tbodyRow);

    let findButton = document.createElement('button');
    findButton.type = 'button';
    findButton.id = 'find';
    findButton.className = 'row btn btn-secondary OriginalForm';
    findButton.setAttribute('onclick', 'findUser(this)');
    findButton.setAttribute('data-toggle', 'modal');
    findButton.setAttribute('data-target', '#UserFind');
    findButton.setAttribute('style', 'margin-left: 1rem');
    findButton.textContent = 'Найти';

    user_group.parentElement.removeChild(user_group.parentElement.lastChild);
    user_group.parentElement.appendChild(findButton);

    user_group.value = ''
    user_group.placeholder = 'Введите новое значение';
    user_group.disabled = false;
    userType.disabled = false;
    accessType.value = '';
    accessType.placeholder = 'Выбрать...';
    button.disabled = true;
    button.classList.remove('btn-success');
}

function removeRow(button) {
    var row = button.parentNode.parentNode;
    var table = row.parentElement;
    table.removeChild(row);
    copyCount--;
}

function deleteRows(tag_class = '') {
    var tbodyList = document.querySelectorAll('.' + tag_class + ' tbody');
    tbodyList.forEach(function (tbody) {
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
    });
    copyCount = 0;
}

function SecretAccessChecked(SecretAccess, true_or_false = true) {
    decision = SecretAccess.checked ? true_or_false : !true_or_false;
    HideUnhide(!decision, '', 'Reason');
    ReqClasses('Reason', decision)
    return decision;
}

function IncludeShow(IncludeShow, true_or_false = true) {
    decision = IncludeShow.checked ? true_or_false : !true_or_false;
    HideUnhide(!decision, '', 'IncludeShow');
    document.querySelector('[name="child_cat"]').value = ''
    document.querySelector('[name="child_cat"]').hidden = !decision
    return decision;
}

function sendShow(tag_class) {
    rowCount = document.querySelectorAll('.' + tag_class + ' tbody tr');
    if (rowCount.length > 0) {
        HideUnhide(false, 'send', '');
        sendButton.classList.remove('btn-secondary');
        sendButton.classList.add('btn-success');
        sendButton.disabled = false;
    }
    else {
        HideUnhide(true, 'send', '');
        sendButton.disabled = true;
        sendButton.classList.remove('btn-success');
        sendButton.classList.add('btn-secondary');
    }
}

// Получаем элементы таблиц и кнопок
var tableTop = document.querySelector('.table-top tbody');
var tableBot = document.querySelector('.table-bot tbody');
var addBtn = document.getElementById('addButton');
var deleteBtn = document.getElementById('deleteButton');
var cancelBtn = document.getElementById('cancelButton');
var continueBtn = document.getElementById('continueButton');
var result = []


async function findOwner(button) {

    var parentElement = button.parentNode;

    var inputElement = parentElement.querySelector('input');
    var user = inputElement.value.trim();

    var dataTargetValue = button.getAttribute('data-target');

    elementList = document.getElementById('elementList');
    elementList.innerHTML = '';

    var modalBody = document.querySelector(`${dataTargetValue} .modal-body`);
    var modalGif = document.createElement('div');
    modalGif.className = 'd-flex justify-content-center';
    modalGif.innerHTML = '<img src="../static/images/mf_gif_1.gif" alt="Загрузка..." style="width: 30%;">';

    if (user == '' || user == ' ') {
        setTimeout(function () {
            $('#UserFind').modal('hide');
        }, 1000);
        inputElement.value = '';
        inputElement.style.backgroundColor = 'pink'
        inputElement.placeholder = 'Не нужно искать пустоту...'
    }
    else {
        modalBody.appendChild(modalGif);
        fetch('/findUserCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response => {
                modalBody.removeChild(modalGif)
                return response.json()
                    .then(data => {
                        // Добавляем элементы в список из данных, полученных от бекенда
                        if (data.users) {
                            data.users.forEach(item => {
                                var listItem = document.createElement('li');
                                listItem.className = 'list-group-item d-flex justify-content-between';
                                listItem.textContent = item[0] + ' ' + item[1];

                                var chooseButton = document.createElement('button');
                                chooseButton.textContent = 'Выбрать';
                                chooseButton.className = 'btn btn-sm btn-secondary';
                                chooseButton.addEventListener('click', () => {
                                    inputElement.value = item[1].replace(/[()]/g, '');
                                    $('#UserFind').modal('hide'); // Закрываем модальное окно
                                    listItem.parentNode.removeChild(listItem);
                                    inputElement.style.backgroundColor = 'lightgreen';
                                    inputElement.disabled = true;
                                    inputElement.parentNode.removeChild(oldElement);
                                    inputElement.parentNode.appendChild(newElement);
                                });

                                var clearButton = document.createElement('button');
                                clearButton.textContent = 'Изменить';
                                clearButton.className = 'btn btn btn-secondary ml-2';
                                let oldElement = button
                                let newElement = clearButton
                                clearButton.addEventListener('click', () => {
                                    inputElement.value = ''; // Очищаем поле ввода
                                    inputElement.style.backgroundColor = '';
                                    inputElement.placeholder = ''
                                    inputElement.disabled = false;  // Разблокируем поле ввода
                                    inputElement.parentNode.removeChild(newElement); // Удаляем эту кнопку
                                    inputElement.parentNode.appendChild(oldElement); // Удаляем эту кнопку
                                });
                                listItem.appendChild(chooseButton);
                                elementList.appendChild(listItem);
                            });
                        } else {
                            var listItem = document.createElement('li');
                            listItem.textContent = data.message
                            elementList.appendChild(listItem);

                            inputElement.value = '';
                            inputElement.style.backgroundColor = 'pink'
                            inputElement.placeholder = 'Не найдено. Проверьте корректность имени'
                            inputElement.disabled = false;
                        }
                    });
            });
    }
}

function findUser(button) {
    // Получаем родительский элемент для нажатой кнопки
    var parentElement = button.parentNode;
    var dataTargetValue = button.getAttribute('data-target');

    if (parentElement.parentElement.querySelector('select.UserType')) {
        var selectElement = parentElement.parentElement.querySelector('select.UserType');
    } else {
        var selectElement = '';
    }

    if (parentElement.parentElement.querySelector('input')) {
        var inputElement = parentElement.parentElement.querySelector('input');
    } else {
        var inputElement = '';
    }

    if (parentElement.parentElement.querySelector('select.AccessType')) {
        var selectAccessType = parentElement.parentElement.querySelector('select.AccessType');
    } else {
        var selectAccessType = '';
    }

    if (dataTargetValue == '#UserSelect') {
        elementList = document.querySelector('#elementList.UserSelect');
        elementList.innerHTML = '';
        button_add = parentElement.parentElement.parentElement.querySelector('button[type="button"].UserSelect');
        add_row = document.getElementById('add_row')
    } else if (dataTargetValue == '#UserFind') {
        elementList = document.querySelector('#elementList.UserFind');
        elementList.innerHTML = '';
        button_add = parentElement.parentElement.querySelector('button[type="button"].UserFind');
    }

    button_add.disabled = true;
    button_add.classList.remove('btn-success');

    var user = inputElement.value.trim();

    var modalBody = document.querySelector(`${dataTargetValue} .modal-body`);
    var modalGif = document.createElement('div');
    modalGif.className = 'd-flex justify-content-center';
    modalGif.innerHTML = '<img src="../static/images/mf_gif_1.gif" alt="Загрузка..." style="width: 30%;">';

    if (user == '' || user == ' ') {
        setTimeout(function () {
            if (button.id == 'find') {
                $('#UserFind').modal('hide');
            }
            else {
                $('#UserSelect').modal('hide');
                $('#CatalogSelect').modal('show');
            }
        }, 1000);
        inputElement.placeholder = 'Не нужно искать пустоту...'
        button_add.disabled = true;
        button_add.classList.remove('btn-success');
    } else {
        if (selectElement.value == 'Пользователь') {
            modalBody.appendChild(modalGif);
            // Выполняем поиск в LDAP по значению
            fetch('/findUserCatalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(response => {
                    modalBody.removeChild(modalGif);
                    return response.json()
                        .then(data => {
                            // Добавляем элементы в список из данных, полученных от бекенда
                            if (data.users) {
                                data.users.forEach(item => {
                                    var listItem = document.createElement('li');
                                    listItem.className = 'list-group-item d-flex justify-content-between';
                                    listItem.textContent = item[0] + ' ' + item[1];

                                    var chooseButton = document.createElement('button');
                                    chooseButton.textContent = 'Выбрать';
                                    chooseButton.className = 'btn btn-sm btn-secondary';
                                    chooseButton.addEventListener('click', () => {
                                        inputElement.value = item[1].replace(/[()]/g, '');
                                        if (button.id == 'find') {
                                            $('#UserFind').modal('hide');
                                        } else {
                                            $('#UserSelect').modal('hide'); // Закрываем модальное окно
                                            listItem.parentNode.removeChild(listItem);
                                            $('#CatalogSelect').modal('show');
                                        }
                                        selectElement.disabled = true;
                                        inputElement.disabled = true;
                                        inputElement.parentNode.removeChild(oldElement);
                                        inputElement.parentNode.appendChild(newElement);
                                        add_row.removeAttribute('disabled');
                                        add_row.classList.add('btn-success');
                                    });

                                    var clearButton = document.createElement('button');
                                    clearButton.textContent = 'Изменить';
                                    clearButton.className = 'btn btn btn-secondary ml-2';
                                    let oldElement = button
                                    let newElement = clearButton
                                    clearButton.addEventListener('click', () => {
                                        inputElement.value = ''; // Очищаем поле ввода
                                        inputElement.disabled = false;  // Разблокируем поле ввода
                                        selectElement.disabled = false;
                                        inputElement.parentNode.removeChild(newElement); // Удаляем эту кнопку
                                        inputElement.parentNode.appendChild(oldElement);
                                    });
                                    listItem.appendChild(chooseButton);
                                    elementList.appendChild(listItem);
                                });
                            } else {
                                var listItem = document.createElement('li');
                                listItem.textContent = data.message
                                elementList.appendChild(listItem);

                                inputElement.value = '';
                                inputElement.placeholder = 'Пользователь - не найден.';
                                button_add.disabled = true;
                                button_add.classList.remove('btn-success');
                            }
                        });
                });
        }
        else if (selectElement.value == 'Группа AD') {
            modalBody.appendChild(modalGif);
            // Выполняем поиск в LDAP по значению
            fetch('/ADfindGroupCatalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(response => {
                    modalBody.removeChild(modalGif);
                    return response.json()
                        .then(data => {
                            if (data.users) {
                                data.users.forEach(item => {
                                    var listItem = document.createElement('li');
                                    listItem.className = 'list-group-item d-flex justify-content-between';
                                    listItem.textContent = item;

                                    var chooseButton = document.createElement('button');
                                    chooseButton.textContent = 'Выбрать';
                                    chooseButton.className = 'btn btn-sm btn-secondary';
                                    chooseButton.addEventListener('click', () => {
                                        inputElement.value = item;
                                        if (button.id == 'find') {
                                            $('#UserFind').modal('hide');
                                        }
                                        else {
                                            $('#UserSelect').modal('hide'); // Закрываем модальное окно
                                            listItem.parentNode.removeChild(listItem);
                                            $('#CatalogSelect').modal('show');
                                        }
                                        selectElement.disabled = true;
                                        inputElement.disabled = true;
                                        inputElement.parentNode.removeChild(oldElement);
                                        inputElement.parentNode.appendChild(newElement);
                                        add_row.removeAttribute('disabled');
                                        add_row.classList.add('btn-success');
                                    });

                                    var clearButton = document.createElement('button');
                                    clearButton.textContent = 'Изменить';
                                    clearButton.className = 'btn btn btn-secondary ml-2';
                                    let oldElement = button
                                    let newElement = clearButton
                                    clearButton.addEventListener('click', () => {
                                        inputElement.value = ''; // Очищаем поле ввода
                                        inputElement.disabled = false;  // Разблокируем поле ввода
                                        selectElement.disabled = false;
                                        inputElement.parentNode.removeChild(newElement); // Удаляем эту кнопку
                                        inputElement.parentNode.appendChild(oldElement);
                                    });
                                    listItem.appendChild(chooseButton);
                                    elementList.appendChild(listItem);
                                });
                            } else {
                                var listItem = document.createElement('li');
                                listItem.textContent = data.message
                                elementList.appendChild(listItem);

                                inputElement.value = '';
                                inputElement.placeholder = data.message;
                                button_add.disabled = true;
                                button_add.classList.remove('btn-success');
                            }
                        });
                });
        }
        else if (selectElement.value == 'Группа FSM') {
            modalBody.appendChild(modalGif);
            // Выполняем поиск в LDAP по значению
            fetch('/FSMfindGroupCatalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(response => {
                    modalBody.removeChild(modalGif);
                    return response.json()
                        .then(data => {
                            if (data.users) {
                                data.users.forEach(item => {
                                    var listItem = document.createElement('li');
                                    listItem.className = 'list-group-item d-flex justify-content-between';
                                    listItem.textContent = item[0] + " (менеджер: " + item[1] + ")";

                                    var chooseButton = document.createElement('button');
                                    chooseButton.textContent = 'Выбрать';
                                    chooseButton.className = 'btn btn-sm btn-secondary';
                                    chooseButton.addEventListener('click', () => {
                                        inputElement.value = item[0] + " (менеджер: " + item[1] + ")";
                                        if (button.id == 'find') {
                                            $('#UserFind').modal('hide');
                                        }
                                        else {
                                            $('#UserSelect').modal('hide'); // Закрываем модальное окно
                                            listItem.parentNode.removeChild(listItem);
                                            $('#CatalogSelect').modal('show');
                                        }
                                        selectElement.disabled = true;
                                        inputElement.disabled = true;
                                        inputElement.parentNode.removeChild(oldElement);
                                        inputElement.parentNode.appendChild(newElement);
                                        add_row.removeAttribute('disabled');
                                        add_row.classList.add('btn-success');
                                    });

                                    var clearButton = document.createElement('button');
                                    clearButton.textContent = 'Изменить';
                                    clearButton.className = 'btn btn btn-secondary ml-2';
                                    let oldElement = button
                                    let newElement = clearButton
                                    clearButton.addEventListener('click', () => {
                                        inputElement.value = ''; // Очищаем поле ввода
                                        inputElement.disabled = false;  // Разблокируем поле ввода
                                        selectElement.disabled = false;
                                        inputElement.parentNode.removeChild(newElement); // Удаляем эту кнопку
                                        inputElement.parentNode.appendChild(oldElement);
                                    });
                                    listItem.appendChild(chooseButton);
                                    elementList.appendChild(listItem);
                                });
                            } else {
                                var listItem = document.createElement('li');
                                listItem.textContent = data.message
                                elementList.appendChild(listItem);

                                inputElement.value = '';
                                inputElement.placeholder = data.message;
                                button_add.disabled = true;
                                button_add.classList.remove('btn-success');
                                add_row.disabled = true;
                                add_row.classList.remove('btn-success');
                            }
                        });
                });
        }

        else if (selectElement.value == '') {
            setTimeout(function () {
                if (button.id == 'find') {
                    $('#UserFind').modal('hide');
                }
                else {
                    $('#UserSelect').modal('hide');
                    $('#CatalogSelect').modal('show');
                }
            }, 1000);
            inputElement.value = '';
            inputElement.placeholder = 'Выберите тип слева';
            button_add.disabled = true;
            button_add.classList.remove('btn-success');
        }

    }
}

var you_owner_dict = you_owner_dict
var you_cat_dict = you_cat_dict
var all_owner_dict = all_owner_dict
var list_data = list_data
let created_cat

var range = ''
var owner_dict = {}
var owner = ''
var child_cat = child_cat

var sendButton = document.getElementById('send');

async function checkCatalogName() {

    var activeRadio = document.querySelectorAll('input[class="STEP_1"]');

    // Получаем элемент input по id
    var inputElement = document.querySelector('input#CatalogName.STEP_1_1_req');

    // Получаем введенное значение
    var inputValue = inputElement.value;
    // Преобразуем все элементы массива и введенное значение к нижнему регистру
    let lowerCaseCAT = created_cat.map(item => item.toLowerCase());
    let lowerCaseInput = inputValue.toLowerCase();

    if (lowerCaseCAT.includes(lowerCaseInput)) {
        // Если каталог уже существует, заменяем значение на плейсхолдер
        inputElement.style.backgroundColor = 'pink'
        inputElement.placeholder = inputElement.value
        inputElement.value = ''
        showError('Каталог с таким именем уже существует, выберите другое имя');  // Показываем сообщение об ошибке
    }
    else if (inputValue === '' || inputValue === ' ') {
        // Если каталог уже существует, заменяем значение на плейсхолдер
        showError('Не введено имя каталога');  // Показываем сообщение об ошибке
        inputElement.style.backgroundColor = 'pink';
    } else {
        clearError();  // Очищаем сообщение об ошибке, если значение правильное
        inputElement.style.backgroundColor = 'lightgreen';
    }

    function showError(message) {
        // Проверяем, существует ли элемент для вывода ошибок

        let errorMessageElement = document.getElementById('error-message');
        if (!errorMessageElement) {
            // Если элемент не существует, создаем его
            errorMessageElement = document.createElement('div');
            errorMessageElement.id = 'error-message';
            errorMessageElement.style.color = 'red';
            errorMessageElement.classList.add('col');
        }
        errorMessageElement.textContent = message;
        inputElement.parentNode.insertBefore(errorMessageElement, inputElement.nextSibling);
        sendButton.classList.remove('btn-success');
        sendButton.classList.add('btn-secondary');
        sendButton.disabled = true;
    }

    function clearError() {
        const errorMessageElement = document.getElementById('error-message');
        if (errorMessageElement) {
            errorMessageElement.textContent = '';  // Очищаем текст сообщения об ошибке
            errorMessageElement.parentNode.removeChild(errorMessageElement);
        }
        sendButton.classList.remove('btn-secondary');
        sendButton.classList.add('btn-success')
        sendButton.disabled = false;
    }
}

document.querySelectorAll('[id=CatalogName]').forEach(element => element.addEventListener('input', checkCatalogName));

function setOwner(input, id = '') {

    var catalog = input.value
    const IncludeCatalog = add_row.parentElement.parentElement.querySelectorAll('[name="IncludeCatalog"]');


    if (id) {
        var tbody = document.querySelector('#' + id + ' tbody');
    }

    if (child_cat) {
        var new_child_cat = child_cat.filter(item => item.startsWith(catalog));
        if (new_child_cat.length < 1) {
            HideUnhide(true, '', 'Include')
            IncludeShow('Include', true)
        } else {
            IncludeCatalog[0].checked = false
            HideUnhide(false, '', 'Include')
        }

        var datalist = document.getElementById('options_4_in');
        datalist.innerHTML = '';

        new_child_cat.forEach(item => {
            var option = document.createElement('option');
            option.value = item;
            datalist.appendChild(option);
        });
    }

    var owner_input = input.parentElement.parentElement.querySelector('#CatalogOwner, #NewCatalogOwner');

    if (range === 'all') {
        owner_dict = all_owner_dict;
    }
    else if (range === 'you') {
        owner_dict = you_owner_dict;
    }
    else if (range === 'only_you') {
        owner_dict = you_cat_dict;
    }

    if (owner = (Object.keys(owner_dict).find(owner => owner_dict[owner].some(group => group === catalog)))) {
        owner_input.value = owner;
        owner_input.disabled = true;
        input.style.backgroundColor = 'lightgreen'

        var clearButton = document.createElement('button');
        clearButton.textContent = 'Изменить';
        clearButton.className = 'btn btn btn-secondary ml-2';
        clearButton.addEventListener('click', () => {
            input.value = ''; // Очищаем поле ввода
            input.disabled = false;  // Разблокируем поле ввода
            input.parentNode.removeChild(clearButton); // Удаляем эту кнопку
            input.style.backgroundColor = 'pink'
            owner_input.value = ''; // Очищаем поле владельца
        });

        input.parentNode.appendChild(clearButton); // Удаляем эту кнопку
        input.disabled = true;

        const requestData = {
            catalog: catalog,
            owner: owner,
            child_cat: new_child_cat
        };

        return owner || null, child_cat;
        // Если владелец не найден, устанавливаем значение в 'неверно введен каталог'
    } else {
        owner_input.value = '';
        owner_input.placeholder = 'Неверно введен каталог';
        input.style.backgroundColor = 'pink'
        sendButton.disabled = true;
        sendButton.classList.add('btn-secondary');
        sendButton.classList.remove('btn-success');
    }
    if (catalog == '') {
        owner_input.value = '';
        owner_input.placeholder = 'Введите каталог';
        input.style.backgroundColor = '';
        if (tbody) {
            while (tbody.firstChild) {
                tbody.firstChild.remove();
            }
        }
        sendButton.disabled = true;
        sendButton.classList.add('btn-secondary');
        sendButton.classList.remove('btn-success');
    }
}

// предотвращение нажатия Enter для отправки заявки
document.getElementById('myForm').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Предотвращаем отправку формы
        console.log('Форма не отправляется!');
    }
});

HideUnhide(true, '', ['STEP_4', 'STEP_4_2'])

$(document).ready(function () {

    const inputFields = document.querySelectorAll('input#CatalogOwner, input#NewCatalogOwner');

    // Для каждого поля ввода добавляем обработчик события на нажатие клавиши Enter
    inputFields.forEach(function (inputField) {
        inputField.addEventListener('keydown', function (event) {
            // Проверяем, что нажата клавиша Enter (код 13)
            if (event.key === 'Enter') {
                // Находим родительский div элемент, в котором находится inputField
                const parentDiv = inputField.parentElement;

                // Находим кнопку 'find' внутри родительского div
                const findButton = parentDiv.querySelector('#find');
                const findButton_4 = parentDiv.querySelector('#find_4');

                // Если кнопка найдена, вызываем её функцию onclick
                if (findButton) {
                    findButton.click(); // Вызываем функцию onclick кнопки 'find'
                }
                if (findButton_4) {
                    findButton_4.click(); // Вызываем функцию onclick кнопки 'find'
                }
            }
        });
    });

    function GetVisibleData() {
        var data = {};
        var table_data = [];
        var managers = [];
        var action = document.querySelectorAll('.active');

        var elements = document.querySelectorAll('[required]');

        function RowAction() {
            rows.forEach(row => {
                let row_values = [];
                let cells = row.querySelectorAll('td');
                cells.forEach(function (cell, index) {
                    if (cell.textContent.toLowerCase().includes('менеджер')) {
                        const match = cell.textContent.match(/менеджер:\s*([a-zA-Z0-9._%+-]+)/);
                        if (match && match[1]) {
                            managers.push(match[1]);
                        }
                    }
                    // Проверяем, что это не последний элемент
                    if (index < cells.length - 1) {
                        // Добавляем значение текущей ячейки в массив
                        cropText = cell.innerText.replace(/\(менеджер:\s*([a-zA-Z0-9._%+-]+)\)/g, '');
                        row_values.push(cropText.trim());
                    }
                });
                table_data.push(row_values);
            });

        }

        if (action.length < 2) {
            data['action'] = action[0].innerText
            if (action[0].innerText === 'Создать') {
                var rows = document.querySelectorAll('.STEP_1 table:not([hidden]) tbody tr');
                RowAction()
                Object.assign(data, { table_data });
                Object.assign(data, { managers });
            } else if (action[0].innerText === 'Управление доступом') {
                var rows = document.querySelectorAll('#spreadsheet_new tbody tr');
                RowAction()
                Object.assign(data, { table_data });
                Object.assign(data, { managers });
            } else if (action[0].innerText === 'Удалить') {
            } else if (action[0].innerText === 'Сменить владельца') {
            }
        }

        for (let i = 0; i < elements.length; i++) {
            element = elements[i]
            label = element.parentElement.querySelector('label').textContent
            if (label === 'Владелец каталога') {
                data['catalog_owner'] = element.value
            } else if (label === 'Обоснование для ИБ') {
                reason = document.getElementById('SecretAccess');
                data['isec_approval'] = reason.checked
                data['isec_reason'] = element.value
            } else if (label === 'Имя каталога' || label === 'Выберите каталог из списка') {
                data['catalog_name'] = element.value
            } else if (label === 'Новый владелец каталога') {
                data['new_catalog_owner'] = element.value
            } else {
                data[label] = element.value
            }
        }

        return data;
    }

    document.getElementById('send').addEventListener('click', function (event) {
        form = document.getElementById('myForm');
        // Проверяем, валидна ли форма
        if (form.checkValidity()) {
            // Отменяем стандартное поведение формы
            event.preventDefault();

            var answer = {}
            var data = GetVisibleData();

            loadingOverlay.style.display = 'flex';
            loadingOverlay.getElementsByTagName("p")[1].innerText = 'Создание заявки...'

            fetch('/pam_catalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    console.log('response = \n', response)
                    if (!response.ok) {
                        throw new Error('Произошла ошибка при выполнении запроса');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('data = \n', data)
                    answer = data.answer
                    console.log('answer = \n', answer)

                    // Настройки для предотвращения закрытия модального окна по клику вне его или нажатию клавиши Esc
                    $('#fsmAnswerModal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });

                    if (answer) {

                        elemList = document.getElementById('fsmAnswer_elementList');

                        elemList.innerHTML = '';
                        var listItem = document.createElement('div');
                        listItem.className = 'list-group-item d-flex';
                        if (answer['result'] == 'Error') {
                            listItem.appendChild(document.createTextNode('При заведении заявки в FSM произошла ошибка'))
                        }
                        else if (answer['result'] == 'formError') {
                            listItem.appendChild(document.createTextNode('При заполнении заявки произошла ошибка'))
                        }
                        else if (answer['message'] === 'alert') {
                            listItem.appendChild(document.createTextNode('К сожалению в системе FSM не может быть более 25 согласующих.'))
                            listItem.appendChild(document.createElement('br'));
                            listItem.appendChild(document.createTextNode('Пожалуйста указывайте в доступах группы.'))

                            $('#fsmAnswerModal button.close').off('click');
                            $('#fsmAnswerModal button.yasno').off('click');

                            let closeButton = $('#fsmAnswerModal button.close');
                            closeButton[0].onclick = function() {
                                $('#fsmAnswerModal').modal('hide');
                            };

                            $('#yasno').on('click', function() {
                                $('#fsmAnswerModal').modal('hide');
                            });
                        }
                        else {
                            let closeButton = $('#fsmAnswerModal button.close');
                            closeButton[0].onclick = function() {
                                window.location.reload();
                            };

                            $('#yasno').on('click', function() {
                                $('#fsmAnswerModal').modal('hide');
                                window.location.reload();
                            });
                            
                            url_link = document.createElement('a');
                            url_link.href = answer['***']
                            url_link.textContent = '***';
                            url_link.target = '_blank';

                            sd_link = document.createElement('a');
                            sd_link.href = answer['***']
                            sd_link.textContent = `${answer['sd_number']}`;
                            sd_link.target = '_blank';

                            textNode = document.createElement('div')
                            textNode.innerHTML = `Заявка успешно создана <br>`

                            taskText = document.createElement('span');
                            taskText.textContent = 'Номер созданной заявки - ';
                            taskText.appendChild(sd_link);
                            textNode.appendChild(document.createElement('br'));
                            textNode.appendChild(taskText);

                            taskText = document.createElement('span');
                            taskText.textContent = 'Ссылка на задачу в ';
                            taskText.appendChild(url_link);
                            textNode.appendChild(document.createElement('br'));
                            textNode.appendChild(taskText);

                            taskText = document.createElement('div');
                            taskText.innerHTML = `<br>Заявки в *** появляются в течение 5 минут`
                            textNode.appendChild(document.createElement('br'));
                            textNode.appendChild(taskText);

                            listItem.appendChild(textNode);
                        }
                        elemList.appendChild(listItem);
                    }
                    loadingOverlay.style.display = 'none';
                    $('#fsmAnswerModal').modal('show');
                });
        } else {
            // Если форма не валидна, покажем стандартные ошибки валидации
            form.reportValidity();
        }
    });

    var loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';

    console.log('HELLO PAM')

    fetch('/get_cat')
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Добавляем элементы в список из данных, полученных от бекенда
            if (data.root_cat.length > 0 && data.child_cat.length > 0 && data.created_cat.length > 0) {
                domain_user = data.domain_user
                catalogs = data.catalogs.sort()
                main_catalogs = data.main_catalogs.sort()
                root_cat = data.root_cat.sort()
                child_cat = data.child_cat.sort()
                list_data = data.list_data
                created_cat = data.created_cat

                you_owner_dict = data.you_owner_dict
                you_cat_dict = Object.keys(you_owner_dict).reduce((result, key) => {
                    if (domain_user.includes(key)) {  // Проверяем, есть ли ключ в domain_user
                        result[key] = you_owner_dict[key];  // Добавляем в новый объект
                    }
                    return result;
                }, {});
                all_owner_dict = data.all_owner_dict

                options_2 = document.getElementById('options_2')
                options_3 = document.getElementById('options_3')
                options_4_base = document.getElementById('options_4_base')
                options_4_in = document.getElementById('options_4_in')

                catalogs.forEach(data => {
                    optionElement = document.createElement('option');
                    optionElement.value = data;
                    options_2.appendChild(optionElement)
                })

                main_catalogs.forEach(data => {
                    optionElement = document.createElement('option');
                    optionElement.value = data;
                    options_3.appendChild(optionElement)
                })

                root_cat.forEach(data => {
                    optionElement = document.createElement('option');
                    optionElement.value = data;
                    options_4_base.appendChild(optionElement)
                })

                child_cat.forEach(data => {
                    optionElement = document.createElement('option');
                    optionElement.value = data;
                    options_4_in.appendChild(optionElement)
                })
                console.log('Получили data', data.message)
                loadingOverlay.style.display = 'none';
            } else {
                console.log('Нет ответа в /get_cat')
            }
        });

    var all_input = document.querySelectorAll('input.form-control');
    all_input.forEach(function (input) {
        input.value = '';
    });

    var selectElements = document.querySelectorAll('select');
    selectElements.forEach(function (selectElement) {
        selectElement.options[0].disabled = true;
    });

    ReqClasses(['STEP_1_req', 'STEP_1_1_req', 'STEP_1_2_req', 'STEP_2_req', 'STEP_3_req', 'STEP_4_1_req', 'STEP_4_2_req'], false);

    HideUnhide(true, 'send', '');

    setInterval(function () {

        GetVisibleData();

        var step0 = document.querySelectorAll("label.STEP_0");
        var step1 = document.querySelectorAll("label.STEP_1");
        var step2 = document.querySelectorAll("label.STEP_2");
        var step3 = document.querySelectorAll("label.STEP_3");
        var step4 = document.querySelectorAll("label.STEP_4");
        var combined = document.querySelectorAll("#combined_field");

        step0.forEach(button => {
            if (button.classList.contains("active")) {
                combined.value = '';
                button.classList.remove("btn-secondary") + button.classList.add("btn-success");
                button.children[0].checked = true;

                if (button.children[0].value == 'Создать') {
                    ClearTable();
                    range = 'all';

                    step1.forEach(item => item.classList.remove("btn-secondary"));
                    step1.forEach(item => item.classList.add("btn-success"));
                    step1.forEach(item => item.classList.add("active"));

                    HideUnhide(false, '', 'STEP_1');
                    deleteRows('STEP_4_1');
                    step2.forEach(button => { button.classList.remove("active") });
                    step3.forEach(button => { button.classList.remove("active") });
                    step4.forEach(button => { button.classList.remove("active") });
                    ReqClasses(['STEP_1_1_req', 'STEP_1_2_req', 'STEP_2_req', 'STEP_3_req', 'STEP_4_1_req', 'STEP_4_2_req'], false);
                    HideUnhide(true, '', ['STEP_1_1', 'STEP_1_2', 'STEP_2', 'STEP_3', 'STEP_4', 'STEP_4_2']);

                    HideUnhide(false, '', 'STEP_1_1');
                    ReqClasses('STEP_1_1_req', true);
                    deleteRows('STEP_1_2');
                    HideUnhide(true, '', 'STEP_1_2');
                    ReqClasses(['STEP_1_req', 'STEP_1_2_req', 'STEP_2_req', 'STEP_3_req', 'STEP_4_1_req', 'STEP_4_2_req'], false);

                    HideUnhide(false, 'send', '');

                    requiredElements = document.querySelectorAll('[required]');

                    requiredElements.forEach(element => {
                        element.addEventListener("input", function () {
                            // Проверяем, состоит ли значение только из пробелов (одного или нескольких)
                            if (/^[\s]+$/.test(element.value)) {
                                element.value = ''; // Очищаем поле
                                element.style.backgroundColor = 'pink';
                            }
                            else if (element.value === '') {
                                element.style.backgroundColor = 'pink';
                            }
                            else {
                                element.style.backgroundColor = 'lightgreen';
                            }
                        });
                    });

                    requiredElements.forEach(element => {
                        if (element.value !== '' && document.querySelector('#CatalogOwner.STEP_1').disabled) {
                            sendButton.classList.remove('btn-secondary');
                            sendButton.classList.add('btn-success');
                            sendButton.disabled = false;
                        } else {
                            sendButton.classList.remove('btn-success');
                            sendButton.classList.add('btn-secondary');
                            sendButton.disabled = true;
                        }
                    });

                }
                else if (button.children[0].value == 'Удалить') {
                    $('#SecretAccess').prop('checked', false);
                    $('#SecretAccess').change();

                    ClearTable();
                    range = 'you';

                    deleteRows('STEP_4_1');
                    deleteRows('STEP_1_2');

                    HideUnhide(false, '', 'STEP_2');
                    ReqClasses('STEP_2_req', true);
                    HideUnhide(false, 'send', '');
                    step1.forEach(button => { button.classList.remove("active") });
                    step3.forEach(button => { button.classList.remove("active") });
                    step4.forEach(button => { button.classList.remove("active") });
                    ReqClasses(['STEP_1_req', 'STEP_1_1_req', 'STEP_1_2_req', 'STEP_3_req', 'STEP_4_1_req', 'STEP_4_2_req'], false);
                    HideUnhide(true, '', ['STEP_1', 'STEP_3', 'STEP_4', 'STEP_4_2']);
                    if (document.querySelector('#CatalogOwner.STEP_2_req').value !== '' && document.querySelector('#Accept').checked) {
                        sendButton.classList.remove('btn-secondary');
                        sendButton.classList.add('btn-success');
                        sendButton.disabled = false;
                    } else {
                        sendButton.classList.remove('btn-success');
                        sendButton.classList.add('btn-secondary');
                        sendButton.disabled = true;
                    }
                }
                else if (button.children[0].value == 'Сменить владельца') {
                    $('#SecretAccess').prop('checked', false);
                    $('#SecretAccess').change();
                    ClearTable();
                    range = 'only_you';

                    deleteRows('STEP_4_1');
                    deleteRows('STEP_1_2');

                    HideUnhide(false, '', 'STEP_3');
                    ReqClasses('STEP_3_req', true);
                    HideUnhide(false, 'send', '');
                    step1.forEach(button => { button.classList.remove("active") });
                    step2.forEach(button => { button.classList.remove("active") });
                    step4.forEach(button => { button.classList.remove("active") });
                    ReqClasses(['STEP_1_req', 'STEP_1_1_req', 'STEP_1_2_req', 'STEP_2_req', 'STEP_4_1_req', 'STEP_4_2_req'], false);
                    HideUnhide(true, '', ['STEP_1', 'STEP_2', 'STEP_4', 'STEP_4_2']);
                    if (document.querySelector('#NewCatalogOwner.STEP_3_req').parentElement.querySelector('#NewCatalogOwner').disabled === true &&
                        document.querySelector('#CatalogOwner.STEP_3_req').value !== '') {
                        sendButton.classList.remove('btn-secondary');
                        sendButton.classList.add('btn-success');
                        sendButton.disabled = false;
                    } else {
                        sendButton.classList.remove('btn-success');
                        sendButton.classList.add('btn-secondary');
                        sendButton.disabled = true;
                    }
                }
                else if (button.children[0].value == 'Управление доступом') {
                    $('#SecretAccess').prop('checked', false);
                    $('#SecretAccess').change();
                    range = 'all';
                    ReqClasses(['STEP_4_req'], true);
                    HideUnhide(false, '', 'STEP_4');
                    HideUnhide(false, 'send', '');
                    step1.forEach(button => { button.classList.remove("active") });
                    step2.forEach(button => { button.classList.remove("active") });
                    step3.forEach(button => { button.classList.remove("active") });
                    deleteRows('STEP_1_1');
                    deleteRows('STEP_1_2');
                    ReqClasses(['STEP_1_req', 'STEP_1_1_req', 'STEP_1_2_req', 'STEP_2_req', 'STEP_3_req'], false);
                    HideUnhide(true, '', ['STEP_1', 'STEP_2', 'STEP_3', 'STEP_4_1', 'STEP_4_2']);
                    if (document.querySelector('#spreadsheet_new tbody').children.length == 0) {
                        sendButton.classList.remove('btn-success');
                        sendButton.classList.add('btn-secondary');
                        sendButton.disabled = true;
                    } else {
                        sendButton.classList.remove('btn-secondary');
                        sendButton.classList.add('btn-success');
                        sendButton.disabled = false;
                    }
                }
                else {
                    step1.forEach(button => { button.classList.remove("active") });
                    step2.forEach(button => { button.classList.remove("active") });
                    step3.forEach(button => { button.classList.remove("active") });
                    step4.forEach(button => { button.classList.remove("active") });
                    sendButton.disabled = true;
                    sendButton.classList.remove('btn-success');
                    sendButton.classList.add('btn-secondary');
                }
            }
            if (!button.classList.contains("active")) { // Проверяем, если "active" отсутствует... Убираем "btn-success" (если есть) и добавляем "btn-secondary"
                button.classList.remove("btn-success") + button.classList.add("btn-secondary");
                button.children[0].checked = false;
            }
        });
    }, 100);


    setInterval(function () {
        let button = document.querySelector('.UserFind'); // Ищем кнопку с классом .UserFind

        if (button) {
            let parent = button.parentElement.parentElement;
            let user_group = parent.querySelector('#NewCatalogOwner');

            let style = window.getComputedStyle(button);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return; // Если кнопка не видна, прекращаем выполнение
            }
            // Ищем все элементы input и select внутри родителя
            let inputsAndSelects = parent.querySelectorAll('input, select');
            // Флаг для проверки, что все значения непустые
            let allValuesNotEmpty = true;
            // Перебираем все найденные элементы input и select
            inputsAndSelects.forEach(element => {
                // Если хотя бы одно значение пустое, ставим флаг в false
                if (element.value.trim() === '' || user_group.disabled === false) {
                    allValuesNotEmpty = false;
                    button.classList.remove('btn-success');
                }
            });

            // Если все значения непустые, убираем disabled, иначе добавляем
            if (allValuesNotEmpty) {
                button.disabled = false;
                button.classList.add('btn-success');
            } else {
                button.disabled = true;
                button.classList.remove('btn-success');
            }
        }
    }, 500); // Проверяем каждые 500

    setInterval(function () {
        // Ищем кнопку с классом .UserFind
        let button = document.querySelector('.OwnerFind');

        if (button) {
            let parent = button.parentElement;
            let user_group = parent.querySelector('#NewCatalogOwner');

            let style = window.getComputedStyle(button);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return; // Если кнопка не видна, прекращаем выполнение
            }
            // Ищем все элементы input и select внутри родителя
            let inputsAndSelects = parent.querySelectorAll('input, select');
            // Флаг для проверки, что все значения непустые
            let allValuesNotEmpty = true;
            // Перебираем все найденные элементы input и select
            inputsAndSelects.forEach(element => {
                // Если хотя бы одно значение пустое, ставим флаг в false
                if (element.value.trim() === '' || user_group.disabled === false) {
                    allValuesNotEmpty = false;
                }
            });

            // Если все значения непустые, убираем disabled, иначе добавляем
            if (allValuesNotEmpty) {
                user_group.disabled = true;
            } else {
                user_group.disabled = false;
            }
        }
    }, 500);

    const combinedField = document.getElementById('combined_field');
    const options = document.querySelectorAll('[id*="options"]');
    const originalDatalist = document.createElement('datalist');
    const add_row = document.getElementById('add_row')
    // Клонируем исходный даталист
    originalDatalist.innerHTML = options.innerHTML;

    combinedField.addEventListener('input', function () {
        const enteredText = combinedField.value;
        const optionElements = originalDatalist.getElementsByTagName('option');
        // Проверяем, есть ли схожие варианты в списке опций
        const matchingOptions = [];
        for (let i = 0; i < optionElements.length; i++) {
            const optionValue = optionElements[i].value;
            if (optionValue.toLowerCase().includes(enteredText.toLowerCase())) {
                matchingOptions.push(optionValue);
            }
        }
        // Заполняем даталист схожими вариантами
        options.innerHTML = '';
        matchingOptions.forEach(function (option) {
            const newOption = document.createElement('option');
            newOption.value = option;
            options.appendChild(newOption);
        });
    });

    setInterval(function () {
        let button = document.getElementById('add_row'); // Ищем кнопку с классом .UserFind

        if (button) {
            let parent = button.parentElement.parentElement;
            let user_group = parent.querySelector('#NewCatalogOwner');

            let style = window.getComputedStyle(button);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return; // Если кнопка не видна, прекращаем выполнение
            }

            // Ищем все элементы input и select внутри родителя
            let inputsAndSelects = parent.querySelectorAll('input, select');

            // Флаг для проверки, что все значения непустые
            let allValuesNotEmpty = true;

            // Перебираем все найденные элементы input и select
            inputsAndSelects.forEach(element => {
                if (element.offsetWidth > 0 && element.offsetHeight > 0) {
                    // Если хотя бы одно значение пустое, ставим флаг в false
                    if (element.value.trim() === '' || user_group.disabled === false) {
                        allValuesNotEmpty = false;
                    }
                }
            });

            // Если все значения непустые, убираем disabled, иначе добавляем
            if (allValuesNotEmpty) {
                button.disabled = false;
                button.classList.add('btn-success');
            } else {
                button.disabled = true;
                button.classList.remove('btn-success');
            }
        }
    }, 100);

    document.getElementById('add_row').addEventListener('click', function () {

        const root_cat = add_row.parentElement.parentElement.querySelector('[name="root_cat"]');
        const IncludeCatalog = add_row.parentElement.parentElement.querySelectorAll('[name="IncludeCatalog"]');
        const child_cat = add_row.parentElement.parentElement.querySelector('[name="child_cat"]');
        const catOwner = add_row.parentElement.parentElement.querySelector('[name="CatalogOwner"]');
        const userType = add_row.parentElement.parentElement.querySelector('.UserType');
        const user_group = add_row.parentElement.parentElement.querySelector('#NewCatalogOwner');
        const accessType = add_row.parentElement.parentElement.querySelector('.AccessType');

        const clear_button = user_group.parentElement.lastChild;
        const change_button = root_cat.parentElement.lastChild;

        const table_new = document.querySelector('#spreadsheet_new tbody');

        const table_new_tbody = document.querySelectorAll('#spreadsheet_new tbody tr');

        // Проверка на дубликаты
        for (let row of table_new_tbody) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 3) {
                const [actionCell, root_catCell, catOwnerCell, userTypeCell, user_groupCell, accessTypeCell] = cells;
                if (actionCell.textContent.trim() === 'Добавить' &&
                    root_catCell.textContent.trim() === root_cat.value &&
                    catOwnerCell.textContent.trim() === catOwner.value &&
                    userTypeCell.textContent.trim() === userType.value &&
                    user_groupCell.textContent.trim() === user_group.value &&
                    accessTypeCell.textContent.trim() === accessType.value) {
                    user_group.value = ''
                    user_group.placeholder = 'Введите новое значение';
                    add_row.disabled = true;
                    add_row.classList.remove('btn-success');
                    alert('Вы пытаетесь добавить дубликат строки');
                    return;
                }
            }
        }

        var newRowData = ['Добавить', child_cat.value != '' ? child_cat.value : root_cat.value, catOwner.value, userType.value, user_group.value, accessType.value];

        change_button.click();
        IncludeCatalog[0].checked = false
        HideUnhide(true, '', 'IncludeShow')
        HideUnhide(true, '', 'Include')
        clear_button.click();
        root_cat.value = '';
        root_cat.style.backgroundColor = '';
        child_cat.value = '';
        userType.value = '';
        user_group.value = '';
        accessType.value = '';
        catOwner.value = '';
        row_new = table_new.insertRow(-1);
        for (let i = 0; i < newRowData.length; i++) {
            cell = row_new.insertCell(i);
            cell.textContent = newRowData[i];
        }

        var del_row = document.createElement('button');
        del_row.setAttribute("type", "button");
        del_row.setAttribute("class", 'btn btn-danger btn-sm badge badge-pill');
        del_row.setAttribute("onclick", "del_row(this)");
        del_row.setAttribute("data-toggle", "tooltip");
        del_row.setAttribute("title", "Удалить строку");
        del_row.textContent = "X";
        del_row.innerText = 'X';

        cellWithButton = row_new.insertCell(newRowData.length);
        cellWithButton.appendChild(del_row);

        add_row.disabled = true;
        add_row.classList.remove('btn-success');
        $('#CatalogSelect').modal('hide');

    });

    // удаление символов в поле для ввода имени каталога
    var catalogInputs = document.querySelectorAll('[id*="CatalogName"]');
    for (var i = 0; i < catalogInputs.length; i++) {
        catalogInputs[i].addEventListener('input', function () {
            const inputField = this;
            const currentValue = inputField.value;
            const sanitizedValue = currentValue.replace(/[\/\\.,*@#<>=+]/g, '');

            if (currentValue !== sanitizedValue) {
                inputField.value = sanitizedValue;
            }
        });
    }

}); 