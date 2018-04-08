import cv2

# cap = cv2.VideoCapture(0) # video capture source camera (Here webcam of laptop)
# ret,frame = cap.read() # return a single frame in variable `frame`
#
# while(True):
#     cv2.imshow('img1',frame) #display the captured image
#     if cv2.waitKey(1) & 0xFF == ord('y'): #save on pressing 'y'
#         cv2.imwrite('image.png',frame)
#         cv2.destroyAllWindows()
#         break
#
# cap.release()

cv2.namedWindow("preview")
vc = cv2.VideoCapture(0)

if vc.isOpened(): # try to get the first frame
    rval, frame = vc.read()
else:
    rval = False

while rval:
    cv2.imshow("preview", frame)
    rval, frame = vc.read()
    key = cv2.waitKey(20)
    if key == 121: # if y save picture
        cv2.imwrite('image.png',frame)
    if key == 27: # exit on ESC
        break

cv2.destroyWindow("preview")
vc.release()
