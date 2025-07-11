from flask import Flask, jsonify
from flask_cors import CORS
from recommend_engine import get_recommendations

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Flask is running"})

@app.route('/recommendations/<user_id>', methods=['GET'])
def recommendations(user_id):
    results = get_recommendations(user_id)
    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5001, debug=True)