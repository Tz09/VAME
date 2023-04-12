from flask import jsonify,make_response,session,request
from flask_restful import Resource
from server.service.models import User,db

url = [('Access','/access')]

class Access(Resource):
    def get(self):
        user_id = session.get("userid")

        if not user_id:
            status_code = 401
            data = {"error":user_id}
            response = make_response(jsonify(data),status_code)
            return response
        else:
            user = User.query.filter_by(id=user_id).first()
            access=False
            if user and user.analytic_page_access:
                access = True
            
            if access:
                return jsonify({
                    "message":"True"
                })
            else:
                return jsonify({
                    "message":"False"
                })
    
    # Change Analytic Access For Account
    def put(self):
        json = request.get_json()
        username = json.get("username")
        user = User.query.filter_by(username=username).first()

        if user is None:
            data = {"message":"Username Not Found."}
            status_code = 401
            response = make_response(jsonify(data),status_code)
            return response
        else:
            user.analytic_page_access = not user.analytic_page_access
            db.session.commit()
            return jsonify({"message":"Change Successful."})