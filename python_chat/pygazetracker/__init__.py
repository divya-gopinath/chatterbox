# -*- coding: utf-8 -*-

import os


# # # # #
# CONSTANTS

# VERBOSITY
# 0 is errors only
# 1 is errors and warnings
# 2 is errors, warnings, and messages
# 3 is errors, warnings, messages, and debug info.
_VERBOSITY = 2

# DEBUG MODE
# In this mode, images of each step of the frame-processing are stored.
_DEBUG = False

# FILES AND FOLDERS
# Get the main directory
_DIR = os.path.abspath(os.path.dirname(__file__))
# Get the directory for DEBUG images.
_DEBUGDIR = os.path.join(_DIR, 'DEBUG')
# Face detection cascade from:
# https://github.com/shantnu/FaceDetect
_FACECASCADE = os.path.join(_DIR, 'haarcascade_frontalface_default.xml')
# Eye detection cascade from:
# http://www-personal.umich.edu/~shameem/haarcascade_eye.html
_EYECASCADE = os.path.join(_DIR, 'haarcascade_eye.xml')


# # # # #
# INTERNAL FUNCTIONS
def _message(msgtype, sender, msg):
    if msgtype == 'error':
        raise(Exception("Error in pygazetracker. %s: %s" % (sender, msg)))
    elif msgtype == 'warning' and _VERBOSITY >= 1:
        print("WARNING in pygazetracker.%s: %s" % (sender, msg))
    elif msgtype == 'message' and _VERBOSITY >= 2:
        print("MSG from pygazetracker.%s: %s" % (sender, msg))
    elif msgtype=='debug' and _VERBOSITY >= 3:
        print("DEBUG pygazetracker.%s: %s" % (sender, msg))

