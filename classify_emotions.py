import requests

# Authentication protocol for Microsoft Azure Face API using East US data
_key = "22160d79804c420385ce0e3bae138790"
assert _key
_url = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect"


####################################
pathToFileInDisk = 'images/happy.jpg'
with open( pathToFileInDisk, 'rb' ) as f:
    data = f.read()

headers = {
    # Request headers
    'Content-Type': 'application/octet-stream',
    'Ocp-Apim-Subscription-Key': _key,
}

params = {
    'returnFaceId': 'false',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'gender,smile,emotion',
}

response = requests.post(_url, params=params, headers=headers, data=data)
faces = response.json()
print(faces)
