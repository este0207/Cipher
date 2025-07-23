import os
from requests import get

def get_user_os():
    return os.name


def get_ip():
    ip = get('https://api.ipify.org').content.decode('utf8')
    return format(ip)
