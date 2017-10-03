var scene, camera, renderer, globe, rotWorldMatrix, rotObjectMatrix, lines = [];
function sceneSetup() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(750, 1, 0.1, 100000);
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(500, 500);
	document.getElementById('globe').appendChild(renderer.domElement);

	var loader = new THREE.OBMLoader();
	loader.load('assets/globes_pack_thin26small.obm', function(obj) {
		globe = obj;

		globe.rotation.z = -23.5 * ( Math.PI / 180);
		globe.rotation.x = 23.5 * ( Math.PI / 180);

		var landMaterial = new THREE.MeshLambertMaterial({ color: 0x5BA7FD });
		var seaMaterial = new THREE.MeshLambertMaterial({ color: 0x101010, transparent: true, opacity: 0.25 });
		globe.children[0].material = landMaterial;
		globe.children[1].material = seaMaterial;
		scene.add(globe);

		var box = new THREE.Box3().setFromObject(globe);
		globe.radius = box.max;

		populateFacilities(facilities);
		// lines = createNewsStoryLines();
	});

	var upperLight = new THREE.PointLight(0xCAECF6);
	upperLight.position.y = 5;
	upperLight.position.x = -5;
	scene.add(upperLight);
	var ambientLight = new THREE.AmbientLight(0x1D2E46);
	scene.add(ambientLight);

	camera.position.y = .9;
	camera.position.z = 6.25;
	camera.rotation.x = -0.2;
}
sceneSetup();

function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}

function animate() {
	requestAnimationFrame(animate);

	if (globe) {
		rotateAroundObjectAxis(globe,new THREE.Vector3(0,1,0).normalize(),.4 * (Math.PI/180));
		updateFacilities();
		updateNewsStoryLines();
	}

	renderer.render(scene, camera);
}
animate();

function latLongToSceneCoords(lat, lon) {
	lat = Number(lat);
	lon = Number(lon);
	var sceneCoords = new THREE.Vector3();
	var radius = globe.radius.y;
	var phi   = (90-lat)*(Math.PI/180);
	var theta = (lon+180)*(Math.PI/180);

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
		var $marker = $('<img src="assets/marker.svg" alt="" class="marker" />');
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

		var line = two.makeLine(
			bulletCoords.x,
			bulletCoords.y, 
			canvasCoords.x, 
			canvasCoords.y
		);
		line.latlong = latlong;
		lines.push(line);
	});
	return lines;
}
