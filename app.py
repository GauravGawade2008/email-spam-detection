import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Import prediction function from api module
from api.predict import predict_email

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json() or {}
        subject = data.get('subject', '')
        message = data.get('message', '')
        
        if not subject and not message:
            return jsonify({"error": "Please provide a subject or message to analyze."}), 400
            
        result = predict_email(subject, message)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Email Spam Detection local server running at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
