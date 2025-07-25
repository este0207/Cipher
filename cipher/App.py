import utils
import threading
import time
import uvicorn
import server
import queue
import tkinter as tk
from PIL import Image, ImageTk
import os

# --- Asset paths ---
ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
IMAGE_PATH = os.path.join(ASSETS_DIR, "screamer.jpg")

display_queue = queue.Queue()

def run_server(public_ip):
    uvicorn.run(
        "server:app",
        host=public_ip,
        port=8000,
        reload=False,
        factory=False
    )

def tk_mainloop():
    root = tk.Tk()
    root.withdraw()  # Hide the root window initially
    while True:
        image_path = display_queue.get()
        root.deiconify()
        root.attributes('-fullscreen', True)
        root.configure(background='black')
        img = Image.open(image_path)
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        img = img.resize((screen_width, screen_height), Image.ANTIALIAS)
        tk_img = ImageTk.PhotoImage(img)
        label = tk.Label(root, image=tk_img, bg='black')
        label.pack(expand=True)
        root.after(5000, root.destroy)
        root.mainloop()
        # After closing, recreate the root for next use
        root = tk.Tk()
        root.withdraw()

def main():
    print(utils.get_user_os())
    public_ip = "0.0.0.0"
    print(public_ip)
    print(f"Starting FastAPI server on http://{public_ip}:8000 ...")
    server_thread = threading.Thread(target=run_server, args=(public_ip,), daemon=True)
    server_thread.start()
    tk_mainloop()

if __name__ == "__main__":
    main()