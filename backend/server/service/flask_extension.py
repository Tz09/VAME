from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_session import Session
from flask_cors import CORS
from flask_marshmallow import Marshmallow

# Extension Used for Flask
db = SQLAlchemy()
bcrpyt = Bcrypt()
cors = CORS()
session = Session()
ma = Marshmallow()