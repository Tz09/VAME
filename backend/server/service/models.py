import yaml
from flask_login import UserMixin
from .flask_extension import db,bcrpyt

with open('setting.yaml') as f:
    setting = yaml.safe_load(f)

# Database Model for User
class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String(50),unique=True)
    password = db.Column(db.Text,nullable=False)

# Set Admin Account
def create_admin():
    admin_name = setting["admin_account"]
    admin = User(
        username = admin_name,
        password = bcrpyt.generate_password_hash(admin_name).decode('utf-8')
    )
    exist = User.query.filter_by(username=admin_name).first()
    if(exist == None):
        db.session.add(admin)
        db.session.commit()