from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    SubmitField,
    SelectField,
    BooleanField,
    validators,
    RadioField,
    TextAreaField,
    MultipleFileField,
)
from wtforms.validators import (
    DataRequired,
    InputRequired,
    ValidationError,
)
from wtforms.widgets import TextArea

class PamCatalog(FlaskForm):
    UserLabel = StringField("Получатель услуги :")
    FormInstruction = StringField("Инструкция по работе с формой")

    Step_0_Text = StringField(
        "Шаг 1 - «Выбор необходимого действия для каталога»"
    )

    Step_1_Text = StringField("Шаг 2 из 3 - «Выбор типа каталога»")

    Step_1_1_Text = StringField("Шаг 2 из 2 - «Создать общий каталог»")
    Step_1_1_type_choises = [
        ("", "Выбрать..."),
        ("Пользователь", "Пользователь"),
        ("Группа FSM", "Группа FSM"),
        ("Группа AD", "Группа AD"),
    ]
    Step_1_1_access_type_choises = [
        ("", "Выбрать..."),
        ("Только чтение", "Только чтение"),
        ("Чтение и изменение", "Чтение и изменение"),
    ]
    Step_1_1_type = SelectField(
        "Выбрать тип ", choices=Step_1_1_type_choises
    )
    Step_1_1_access_type = SelectField(
        "Выбрать тип доступа ", choices=Step_1_1_access_type_choises
    )
    Step_1_2_Text = StringField("Шаг 3 из 3 - «Создать E2E каталог»")
    Step_1_2_type_choises = [
        ("", "Выбрать..."),
        ("Группа FSM", "Группа FSM"),
        ("Группа AD", "Группа AD"),
    ]
    Step_1_2_type = SelectField(
        "Выбрать тип ", choices=Step_1_2_type_choises
    )

    Step_2_Text = StringField(
        "Шаг 2 из 2 - «Выбор каталога для удаления»"
    )

    Step_3_Text = StringField(
        "Шаг 2 из 2 - «Заполнение формы для смены владельца каталога»"
    )

    Step_4_Text = StringField("Шаг 2 из 2 - «Управление доступом»")

    Step_4_1_Text = StringField(
        "Шаг 3 из 3 - «Заполнение формы по заказу доступа в каталог»"
    )
    Step_4_1_type_choises = [
        ("", "Выбрать..."),
        ("Пользователь", "Пользователь"),
        ("Группа FSM", "Группа FSM"),
        ("Группа AD", "Группа AD"),
    ]
    Step_4_1_access_type_choises = [
        ("", "Выбрать..."),
        ("Только чтение", "Только чтение"),
        ("Чтение и изменение", "Чтение и изменение"),
    ]
    Step_4_1_path = TextAreaField("Путь")
    Step_4_1_type = SelectField(
        "Выбрать тип ", choices=Step_4_1_type_choises
    )
    Step_4_1_access_type = SelectField(
        "Выбрать тип доступа ", choices=Step_4_1_access_type_choises
    )

    Step_4_2_Text = StringField(
        "Шаг 3 из 3 - «Заполнение формы по отзыву доступа в каталоге»"
    )

    combined_field = StringField("Выберите каталог из списка")

    CatalogName = StringField("Имя каталога")
    SecretAccess = BooleanField(
        "Отключить функционал согласования доступа к секретам на уровне каталога"
    )
    Reason = TextAreaField("Обоснование для ИБ")
    CatalogOwner = StringField("Владелец каталога")
    IncludeCatalog = BooleanField("Выбрать вложенный каталог")
    NewCatalogOwner = StringField("Новый владелец каталога")
    AccessSelect = StringField("Выбор доступов для отзыва")
    AccessCount = TextAreaField(
        "Текущие кол-во выбранных записей для отзыва, "
        "для просмотра списка текущих "
        "доступов и изменения - нажмите на это поле"
    )
    send = SubmitField("Отправить")
