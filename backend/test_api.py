import urllib.request
import json

url = "http://localhost:8000/api/chat/messages/"
data = json.dumps({"message": "Hello, how are you?"}).encode("utf-8")
headers = {"Content-Type": "application/json"}

req = urllib.request.Request(url, data=data, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode("utf-8"))
        print("Success:", json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    error_body = e.read().decode("utf-8")
    print(f"HTTPError {e.code}: {error_body}")
except Exception as e:
    print("Error:", e)
