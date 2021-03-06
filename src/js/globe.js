(function(){
	var two, scene, camera, renderer, globe = [];
	var $globe = $('.globe');
	if (!$globe.length) console.error("Globe element not found");
	var globeElement = $globe[0];
	var spinAmbiently = true;

	function sceneSetup() {
		two = new Two({ width: canvasWidth, height: canvasHeight }).appendTo(globeElement);
		$(two.renderer.domElement).addClass('two');

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(750, canvasWidth/canvasHeight, 0.1, 100000);
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.localClippingEnabled = true;
		renderer.setSize(canvasWidth, canvasHeight);
		globeElement.appendChild(renderer.domElement);

		globeFileExtension = globePath.slice(-3).toUpperCase();
		if (globeFileExtension == "OBJ") {
			console.log("Loading OBJ");
			var loader = new THREE.OBJLoader();
		} else if (globeFileExtension == "OBM") {
			console.log("Loading OBM");
			var loader = new THREE.OBMLoader();
		} else {
			throw "File extension of " + globePath + " not recognized. Cannot load globe.";
		}

		loader.load(globePath, function(obj) {
			globe = obj;

			$globe.removeClass('loading');

			// axial tilt
			globe.rotation.z = degreesToRadians(-23.5);
			globe.rotation.x = degreesToRadians(23.5);

			var clippingPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), -0.2 );
			var flatMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				clippingPlanes: [clippingPlane],
			})
			globe.children[0].material = flatMaterial;
			// var basicMaterial = new THREE.MeshBasicMaterial();
			// globe.children[0].material = basicMaterial;

			scene.add(globe);

			var boundingBox = new THREE.Box3().setFromObject(globe);
			globe.radius = boundingBox.max;
			globe.axis = new THREE.Vector3(0,1,0).normalize();
			globe.currentRotation = { degrees: -90, radians: degreesToRadians(-90) };

			populateFacilities(facilities);
		});

		var ambientLight = new THREE.AmbientLight(0xffffff);
		scene.add(ambientLight);

		camera.position.z = 5.25;
	}
	sceneSetup();

	function hoverCircleSetup() {
		var circleDiameter = canvasWidth * .8;
		var circleOffset = canvasWidth * .1;
		$('.hoverCircle, .bgGlow').css({
			width: circleDiameter,
			height: circleDiameter,
			left: circleOffset,
			top: circleOffset,
		});

		$globe
			.on('mouseover', '.hoverCircle, .bubble, .bubble-target', function() {
				spinAmbiently = false;
				$('.bgGlow').css('opacity', .5);
			})
			.on('mouseout', '.hoverCircle, .bubble, .bubble-target', function() {
				spinAmbiently = true;
				$('.bgGlow').css('opacity', 0);
			})
		;
	}
	hoverCircleSetup();

	function rotateGlobe(degrees) {
		if (!globe.axis || !globe.radius) return;
		var radians = degreesToRadians(degrees);
		var rotObjectMatrix = new THREE.Matrix4();
		rotObjectMatrix.makeRotationAxis(globe.axis.normalize(), -radians);
		globe.matrix.multiply(rotObjectMatrix);
		globe.rotation.setFromRotationMatrix(globe.matrix);
		globe.currentRotation.radians += radians;
		globe.currentRotation.degrees += radiansToDegrees(radians);
	}

	function goTo(lat, long) { // lat is currently unused
		var initialLong = globe.currentRotation.degrees;
		var rotationAmount = long - initialLong;
		rotateGlobe(rotationAmount);
	}
	function gotoFacility(facilityKey) {
		goTo(facilities[facilityKey].lat,facilities[facilityKey].long);
	}
	function moveTo(lat, long) {
		var animationTime = 1000;
		var numSteps = 100;

		var initialLong = globe.currentRotation.degrees;
		var totalRotationAmount = long - initialLong;
		babySteps(function(counter) {
			// console.log(totalRotationAmount, counter, numSteps, initialLong, tween(totalRotationAmount, counter, numSteps, initialLong));
			goTo(lat, tween(totalRotationAmount, counter, numSteps, initialLong, easeInOutQuart));
		}, animationTime, numSteps);
	}
	function moveToFacility(facilityKey) {
		moveTo(facilities[facilityKey].lat,facilities[facilityKey].long);
	}
	function tween(delta, position, length, start, easingFunction) {
		return delta * easingFunction(position / length) + start;
	}
	function babySteps(callback, animationTime, numSteps) { // run the callback numSteps times over animationTime
		var animationInterval = animationTime / numSteps;
		var counter = 0;
		var interval = setInterval(function() {
			callback(counter);
			counter++;
			if (counter == numSteps) clearInterval(interval);
		}, animationInterval);
	}
	function easeInOutQuart(t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t }; // from https://gist.github.com/gre/1650294
	function degreesToRadians(degrees) {
		return degrees * (Math.PI/180);
	}
	function radiansToDegrees(radians) {
		return radians / (Math.PI/180);
	}

	function animate() {
		requestAnimationFrame(animate);

		if (globe.radius) {
			if (spinAmbiently)
				rotateGlobe(-.25);
			updateFacilities();
		}

		renderer.render(scene, camera);
	}
	animate();

	function latLongToSceneCoords(lat, long) {
		lat = Number(lat);
		long = Number(long);
		var sceneCoords = new THREE.Vector3();
		var radius = globe.radius.y;
		var phi = (90-lat)*(Math.PI/180);
		var theta = (long+180)*(Math.PI/180);

		sceneCoords.x = -((radius) * Math.sin(phi)*Math.cos(theta));
		sceneCoords.z = ((radius) * Math.sin(phi)*Math.sin(theta));
		sceneCoords.y = ((radius) * Math.cos(phi));

		rotObjectMatrix = new THREE.Matrix4();
		rotObjectMatrix.makeRotationFromQuaternion(globe.quaternion);
		sceneCoords.applyQuaternion(globe.quaternion);

		return sceneCoords;
	}
	function sceneToCanvasCoords(sceneCoords) {
		// adapted from https://stackoverflow.com/q/10473852/1805453
		var vector = new THREE.Vector3();
		var canvas = renderer.domElement;
		vector.set(sceneCoords.x, sceneCoords.y, sceneCoords.z);

		vector.project(camera);

		vector.x = Math.round( (  vector.x + 1 ) * canvas.width  / 2 );
		vector.y = Math.round( ( -vector.y + 1 ) * canvas.height / 2 );
		vector.z = 0;

		return vector;
	}

	function populateFacilities() {
		for (var locationName in facilities) {
			var locationData = facilities[locationName];
			var $markerBox = $('<div class="bubble-target">');
			var $marker = $('<a>')
				.attr('href', locationData.url)
				.attr('id', locationName)
				.html('<img src="'+pathPrefix+'marker.svg" alt="'+locationData.fullName+'" class="marker" />')
			;
			var $bubble = $('<div class="bubble">');
			var $bubbleLink = $('<a>')
				.attr('href', locationData.url)
				.text(locationData.fullName)
			;
			$bubble.append($bubbleLink);
			locationData.markerBox = $markerBox;
			var sceneCoords = latLongToSceneCoords(locationData.lat, locationData.long);
			var canvasCoords = sceneToCanvasCoords(sceneCoords);
			$markerBox.css({
				top: canvasCoords.y,
				left: canvasCoords.x,
				opacity: determineLocationVisibility(sceneCoords) ? 1 : 0,
			});
			// debugger;
			$markerBox.append($marker, $bubble);
			$markerBox.appendTo($globe);
		}
	}
	function updateFacilities() {
		for (var locationName in facilities) {
			var locationData = facilities[locationName];
			var $markerBox = locationData.markerBox;
			var sceneCoords = latLongToSceneCoords(locationData.lat, locationData.long);
			var canvasCoords = sceneToCanvasCoords(sceneCoords);
			$markerBox.css({
				top: canvasCoords.y,
				left: canvasCoords.x,
			});

			if ($markerBox.css('opacity') == 0 && determineLocationVisibility(sceneCoords) == true) {
				$markerBox.fadeTo(1000, 1);
			}
			if ($markerBox.css('opacity') == 1 && determineLocationVisibility(sceneCoords) == false) {
				$markerBox.fadeTo(500, 0);
			}
		}
		two.update();
	}
	function determineLocationVisibility(point) {
		return point.z > 0.4;
	}
})();
