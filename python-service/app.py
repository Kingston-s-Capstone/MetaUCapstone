from flask import Flask, jsonify
from flask_cors import CORS
from recommend_engine import get_recommendations
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Flask is running"})

@app.get("/healthz")
def healthz():
    return jsonify(ok=True)

@app.route('/recommendations/<user_id>', methods=['GET'])
def recommendations(user_id):
    results = get_recommendations(user_id)
    return jsonify(results)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host = "0.0.0.0", port=port, debug=True)