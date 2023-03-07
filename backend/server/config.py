import yaml
import redis

with open('setting.yaml') as f:
    setting = yaml.safe_load(f)

class Config:
    SECRET_KEY = f'{setting["secret_key"]}'
    SQLALCHEMY_DATABASE_URI = f'postgresql://{setting["database"]["user"]}:{setting["database"]["password"]}@{setting["database"]["host"]}:{setting["database"]["port"]}/{setting["database"]["dbname"]}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_TYPE = "redis"
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_REDIS = redis.from_url(f'redis://{setting["redis"]["host"]}:{setting["redis"]["port"]}')
    
    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = 'True'

    CORS_SUPPORTS_CREDENTIALS = True