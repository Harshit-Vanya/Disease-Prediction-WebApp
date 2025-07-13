from flask import Flask, render_template, request, jsonify
import util
from util import app

# Load artifacts when importing the file
util.load_artifacts()

if __name__ == '__main__':
    # Development server
    app.run(host='0.0.0.0', port=8000, debug=True)
else:
    # Production application
    application = app