from server import app
from server.service import _state,_state_connection

if __name__ == '__main__':
    if _state_connection == True:
        app.run(debug=True)
    else:
        _state.error_logger.error('Server Start Failed.')
        raise Exception('App Run Failed. Please Check on Log File')