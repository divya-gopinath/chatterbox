import requests
from emoji_bank import emoji_bank

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
info = { key: value for d in response.json() for key, value in d.items() } # format response as dict
print(info)

def get_emoji_suggestions(info):
    """
    Takes formatted API response from Microsoft Azure and uses an emoji bank to determine what
    unicode characters to suggest based on emotion, if any.
    :param info: API response as dictionary
    :return: list of emoji suggestions as unicode characters
    """
    emotions = info["emotion"]
    best_emotion = max(emotions, key=emotions.get)
    return emoji_bank[best_emotion]


