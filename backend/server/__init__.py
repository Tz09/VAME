from flask import Flask
from flask_restful import Api
from server.service.flask_extension import bcrpyt,cors,session,ma
from server.service.models import db,create_admin

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

    # Add Url
    from server.service import _state
    from server.resource import interface

    for resource_name,*url in _state.URL:
        _resource = getattr(interface,resource_name)
        api.add_resource(_resource,*url)

    return app

app = create_app()

