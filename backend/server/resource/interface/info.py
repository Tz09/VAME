from flask import jsonify,request,make_response
from flask_restful import Resource
from server.service.models import User
from server.service.flask_extension import ma,db,bcrpyt

url = [('Info','/info')]

class AccountInfoSchema(ma.Schema):
    class Meta:
        fields = ('username','analytic_page_access')

account_info_schema = AccountInfoSchema(many=True)

class Info(Resource):
    
    # Get All The Non-Admin Account Information
    def get(self):
        users = User.query.filter_by(is_admin=False)
        result = account_info_schema.dump(users)
        return jsonify(result)
    
    # Change Password for Non-Admin
    def post(self):
        json = request.get_json()
        username = json.get("username")
        password = json.get("password")
    
        
        if password.strip() == "":
            status_code = 401
            data = {"message":"Invalid password."}
            response = make_response(jsonify(data),status_code)
            return response
        
        user = User.query.filter_by(username=username).first()

        if user is None:
            data = {"message":"Username Not Found."}
            status_code = 401
            response = make_response(jsonify(data),status_code)
            return response
        else:
            hashed_password = bcrpyt.generate_password_hash(password).decode('utf-8')
            user.password = hashed_password
            db.session.commit()
            return jsonify({
                "message":"Password Changed Successful"
            })
        
    # Delete the Non-Admin Account
    def delete(self):
        json = request.get_json()
        username = json.get("username")
        
        user = User.query.filter_by(username=username).first()
        if user is None:
            data = {"message":"Username Not Found."}
            status_code = 401
            response = make_response(jsonify(data),status_code)
            return response
        else:
            print(user)
            db.session.delete(user)
            db.session.commit()
            return jsonify({"message":"Remove Successful."})