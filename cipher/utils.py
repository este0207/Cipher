import os
from requests import get

import platform
import psutil
import GPUtil

system_info = platform.uname()



def get_os_spec():
    cpu_info = platform.processor()
    cpu_count = psutil.cpu_count(logical=False)
    logical_cpu_count = psutil.cpu_count(logical=True)

    memory_info = psutil.virtual_memory()
    disk_info = psutil.disk_usage('/')

    gpus = []
    try:
        gpus = GPUtil.getGPUs()
    except Exception:
        gpus = []

    gpu_list = []
    if gpus:
        for gpu in gpus:
            gpu_list.append({
                "id": gpu.id,
                "name": gpu.name,
                "driver": gpu.driver,
                "memory_total_MB": gpu.memoryTotal,
                "memory_free_MB": gpu.memoryFree,
                "memory_used_MB": gpu.memoryUsed,
                "load_percent": gpu.load * 100,
                "temperature_C": gpu.temperature
            })
    else:
        gpu_list = []

    return {
        "system": system_info.system,
        "node": system_info.node,
        "release": system_info.release,
        "version": system_info.version,
        "machine": system_info.machine,
        "processor": system_info.processor,
        "cpu_info": cpu_info,
        "physical_cores": cpu_count,
        "logical_cores": logical_cpu_count,
        "memory": {
            "total_bytes": memory_info.total,
            "available_bytes": memory_info.available,
            "used_bytes": memory_info.used,
            "percent": memory_info.percent
        },
        "disk": {
            "total_bytes": disk_info.total,
            "used_bytes": disk_info.used,
            "free_bytes": disk_info.free,
            "percent": disk_info.percent
        },
        "gpus": gpu_list if gpu_list else "No GPU detected"
    }


def get_user_os():
    return platform.system().lower()


def get_ip():
    ip = get('https://api.ipify.org').content.decode('utf8')
    return format(ip)
