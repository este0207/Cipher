from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from utils import get_user_os, get_ip
import subprocess

app = FastAPI()

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/os")
def read_os():
    return {"os": get_user_os()}

@app.get("/ip")
def read_ip():
    return {"ip": get_ip()}

@app.post("/shell")
async def run_shell(request: Request):
    data = await request.json()
    command = data.get("command")
    if not command:
        return {"error": "No command provided."}
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except Exception as e:
        return {"error": str(e)}
