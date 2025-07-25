import os
from requests import get
import system
import platform

def get_user_os():
    return platform.system().lower()


def get_ip():
    ip = get('https://api.ipify.org').content.decode('utf8')
    return format(ip)
