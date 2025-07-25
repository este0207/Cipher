import tkinter as tk
import threading
from App import popup_queue

def show_message_window(message):
    popup_queue.put(message) 