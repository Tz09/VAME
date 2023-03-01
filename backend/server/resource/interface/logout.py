from flask import request,jsonify,make_response
from flask_restful import Resource
from flask_jwt_extended import unset_jwt_cookies

url = [('Logout','/logout')]
 
class Logout(Resource):

    def post(self):
        response = jsonify({"msg":"logout successful"})
        unset_jwt_cookies(response)
        return response