import utils
import threading
import time
import uvicorn
import server


def run_server(public_ip):
    uvicorn.run(
        "server:app",
        host=public_ip,
        port=8000,
        reload=True,
        factory=False
    )

def main():
    print(utils.get_user_os())
    public_ip = utils.get_ip()
    print(public_ip)
    print(f"Starting FastAPI server on http://{public_ip}:8000 ...")
    server_thread = threading.Thread(target=run_server, args=(public_ip,), daemon=True)
    server_thread.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down server...")
        

if __name__ == "__main__":
    main()