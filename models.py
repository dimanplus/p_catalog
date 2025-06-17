from flask_sqlalchemy import SQLAlchemy

pam_catalog_db = SQLAlchemy()


# class FindAutagPolicy(pam_catalog_db.Model):
#     __bind_key__ = "glb-fksud-db"
#     __tablename__ = "find_autag_policy"
#     name = pam_catalog_db.Column(
#         pam_catalog_db.String, primary_key=True
#     )
#     ipstart = pam_catalog_db.Column(
#         pam_catalog_db.String, primary_key=True
#     )
#     ipend = pam_catalog_db.Column(
#         pam_catalog_db.String, primary_key=True
#     )
#     ports = pam_catalog_db.Column(
#         pam_catalog_db.String, primary_key=True
#     )
#     fsm = pam_catalog_db.Column(
#         pam_catalog_db.String, primary_key=True
#     )
#     type = pam_catalog_db.Column(
#         pam_catalog_db.String, primary_key=True
#     )
#     ip_start = pam_catalog_db.Column(
#         pam_catalog_db.Integer, primary_key=True
#     )
#     ip_end = pam_catalog_db.Column(
#         pam_catalog_db.Integer, primary_key=True
#     )
#     port_start = pam_catalog_db.Column(
#         pam_catalog_db.Integer, primary_key=True
#     )
#     port_end = pam_catalog_db.Column(
#         pam_catalog_db.Integer, primary_key=True
#     )


# class FindClosedAutagPolicy(FindAutagPolicy):
#     __tablename__ = "find_closed_autag_policy"
