from flask import Flask, request
import datetime
import logging
import os
 
app = Flask(__name__)
 
@app.before_first_request
def before_first_request():
    log_level = logging.INFO
 
    for handler in app.logger.handlers:
        app.logger.removeHandler(handler)
 
    root = os.path.dirname(os.path.abspath(__file__))
    log_file = os.path.join(root, 'attendence.log')
    handler = logging.FileHandler(log_file)
    handler.setLevel(log_level)
    app.logger.addHandler(handler)
 
    app.logger.setLevel(log_level)
 
 
@app.route("/")
def main():
    return "Hello " + str(datetime.datetime.now())
 

# /log?present=Harshit Raj(433)
@app.route('/log')
def logger():
    name = request.args.get('present')
    app.logger.info(str(datetime.datetime.now()) + " "+ name + " is present")
    return name + " Marked present"
if __name__ == '__main__':
   app.run()
