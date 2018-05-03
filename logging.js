// Modified from 6.813/6.831 source code

// This is currently set up to log every mousedown and keydown
// event, as well as any events that might be triggered within
// the app by triggering the 'log' event anywhere in the doc
// as follows:
// document.dispatchEvent(new CustomEvent('log', { detail: {
//   name: 'myevent',
//   info: {key1: val1, key2: val2}
// }}));

var ENABLE_NETWORK_LOGGING = true; // Controls network logging.
var ENABLE_CONSOLE_LOGGING = true; // Controls console logging.
var USER_NUMBER = '0';             // Change this for each user test. 0 = debugging

// These event types are intercepted for logging before jQuery handlers.
var EVENT_TYPES_TO_LOG = {
	mousedown: true,
	keydown: true
};

// These event properties are copied to the log if present.
var EVENT_PROPERTIES_TO_LOG = {
	which: true,
	pageX: true,
	pageY: true
};

(function() {
	// Hooks up all the event listeners.
	function hookEventsToLog() {
		// Set up low-level event capturing.  This intercepts all
		// native events before they bubble, so we log the state
		// *before* normal event processing.
		for (var event_type in EVENT_TYPES_TO_LOG) {
			document.addEventListener(event_type, logEvent, true);
		}

		// Once the page is loaded, show our own unique id.
    document.addEventListener("DOMContentLoaded", function () {
      console.log('Logging as USER_NUMBER: ', USER_NUMBER);
    });

    // Listen to 'log' events which are triggered anywhere in the document.
    document.addEventListener("log", function(evt) {
      var detail = evt.detail;
      logEvent(null, detail.name, detail.info);
    });
	}

	// Returns a CSS selector that is descriptive of
	// the element, for example, "td.left div" for
	// a class-less div within a td of class "left".
	function elementDesc(elt) {
		if (elt == document) {
			return 'document';
		} else if (elt == window) {
			return 'window';
		}
		function descArray(elt) {
			var desc = [elt.tagName.toLowerCase()];
			if (elt.id) {
				desc.push('#' + elt.id);
			}
			for (var j = 0; j < elt.classList.length; j++) {
				desc.push('.' + elt.classList[j]);
			}
			return desc;
		}
		var desc = [];
		while (elt && desc.length <= 1) {
			var desc2 = descArray(elt);
			if (desc.length == 0) {
				desc = desc2;
			} else if (desc2.length > 1) {
				desc2.push(' ', desc[0]);
				desc = desc2;
			}
			elt = elt.parentElement;
		}
		return desc.join('');
	}

	// Log the given event.
	function logEvent(event, customName, customInfo) {
		var time = (new Date).getTime();
		var name = customName || event.type;

    infoObj = {};

		// And monitor a few interesting fields from the event, if present.
		for (var key in EVENT_PROPERTIES_TO_LOG) {
			if (event) {
				if (key in event) {
					infoObj[key] = event[key];
				}
			}
		}
		// Let a custom event add fields to the info.
		if (customInfo) {
			infoObj = Object.assign(infoObj, customInfo);
		}
		var info = JSON.stringify(infoObj);
		var target = document;
		if (event) {
			var target = elementDesc(event.target);
		}

		if (ENABLE_CONSOLE_LOGGING) {
			console.log(USER_NUMBER, time, name, target, info);
		}
		if (ENABLE_NETWORK_LOGGING) {
			sendLogging(USER_NUMBER, time, name, target, info);
		}
	}

	// OK, go.
	if (ENABLE_NETWORK_LOGGING) {
		hookEventsToLog();
	}

})();

/////////////////////////////////////////////////////////////////////////////
// The following code was written as follows:
// curl -sL goo.gl/jUkahv | python - https://docs.google.com/forms/d/12npKmy8-vfAeR0CwnmTLcAHfARvcJVq8sBPhk2HE72Q/edit
/////////////////////////////////////////////////////////////////////////////

// Logging submission function
// submits to the google form at this URL:
// docs.google.com/forms/d/12npKmy8-vfAeR0CwnmTLcAHfARvcJVq8sBPhk2HE72Q/edit
function sendLogging(
    userNumber,
    time,
    name,
    target,
    info) {
  var formid = "e/1FAIpQLSfI7SEXivnTh3eHFrBaLpfAKhuybjkRASkI77ilA_GQRmTirg";
  var data = {
    "entry.1803563511": userNumber,
    "entry.1647475002": time,
    "entry.2076984400": name,
    "entry.1441346759": target,
    "entry.661783182": info
  };
  var params = [];
  for (key in data) {
    params.push(key + "=" + encodeURIComponent(data[key]));
  }
  // Submit the form using an image to avoid CORS warnings.
  (new Image).src = "https://docs.google.com/forms/d/" + formid +
     "/formResponse?" + params.join("&");
}
