from .models import pam_catalog_db
from .router import pam_catalog_route


def create_pam_catalog_app(app):
    # подключение бд #
    pam_catalog_db.init_app(app)

    # регистрация маршрутов #
    app.register_blueprint(pam_catalog_route)
