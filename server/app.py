from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from datetime import datetime
from pyTwistyScrambler import scrambler333

app = Flask(__name__)
CORS(app)


@app.route("/api/v1/scramble", methods=["GET"])
def scramble():
    return scrambler333.get_WCA_scramble()


if __name__ == '__main__':
    app.run()
