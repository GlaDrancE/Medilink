from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DATABASE = 'data.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/store', methods=['POST'])
def store_data():
    data = request.json.get('data')
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO logs (data) VALUES (?)', (data,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Data stored successfully'}), 201

@app.route('/retrieve', methods=['GET'])
def retrieve_data():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM logs')
    rows = cursor.fetchall()
    conn.close()

    logs = [{'id': row[0], 'data': row[1]} for row in rows]
    return jsonify(logs), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True)