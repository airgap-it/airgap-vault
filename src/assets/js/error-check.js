window.airGapHasStarted = false

var airGapFallbackErrors = []

function airGapFallbackErrorHandler (e) {
	airGapFallbackErrors.push(e.error)
}

window.addEventListener('error', airGapFallbackErrorHandler, false)

setTimeout(function () {
	if (!window.airGapHasStarted) {
		var alertConfirmed = confirm(
			"It looks like AirGap Vault is not able to load. " +
			"If this is shown by mistake, please report it to the AirGap Support and click 'Cancel' to continue.\n" +
			"If the app did indeed not load, please click 'Ok' to display the error report."
		)
		if (alertConfirmed == true) {
			var text = '';
			// Title
			text += '<h1>AirGap Error Report</h1>'

			// Add info about browser
			text += '<p>UserAgent: ' + navigator.userAgent + '<br />Language: ' + navigator.language + '</p>'

			if (airGapFallbackErrors.length > 0) {
				text += '<h3>Errors</h3>'

				for (var idx = 0; idx < airGapFallbackErrors.length; idx++) {
					var error = airGapFallbackErrors[idx]
					if (error) {
						text += '<p>' + error.message + '<br />' + error.stack + '</p>'
					}
				}
			}
			text += '<h3>Reach out to the AirGap Support on Telegram (https://t.me/AirGap) or Email (hi@airgap.it). Please provide a screenshot or photo of this screen.<br />Thank you.</h3>'

			// Overwrite the whole content of the page with our text
			window.document.write(text)
		}
	} else {
		console.debug('App has started, removing error listener')
		window.removeEventListener('error', airGapFallbackErrorHandler)
		airGapFallbackErrors = []
	}
}, 10000)
