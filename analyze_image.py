import os
import base64
import json
import urllib.request

API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    print("No GEMINI_API_KEY found.")
else:
    with open("C:/Users/hailk/.gemini/antigravity/brain/a507d9eb-2fab-49b9-8af9-8b4defd7f4d5/etape1.png", "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    payload = {
        "contents": [{
            "parts": [
                {"text": "Describe the selection buttons for 'Pour qui ?', 'Quel style ?', 'Quelle ambiance ?' and 'Durée'. Are they grid cards? Do they have icons? What are their colors and layout?"},
                {"inline_data": {"mime_type": "image/png", "data": image_data}}
            ]
        }]
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as res:
            resp_body = json.loads(res.read().decode("utf-8"))
            print(resp_body['candidates'][0]['content']['parts'][0]['text'])
    except Exception as e:
        print("Error:", e)
