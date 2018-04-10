# -*- coding: utf-8 -*-
from pygazetracker.__init__ import _message
from pygazetracker.generic import EyeTracker
import cv2


# # # # #
# SETUP
#
# A function that sets up the WebCam EyeTracker.

def setup(camnr=0, mode='RGB', **kwargs):
    """
    """

    # Open WebCamTracker.
    tracker = WebCamTracker(camnr=camnr, mode=mode, **kwargs)

    # OpenCV keycodes on Windows.
    # TODO: Put these in a dict, and handle their purpose through a separate function.
    up = 2490368
    down = 2621440
    left = 2424832
    right = 2555904
    space = 32
    escape = 27

    # Stream the collected images.
    running = True
    while running:

        # PROCESS FRAME
        # Get a frame.
        success, frame = tracker._get_frame()

        # Only process the frame if there is one.
        if success:
            # Write the current threshold on the frame.
            cv2.putText(frame, "pupthresh = %d" % (tracker._pupt),
                        (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, 255)
        # TODO: TASK ITEMS
        """
        # TODO: Rewrite image processing functions in 'generic'
        # with an optional setup/debug keyword that activates the
        # returning of variables we need for drawing the things that
        # are relevant to setting up the tracker, e.g. face offset,
        # eye offset, pupil rect.
        # TODO: Draw a rect around face.
        # TODO: Draw rects around the eyes.
        # TODO: Draw rects around the pupils.
        # TODO: Shade thresholded pixels in the pupil.
        """

        # USER INTERACTION
        if success:
            # Show the frame
            cv2.imshow('PyGazeTracker Setup', frame)
            # Briefly wait for a key press
            keycode = cv2.waitKey(10)
            if keycode != -1:
                print(keycode)
            if keycode == up:
                tracker._pupt += 1
            elif keycode == down:
                tracker._pupt -= 1
            elif keycode == left:
                tracker._glit -= 1
            elif keycode == right:
                tracker._glit += 1
            elif keycode == space or keycode == escape:
                running = False

    return tracker


# # # # #
# WEBCAM EYE-TRACKER
#
# A class for tracking pupils and (optionally) glints in a webcam stream
# obtained through OpenCV.

class WebCamTracker(EyeTracker):
    """OpenCV implementation of a webcam eye-tracker.
    """

    def connect(self, camnr=0, mode='RGB', **kwargs):

        """Use this function to implement the initialisation of a specific
        type of eye tracking.

        camnr			-	Integer that indicates what webcam should be
                        used. Default = 0.

        mode			-	String that indicates how the captured frame
                        should be processed before it's returned.
                        'R' returns the red component of the frame,
                        'G' returns the green component of the frame,
                        'B' returns the blue component of the frame,
                        'RGB' returns the greyscale version of the
                        frame (converted by OpenCV). Default = 'RGB'.
        """

        # Only initialise if it hasn't been done yet.
        if not self._connected:
            # Set mode and camera number
            self._camnr = camnr
            self._mode = mode

            # DEBUG message.
            _message('debug', 'webcam.WebCamTracker.connect',
                     "Connecting to webcam %d." % self._camnr)

            # Initialise the webcam.
            self._vidcap = cv2.VideoCapture(self._camnr)
            self._connected = True

            # DEBUG message.
            _message('debug', 'webcam.WebCamTracker.connect',
                     "Successfully connected to webcam %d!" % self._camnr)

    def _get_frame(self):

        """Reads the next frame from the active OpenCV VideoCapture.

        Keyword Arguments

        Returns

        success, frame	-	success is a Boolean that indicates whether
                        a frame could be obtained.
                        frame is a numpy.ndarray with unsigned,
                        8-bit integers that reflect the greyscale
                        values of the image. If no frame could be
                        obtained, None will be returned.
        """

        # Take a photo with the webcam.
        # (ret is the return value: True if everything went ok, False if
        # there was a problem. frame is the image taken from the webcam as
        # a NumPy ndarray, where the image is coded as BGR
        ret, frame = self._vidcap.read()

        # If a new frame was available, proceed to process and return it.
        if ret:
            # Return the red component of the obtained frame.
            if self._mode == 'R':
                return ret, frame[:, :, 2]
            # Return the green component of the obtained frame.
            elif self._mode == 'G':
                return ret, frame[:, :, 1]
            # Return the blue component of the obtained frame.
            elif self._mode == 'B':
                return ret, frame[:, :, 0]
            # Convert to grey.
            elif self._mode == 'RGB':
                return ret, cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Throw an exception if the mode can't be recognised.
            else:
                _message('error', 'webcam.WebCamTracker._get_frame',
                         "Mode '%s' not recognised. Supported modes: 'R', 'G', 'B', or 'RGB'."
                         % (self._mode))

        # If a new frame wasn't available, return None.
        else:
            return ret, None

    def _close(self):

        """Closes the connection to the OpenCV VideoCapture.
        """

        # DEBUG message.
        _message('debug', 'webcam.WebCamTracker.close',
                 "Disconnecting from webcam.")

        # Release the video capture from the current webcam.
        self._vidcap.release()

        # DEBUG message.
        _message('debug', 'webcam.WebCamTracker.close',
                 "Successfully disconnected from webcam.")

def scroll_gaze(left_pupil, left_eye_size, right_pupil, right_eye_size):
    """
    Returns whether gaze is scrolling (i.e. looking at top-center of screen).
    :param left_pupil: position of left_pupil pixel in the left eye frame as tuple (x_pixel, y_pixel)
    :param left_eye_size: dimensions of bounding box of
    :param right_pupil: position of right_pupil pixel in the right eye frame as tuple (x_pixel, y_pixel)
    :param right_eye_size:
    :return:
    """
    pass


if __name__ == '__main__':

    import time
    from matplotlib import pyplot

    from pygazetracker.__init__ import _EYECASCADE, _FACECASCADE
    import generic

    # Constants
    MODE = 'B'
    DEBUG = False

    # Initialise a new tracker instance.
    tracker = WebCamTracker(camnr=0, mode=MODE, debug=DEBUG)
    # Get a single frame.
    success = False
    while not success:
        t0 = time.time()
        success, frame = tracker._get_frame()
    # Close the connection with the tracker.
    tracker.close()

    # Cascades
    face_cascade = cv2.CascadeClassifier(_FACECASCADE)
    eye_cascade = cv2.CascadeClassifier(_EYECASCADE)

    # Crop the face and the eyes from the image.
    success, facecrop = generic._crop_face(frame, face_cascade,
                                           minsize=(30, 30))
    success, eyes = generic._crop_eyes(facecrop, eye_cascade,
                                       Lexpect=(0.7, 0.4), Rexpect=(0.3, 0.4), maxdist=None, maxsize=None)
    # Find the pupils in both eyes
    B = generic._find_pupils(eyes[0], eyes[1], glint=True, mode='diameter')
    left_pupil = (B[0][0], B[0][1])
    right_pupil = (B[1][0], B[1][1])
    t1 = time.time()

    # Process results
    print("Elapsed time: %.3f ms" % (1000 * (t1 - t0)))
    print(len(eyes[0]), len(eyes[0][0]))
    print(B)
    pyplot.figure();
    pyplot.imshow(eyes[0], cmap='gray')
    pyplot.figure();
    pyplot.imshow(eyes[1], cmap='gray')
    pyplot.show()
# # # # #
