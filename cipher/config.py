import os
import platform
import sys
import shutil
import subprocess

CADDYFILE_CONTENT = """
:80 {
    reverse_proxy localhost:8000
}
"""

def install_caddy():
    system = platform.system().lower()
    if system == "darwin":
        print("Installing Caddy with Homebrew...")
        os.system("brew install caddy")
    elif system == "linux":
        print("Installing Caddy with apt (requires sudo)...")
        os.system("sudo apt update && sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https")
        os.system("curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo apt-key add -")
        os.system("curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list")
        os.system("sudo apt update && sudo apt install caddy")
    elif system == "windows":
        print("Installing Caddy for Windows...")
        caddy_url = "https://github.com/caddyserver/caddy/releases/latest/download/caddy_windows_amd64.exe"
        caddy_exe = "caddy.exe"
        if not os.path.exists(caddy_exe):
            import urllib.request
            print(f"Downloading Caddy from {caddy_url} ...")
            urllib.request.urlretrieve(caddy_url, caddy_exe)
            print(f"Downloaded {caddy_exe} to current directory.")
        else:
            print(f"{caddy_exe} already exists in current directory.")
        print("Add the current directory to your PATH or use the full path to run caddy.exe.")
    else:
        print(f"Unsupported OS: {system}. Please install Caddy manually.")
        return
    print("Caddy installed or downloaded.")

def write_caddyfile(path="Caddyfile"):
    with open(path, "w") as f:
        f.write(CADDYFILE_CONTENT)
    print(f"Caddyfile written to {path}:")
    print(CADDYFILE_CONTENT)

def run_caddy():
    system = platform.system().lower()
    if system == "windows":
        caddy_cmd = [os.path.abspath("caddy.exe"), "run", "--config", "./Caddyfile"]
        # Hide the window
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        subprocess.Popen(caddy_cmd, startupinfo=si, creationflags=subprocess.CREATE_NO_WINDOW)
    elif system in ("darwin", "linux"):
        # Try to run as a background process (may require sudo for port 80)
        caddy_path = shutil.which("caddy") or "caddy"
        caddy_cmd = [caddy_path, "run", "--config", "./Caddyfile"]
        try:
            subprocess.Popen(["sudo"] + caddy_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, close_fds=True)
        except Exception:
            print("Failed to run Caddy with sudo. Trying without sudo...")
            subprocess.Popen(caddy_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, close_fds=True)
    else:
        print("Cannot auto-run Caddy on this OS.")

def main():
    install_caddy()
    write_caddyfile()
    print("\nRunning Caddy as a background process...")
    run_caddy()
    print("Caddy is now running in the background as a reverse proxy to localhost:8000.")
    print("\nMake sure your FastAPI app is running on localhost:8000.")

if __name__ == "__main__":
    main() 