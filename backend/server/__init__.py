import os
import traceback
from flask import Flask
from flask_restful import Api

try:
    from server.service import _state
    from server.service.flask_extension import bcrpyt,cors,session,ma
    from server.service.models import db,create_admin,setting

    import sys
    sys.path.insert(0, './server/ai')

    def create_app():
        app = Flask(__name__)
        api = Api(app)
        
        # Flask App Configuration 
        app.config.from_object('server.config.Config')

        # Init App with Extension
        db.init_app(app)
        bcrpyt.init_app(app)
        cors.init_app(app)
        session.init_app(app)
        cors.init_app(app)
        ma.init_app(app)
        
        # Create Database
        with app.app_context():
            db.create_all()
            # Create Admin Account
            create_admin()

        dir = os.getcwd()
        image_path = setting["image_file"]
        exist = os.path.isdir(os.path.join(dir,image_path))
        if not exist:
            os.mkdir(image_path)
        return app,api

    app,api = create_app()

    from server.service import _state
    from server.resource import interface
    for resource_name,*url in _state.URL:
        _resource = getattr(interface,resource_name)
        api.add_resource(_resource,*url)

except Exception:
    _state.error_logger.error(traceback.format_exc())
    raise Exception('App Run Failed. Please Check on Log File')
    
