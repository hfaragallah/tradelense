import requests
import json

headers = {
    'Origin': 'https://traderlense.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
}
res = requests.options('https://tradelense-ai-engine.fly.dev/analyze', headers=headers)
print("OPTIONS Headers:", res.headers)
print("OPTIONS Status:", res.status_code)

post_headers = {
    'Origin': 'https://traderlense.com',
    'Content-Type': 'application/json'
}
data = {"asset": "BTC/USD - Time Horizon: SCALP - Bias: LONG - Rationale: Trendline bounce"}
try:
    print("Sending POST request...")
    res2 = requests.post('https://tradelense-ai-engine.fly.dev/analyze', headers=post_headers, json=data)
    print("POST Status:", res2.status_code)
    print("POST Response:", res2.text)
    print("POST Headers:", res2.headers)
except Exception as e:
    print("Error:", e)
