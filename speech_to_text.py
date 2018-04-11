import speech_recognition as sr

# recognize speech using IBM Speech to Text
IBM_USERNAME = "ff8d1099-1e52-4791-ac34-c398645b2035"  # IBM Speech to Text usernames are strings of the form XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
IBM_PASSWORD = "XyiS7RaCf7Bj"  # IBM Speech to Text passwords are mixed-case alphanumeric strings

def recognize_speech():
    """
    Recognizes speech from laptop microphone and returns voice-to-text transcription.
    Prints error messages to console in the case of an error
    :return: voice translation as a string.
    """
    # obtain audio from the microphone
    print("HELLO!!!!!!")
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Say something!")
        audio = r.listen(source)
    try:
        return r.recognize_ibm(audio, username=IBM_USERNAME, password=IBM_PASSWORD)
    except sr.UnknownValueError:
        print("IBM Speech to Text could not understand audio")
        return ""
    except sr.RequestError as e:
        print("Could not request results from IBM Speech to Text service; {0}".format(e))
        return ""
