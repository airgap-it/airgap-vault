window.airGapHasStarted = false

var airGapFallbackErrors = []

window.addEventListener('error', function airGapFallbackErrorHandler(e) {
	airGapFallbackErrors.push(e.error)
})

setTimeout(function() {
	if (!window.airGapHasStarted) {
		var alertConfirmed = confirm(
			"It looks like the app didn't load. " +
				"If this error is a mistake, please report it to us and click 'Cancel' to continue.\n" +
				"If the app did indeed not load, please click 'Ok' to show the error."
		)
		if (alertConfirmed == true) {
			// Title
			window.document.write('<h1>AirGap Error Report</h1>')
			// Add info about browser
			window.document.write('<p>UserAgent: ' + navigator.userAgent + '<br />Language: ' + navigator.language + '</p>')

			if (airGapFallbackErrors.length > 0) {
				window.document.write('<h3>Errors</h3>')
			}
			for (var idx = 0; idx < airGapFallbackErrors.length; idx++) {
				var error = airGapFallbackErrors[idx]
				if (error) {
					window.document.write('<p>' + error.message + '<br />' + error.stack + '</p>')
				}
			}
			window.document.write('<h3>Please send a screenshot of this screen to the AirGap Team.<br />Thank you.</h3>')
		}
	} else {
		window.removeEventListener('error', airGapFallbackErrorHandler)
	}
}, 10000)
asdf.asdfas()
