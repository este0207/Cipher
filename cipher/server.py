from fastapi import FastAPI
from utils import get_user_os, get_ip

app = FastAPI()

@app.get("/os")
def read_os():
    return {"os": get_user_os()}

@app.get("/ip")
def read_ip():
    return {"ip": get_ip()}
