var newsStories = [
	{
		headline: "McDonald's Gallery Walk Suppliers Video",
		date: "June 19, 2017",
		locationKey: "Chicago"
	}, {
		headline: "H&K New ERP Coming Soon",
		date: "May 30, 2017",
		locationKey: "Worldwide"
	}, {
		headline: "35 Years at H&K Dallas",
		date: "April 12, 2017",
		locationKey: "Dallas"
	}, {
		headline: "H&K Mexico Celebrate 25 Years",
		date: "April 12, 2017",
		locationKey: "SanLuisPotosi"
	}
];
var newsLocations = {
	Dallas: {
		mapText: "Dallas, TX",
		coords: facilities.Dallas,
	},
	Worldwide: {
		mapText: "Worldwide",
		coords: null
	},
	Chicago: {
		mapText: "Chicago, USA",
		coords: {
			lat: 41.8336479,
			long: -87.8720461
		}
	},
	SanLuisPotosi: {
		mapText: "San Luis Potosi, Mexico",
		coords: facilities.SanLuisPotosi,
	}
};

var two = new Two({ width: canvasWidth, height: canvasHeight }).appendTo($('#globe')[0]);
$(two.renderer.domElement).addClass('two');

newsStories.forEach(function populateNewsStories(story, index) {
	var location = newsLocations[story.locationKey];
	story.coords = location.coords;
	var $bullet = $('<li class="news-story">')
		.attr('id', 'story-' + index)
		.append("<div class='headline'>" + story.headline + "</div>")
		.append("<div class='byline'>" + story.date + " - " + location.mapText.toUpperCase() + "</div>")
		.appendTo('#news-list')
	if (story.hasOwnProperty('coords') && story.coords) {
		$bullet
			.attr('data-lat', story.coords.lat)
			.attr('data-long', story.coords.long)
	}
});
