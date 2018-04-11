import requests
from os import listdir
from emoji_bank import emoji_bank
import cv2
from time import sleep

# Authentication protocol for Microsoft Azure Face API using East US data
_key = "22160d79804c420385ce0e3bae138790"
_url = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect"


####################################
pathToFileInDisk = 'images/'
num_frames = 10 # number of frames to capture as default

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

def classify():
    """
    Reads current frames in the given path to disk and makes
    API calls (Microsoft Azure Face API) to format response.
    :return: list of dictionaries (one element per API call/picture in folder)
    """
    responses = []
    for fp in listdir(pathToFileInDisk):
        with open(pathToFileInDisk + fp, 'rb') as f:
            data = f.read()
            response = requests.post(_url, params=params, headers=headers, data=data)
            json = response.json();
            try:
                info = json[0].get('faceAttributes')  # format response as dict
                responses.append(info)
            except (IndexError, KeyError) as e:
                continue

    return responses

def get_emoji_suggestions(responses):
    """
    Takes formatted API response from Microsoft Azure and uses an emoji bank to determine what
    unicode characters to suggest based on emotion, if any.
    :param info: API response as dictionary
    :return: list of emoji suggestions as unicode characters
    """
    best_emotion = None
    best_score = 0
    for info in responses:
        emotions = info["emotion"]
        current_best = max(emotions, key=emotions.get)
        current_score = emotions.get(current_best)
        if current_score > best_score:
            best_emotion = current_best
            best_score = current_score
    if best_emotion:
        return emoji_bank[best_emotion]
    else:
        return None

def get_frames(num_frames, delay=0.1):
    """
    Called to capture camera data after receiving a message
    :param num_frames: number of frames to capture
    :param amount of delay between frames, default set to 100ms
    :return: frames saved to disk under pathToFileInDisk filepath
    """
    cam = cv2.VideoCapture(0)
    for frame in range(num_frames):
        s, im = cam.read() # captures image
        cv2.imwrite(pathToFileInDisk + "frame_" + str(frame) + ".jpg",im) # writes image test.jpg to disk
        sleep(delay)
    cam.release() # close out the camera

def recommend_emojize():
    get_frames(num_frames)
    responses = classify()
    return get_emoji_suggestions(responses)
