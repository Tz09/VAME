import logging
import os
import yaml
import psycopg2
import redis
from datetime import datetime

class State:
    def __init__(self):
        self.URL = []
        self.state = True
        self.error_logger = logging.getLogger('error')
        self.api_logger = logging.getLogger('werkzeug')

        self.api_logger.setLevel(logging.ERROR)
        self.error_logger.setLevel(logging.ERROR)
        
        if os.path.exists('logfile'):
            pass
        else:
            os.mkdir('logfile')

        logging.basicConfig(filename = fr"./logfile/{(datetime.now().strftime('logfile_%Y-%m-%d.log'))}",level = logging.ERROR,format = '%(asctime)s %(levelname)s:%(message)s')

    def check_state(self):

        # Check setting.yaml exists or not
        if os.path.exists('server/setting.yaml'):
            with open('server/setting.yaml') as f:
                self.setting = yaml.load(f,Loader=yaml.FullLoader)

            # Connect Database
            try:
                self.database = psycopg2.connect(dbname = self.setting['database']['dbname'],
                                user = self.setting['database']['user'], 
                                password = self.setting['database']['password'], 
                                host = self.setting['database']['host'], 
                                port = self.setting['database']['port'])
            except Exception:
                self.state = False
                self.error_logger.error('Database Connect Failed.')
            

            # Connect Redis
            try:
                r = redis.Redis(self.setting["redis"]["host"],self.setting["redis"]["port"])
                r.ping()
            
            except Exception:
                self.state = False
                self.error_logger.error('Redis Connect Failed.') 
            
        else:
            self.state = False
            self.error_logger.error('Setting File Not Found.')

        return self.state