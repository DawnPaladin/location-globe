var scene, camera, renderer, globe, lines = [];
var spinAmbiently = false;

function sceneSetup() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(750, canvasWidth/canvasHeight, 0.1, 100000);
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(canvasWidth, canvasHeight);
	document.getElementById('globe').appendChild(renderer.domElement);

	var loader = new THREE.OBMLoader();
	loader.load(pathPrefix+'assets/globes_pack_thin26small.obm', function(obj) {
		globe = obj;

		// axial tilt
		globe.rotation.z = degreesToRadians(-23.5);
		globe.rotation.x = degreesToRadians(23.5);
		
		var landMaterial = new THREE.MeshLambertMaterial({ color: 0x5BA7FD });
		var seaMaterial = new THREE.MeshLambertMaterial({ color: 0x101010, transparent: true, opacity: 0.25 });
		globe.children[0].material = landMaterial;
		globe.children[1].material = seaMaterial;
		scene.add(globe);

		var boundingBox = new THREE.Box3().setFromObject(globe);
		globe.radius = boundingBox.max;
		globe.axis = new THREE.Vector3(0,1,0).normalize();
		globe.currentRotation = { degrees: -90, radians: degreesToRadians(-90) };

		populateFacilities(facilities);
	});

	var upperLight = new THREE.PointLight(0xCAECF6);
	upperLight.position.y = 5;
	upperLight.position.x = -5;
	scene.add(upperLight);
	var ambientLight = new THREE.AmbientLight(0x1D2E46);
	scene.add(ambientLight);

	camera.position.z = 6.25;
}
sceneSetup();

