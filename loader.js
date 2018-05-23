/**
 * Loads all the scripts passed to it, returning a promise that they've all loaded.
 * @param {string[]} urls: An array of URLs to load
 * @param {boolean} debug: Enable to print a console message when a script starts and finishes loading
 * @returns {promise} A promise that all the URLs have loaded
 */
function loadScripts(urls, debug) {
	function addScriptToPromises(promises, url) {
		if (debug) console.log("Adding " + url + " to promises");
		promises.push($.ajax({
			url: url,
			dataType: "script",
			cache: true,
			error: function(jqXHR, textStatus, errorThrown) {
				console.error("Couldn't load script: ", url, textStatus, errorThrown, jqXHR);
			},
			complete: function() {
				if (debug) console.log("Loaded", url);
			}
		}));
	}
	
	var promises = [];
	urls.forEach(function(url) { addScriptToPromises(promises, url); });
	return Promise.all(promises);
}

///
var canvasWidth = 800, canvasHeight = 800, pathPrefix = "/hki-sitefinity-theme/news-globe/";
$('.globe').css({ width: canvasWidth, height: canvasHeight });
///

loadScripts([
	"/hki-sitefinity-theme/news-globe/vendor/two.js",
	"/hki-sitefinity-theme/news-globe/vendor/three.js",
	"/hki-sitefinity-theme/news-globe/facilities.js",
]).then(function() {
	return loadScripts(["/hki-sitefinity-theme/news-globe/vendor/OBJLoader.js"]);
}).then(function() {
	return loadScripts(["/hki-sitefinity-theme/news-globe/vendor/OBMLoader.min.js"]);
}).then(function() {
	return loadScripts(["/hki-sitefinity-theme/news-globe/globe.js"]);
});