import yaml
from .flask_extension import db,bcrpyt

with open('server/setting.yaml') as f:
    setting = yaml.safe_load(f)

# Database Model for User
class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String(50),nullable=False,unique=True)
    password = db.Column(db.Text,nullable=False)
    is_admin = db.Column(db.Boolean,nullable=False,default=False)
    analytic_page_access = db.Column(db.Boolean,nullable=False,default=True)

class Image(db.Model):
    __tablename__= "image"
    id = db.Column(db.Integer,primary_key=True)
    time = db.Column(db.TIMESTAMP, nullable=False)
    violated_img_paths = db.Column(db.ARRAY(db.String(255)))
    obstacle_img_paths = db.Column(db.ARRAY(db.String(255)))

# Set Admin Account
def create_admin():
    admin_name = setting["admin_account"]
    admin = User(
        username = admin_name,
        password = bcrpyt.generate_password_hash(admin_name).decode('utf-8'),
        is_admin = True
    )
    exist = User.query.filter_by(username=admin_name).first()
    if(exist == None):
        db.session.add(admin)
        db.session.commit()