function rotateGlobe(radians) {
	// TODO: input degrees instead of radians
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
	rotateGlobe(degreesToRadians(rotationAmount));
}
function gotoFacility(facilityKey) {
	goTo(facilities[facilityKey].lat,facilities[facilityKey].long);
}
function moveTo(lat, long) { // lat is currently unused
	var animationTime = 1000;
	var numSteps = 100;

	var initialLong = globe.currentRotation.degrees;
	var totalRotationAmount = long - initialLong;
	babySteps(function(counter) {
		// console.log(totalRotationAmount, counter, numSteps, initialLong, tween(totalRotationAmount, counter, numSteps, initialLong));
		goTo(lat, tween(totalRotationAmount, counter, numSteps, initialLong));
	}, animationTime, numSteps);
}
function moveToFacility(facilityKey) {
	moveTo(facilities[facilityKey].lat,facilities[facilityKey].long);
}
function tween(delta, position, length, start) {
	return delta * position / length + start;
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
function easeInOutQuad(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t };
function degreesToRadians(degrees) {
	return degrees * (Math.PI/180);
}
function radiansToDegrees(radians) {
	return radians / (Math.PI/180);
}

function animate() {
	requestAnimationFrame(animate);

	if (globe) {
		if (spinAmbiently) 
			rotateGlobe(degreesToRadians(-.5));
		updateFacilities();
		updateNewsStoryLines();
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
		var $marker = $('<img src="'+pathPrefix+'assets/marker.svg" alt="" class="marker" />');
		$marker.attr('id', locationName);
		var locationData = facilities[locationName];
		locationData.marker = $marker;
		var sceneCoords = latLongToSceneCoords(locationData.lat, locationData.long);
		var canvasCoords = sceneToCanvasCoords(sceneCoords);
		$marker.css({
			top: canvasCoords.y,
			left: canvasCoords.x,
			opacity: determineLocationVisibility(canvasCoords) ? 1 : 0,
		});
		$marker.appendTo('#globe');
	}
}
function updateFacilities() {
	for (var locationName in facilities) {
		var locationData = facilities[locationName];
		var $marker = locationData.marker;
		var sceneCoords = latLongToSceneCoords(locationData.lat, locationData.long);
		var canvasCoords = sceneToCanvasCoords(sceneCoords);
		$marker.css({
			top: canvasCoords.y,
			left: canvasCoords.x,
		});

		if ($marker.css('opacity') == 0 && determineLocationVisibility(sceneCoords) == true) {
			$marker.fadeTo(1000, 1);
		}
		if ($marker.css('opacity') == 1 && determineLocationVisibility(sceneCoords) == false) {
			$marker.fadeTo(500, 0);
		}
	}
	two.update();
}
function determineLocationVisibility(point) {
	return point.z > 0.4;
}
function updateNewsStoryLines() {
	lines.forEach(function(line) {
		line.remove();
	});
	lines = [];
	var $storyBullets = $('.news-story[data-lat]');
	$storyBullets.each(function(index, bullet) {
		var latlong = {
			lat: $(bullet).attr('data-lat'),
			long: $(bullet).attr('data-long')
		}
		var sceneCoords = latLongToSceneCoords(latlong.lat, latlong.long);
		var canvasCoords = sceneToCanvasCoords(sceneCoords);

		var canvasLeftOffset = $('#globe').offset().left;
		var canvasTopOffset = $('#globe').offset().top;
		var bulletCoords = {
			x: $(bullet).offset().left - canvasLeftOffset, 
			y: $(bullet).offset().top - canvasTopOffset + 15
		};

        //directLine(lines,canvasCoords,bulletCoords,sceneCoords,index);
        //fancyLineFromBulletThenUpThenPoint(lines,canvasCoords,bulletCoords,sceneCoords,index);
        fancyLineFromBulletThenUp(lines,canvasCoords,bulletCoords,sceneCoords,index);
        //fancyCurveFromBulletThenUp(lines,canvasCoords,bulletCoords,sceneCoords,index);
        drawDotAtLocation(lines,canvasCoords,sceneCoords);
	});
	return lines;
}
function drawDotAtLocation(lines,canvasCoords,sceneCords)
{
    if(!determineLocationVisibility(sceneCords)) { return; }
    var circle = two.makeCircle(canvasCoords.x,canvasCoords.y, 7);
    circle.fill =  "rgb(240,240, 50)";
    circle.stroke = "rgb(255,255, 250)";
    circle.linewidth = 1.2;
    circle.opacity - .7;
    lines.push(circle);

}
function stylizedLine(lines, x1,y1,x2,y2,sceneCords)
{
	if(determineLocationVisibility(sceneCords)) {
        var strokeColor = "rgb(220,220, 50)";
		var scale  = 1.8;
        var line = two.makeLine(x1,y1,x2,y2);
        line.linewidth = 3*scale;
        line.stroke = strokeColor;
        line.opacity = .7;
        lines.push(line);

        var line = two.makeLine(x1,y1,x2,y2);
        line.linewidth = 2*scale;
        line.stroke = strokeColor;
        line.opacity = .8;
        lines.push(line);

        var line = two.makeLine(x1,y1,x2,y2);
        line.linewidth = 1*scale;
        line.stroke = "rgb(255,255, 250)";
        line.opacity = 1.;
        lines.push(line);
    }

}

function fancyCurveFromBulletThenUp(lines, globePoint,bulletPoint,sceneCords,bulletIndex)
{
    if(!determineLocationVisibility(sceneCords)) { return; }
    var staticHeightAdjustmentToHitBullet = -5;
    var curve = two.makeCurve(
        bulletPoint.x,
        bulletPoint.y+staticHeightAdjustmentToHitBullet,

        //globePoint.x,
        //bulletPoint.y+staticHeightAdjustmentToHitBullet,
        globePoint.x,
        bulletPoint.y+staticHeightAdjustmentToHitBullet,
        globePoint.x,
        globePoint.y,
		true
	);
    var strokeColor = "rgb(220,220, 50)";
    curve.linewidth = 3;
    curve.stroke = strokeColor;
    curve.opacity = .9;
    curve.noFill();
	lines.push(curve);

}
function fancyLineFromBulletThenUp(lines, globePoint,bulletPoint,sceneCords,bulletIndex)
{
    var staticHeightAdjustmentToHitBullet = -5;

    //start at the bullet point, move out al the way to the right,
    stylizedLine(lines,
        bulletPoint.x,
        bulletPoint.y+staticHeightAdjustmentToHitBullet,
        globePoint.x,
        bulletPoint.y+staticHeightAdjustmentToHitBullet,
        sceneCords
    );
    //now go straight across to the actual point
    stylizedLine(lines,
        globePoint.x,
        bulletPoint.y+staticHeightAdjustmentToHitBullet,
        globePoint.x,
        globePoint.y,
        sceneCords
	);

}

function fancyLineFromBulletThenUpThenPoint(lines, globePoint,bulletPoint,sceneCords,bulletIndex)
{
	var pixelsFromBullet = 70;
	var staticHeightAdjustmentToHitBullet = -5;
	var lengthIncriment = 20;

    //start at the bullet point, move out some pixels to the right, then go up in progression
    stylizedLine(
		lines,
    	bulletPoint.x,
    	bulletPoint.y+staticHeightAdjustmentToHitBullet,
		bulletPoint.x-pixelsFromBullet-(bulletIndex *lengthIncriment ),
        bulletPoint.y+staticHeightAdjustmentToHitBullet,
        sceneCords
	);

    //now make a straight line uip to go to the position of the globe point
    stylizedLine(
    	lines,
        bulletPoint.x-pixelsFromBullet-(bulletIndex *lengthIncriment ),
        bulletPoint.y+staticHeightAdjustmentToHitBullet,
        bulletPoint.x-pixelsFromBullet-(bulletIndex *lengthIncriment ),
        globePoint.y,
		sceneCords
    );

    //now go straight across to the actual point
    stylizedLine(
    	lines,
        bulletPoint.x-pixelsFromBullet-(bulletIndex *lengthIncriment ),
        globePoint.y,
        globePoint.x,
        globePoint.y,
        sceneCords
    );

}
function directLine(lines, globePoint,bulletPoint,sceneCords,bulletIndex)
{
    stylizedLine(
    	lines,
        bulletPoint.x,
        bulletPoint.y,
        globePoint.x,
        globePoint.y,
        sceneCords
    );
}
