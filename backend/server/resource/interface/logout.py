from flask import session
from flask_restful import Resource

url = [('Logout','/logout')]
 
class Logout(Resource):

    def get(self):
        session.pop("userid",None)
        return {"message":"Logout Successful!"}