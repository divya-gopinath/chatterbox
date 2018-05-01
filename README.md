# 6835-project

## Using the Chat

### Setup
1. Install Node.js  
2. Navigate to directory ```6835-project```
3. Run ```npm install```

### Running the Chat
1. Run ```npm start```
2. Open a browser and go to ```localhost:3000```


### Working on gaze
- Press randomly on the screen while looking at the cursor to calibrate (we should eventually make a calibration screen popup)
    - Right now, ```WebGazer.setRegression```will start tracking as soon as ```scroll.js``` is loaded. I think we should create some element (not a separate page, but a div
      within the main index page-- not sure how)  with a bunch of buttons or dots that you click to calibrate (edges of screen, middle, etc.) and they disappear as you click.
- Click the eye button to (supposedly) begin tracking-- right now this isn't fully implemented
    - Tracking should cause a red dot (```gazeDot``` in the ```WebGazer.js``` code) to appear on the screen
    - Need to debug and finetune scrolling -- something is printed when scroll event triggered

#### JS TODO Pre-Demo:
- ~~create welcome & end screen for calibration popup~~
- ~~change "i have joined" to welcome message~~
- ~~create "Recalibrate button"~~
- ~~remove console logs~~

#### JS TODO:
- ~~get rid of popup on page load~~
- min-width of messages is currently set by name
- disable scrolling when typing
- ~~add X button to calibration popup (Besides first one)~~
- Make robust to same usernames (esp welcome message)
- Look at saving gaze calibration data for multiple sessions?
- remove gaze tracking and voice recording on popup (specifically recalibrate)
