import requests


def send_request(host, method, content, quantity):
    result = None
    for i in range(quantity):
        if method.upper() == "GET":
            result = requests.get(host)
        elif method.upper() == "POST":
            result = requests.post(host, json=content)
        elif method.upper() == "PUT":
            result = requests.put(host, json=content)
        elif method.upper() == "DELETE":
            result = requests.delete(host, json=content)
        elif method.upper() == "PATCH":
            result = requests.patch(host, json=content)
        elif method.upper() == "HEAD":
            result = requests.head(host)
        elif method.upper() == "OPTIONS":
            result = requests.options(host)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")


    return result
