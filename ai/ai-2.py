from flask import Flask, request, jsonify
from datetime import date, datetime
import requests

app = Flask(__name__)

@app.route("/logs", methods=["POST"])
def logs():
    data = request.get_json()
    print(data)
    date = datetime.strptime(data['time'], '%a %b %d %H:%M:%S %Y').date()
    if data['action'] == "login" && date == date.today():
        prev_logs = requests.get("http://localhost:5000/api/logs/getlogs")
        print(prev_logs)

    requests.post("http://localhost:5000/api/logs/createlog", json=data)
    return jsonify({"message": "success"})

if __name__ == "__main__":
    app.run(debug=True)