// loader.js

/**
 * Loads all the scripts passed to it, returning a promise that they've all loaded.
 * @param {string[]} urls: An array of URLs to load
 * @param {boolean} async Load asynchronously
 * @param {boolean} debug Enable to print a console message when a script starts and finishes loading
 * @returns {promise} A promise that all the URLs have loaded
 */
function loadScripts(urls, async, debug) {
	var promises = urls.map(function(url) {
		if (debug) console.log("Loading", url, "with async = ", async);
		return $.ajax({
			url: url,
			dataType: "script",
			cache: true,
			async: async,
			error: function(jqXHR, textStatus, errorThrown) {
				console.error("Couldn't load script: ", url, textStatus, errorThrown, jqXHR);
			},
			complete: function() {
				if (debug) console.log("Loaded", url);
			}
		});
	});
	return $.when(promises);
}
/**
 * 
 * @param {string} url A URL to load
 * @param {boolean} async Load asynchronously
 * @param {boolean} debug Enable to print a console message when a script starts and finishes loading
 * @returns {promise} A promise that the URL has loaded
 */
function loadScript(url, async, debug) {
	return loadScripts([url], async, debug);
}

///
var canvasWidth = 800, canvasHeight = 800, pathPrefix = "/hki-sitefinity-theme/news-globe/";
$('.globe').css({ width: canvasWidth, height: canvasHeight });
///

loadScripts([
	"/hki-sitefinity-theme/news-globe/vendor/two.js",
	"/hki-sitefinity-theme/news-globe/vendor/three.js",
	"/hki-sitefinity-theme/news-globe/facilities.js",
], false, true).done(function() {
	return loadScript("/hki-sitefinity-theme/news-globe/vendor/OBJLoader.js", false, true);
}).done(function() {
	return loadScript("/hki-sitefinity-theme/news-globe/vendor/OBMLoader.min.js", false, true);
}).done(function() {
	return loadScript("/hki-sitefinity-theme/news-globe/globe.js", true, true);
});
