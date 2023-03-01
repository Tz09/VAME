from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Extension Used for Flask
db = SQLAlchemy()
bcrpyt = Bcrypt()
jwt = JWTManager()
cors = CORS()