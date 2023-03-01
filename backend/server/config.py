import yaml
from datetime import timedelta

with open('setting.yaml') as f:
    setting = yaml.safe_load(f)

class Config:
    SECRET_KEY = f'{setting["secret_key"]}'
    SQLALCHEMY_DATABASE_URI = f'postgresql://{setting["database"]["user"]}:{setting["database"]["password"]}@{setting["database"]["host"]}:{setting["database"]["port"]}/{setting["database"]["dbname"]}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_COOKIE_SECURE = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)