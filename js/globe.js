var scene, camera, renderer, globe;
function sceneSetup() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(500, 500);
	document.getElementById('globe').appendChild(renderer.domElement);

	var loader = new THREE.OBMLoader();
	loader.load('assets/globes_pack_thin26small.obm', function(obj) {
		globe = obj;

		var landMaterial = new THREE.MeshLambertMaterial({ color: 0x5BA7FD });
		var seaMaterial = new THREE.MeshLambertMaterial({ color: 0x101010, transparent: true, opacity: 0.25 });
		globe.children[0].material = landMaterial;
		globe.children[1].material = seaMaterial;
		scene.add(globe);

		var box = new THREE.Box3().setFromObject(globe);
		globe.radius = box.max;

		populateFacilities(facilities);		
	});

	var upperLight = new THREE.PointLight(0xCAECF6);
	upperLight.position.y = 5;
	upperLight.position.x = -5;
	scene.add(upperLight);
	var ambientLight = new THREE.AmbientLight(0x1D2E46);
	scene.add(ambientLight);

	camera.position.y = 0.5;
	camera.position.z = 2.25;
	camera.rotation.x = -0.2;
}
sceneSetup();

function animate() {
	requestAnimationFrame(animate);

	if (globe) {
		globe.rotation.y += .005;
		updateFacilities();
	}

	renderer.render(scene, camera);
}
animate();

function latLongToSceneCoords(lat, lon) {
	var sceneCoords = new THREE.Vector3();
	var radius = globe.radius.y;
	var rotation = globe.rotation.y;
	
	var phi   = (90-lat)*(Math.PI/180);
	var theta = (lon+180)*(Math.PI/180) + rotation;

	sceneCoords.x = -((radius) * Math.sin(phi)*Math.cos(theta));
	sceneCoords.z = ((radius) * Math.sin(phi)*Math.sin(theta));
	sceneCoords.y = ((radius) * Math.cos(phi));

	return sceneCoords;
}

function sceneToScreenCoords(sceneCoords) {
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
		var screenCoords = sceneToScreenCoords(sceneCoords);
		var point = new THREE.Points();
		point.position.x = sceneCoords.x;
		point.position.y = sceneCoords.y;
		point.position.z = sceneCoords.z;
		scene.add(point);
		locationData.point = point;
		$marker.css({
			top: screenCoords.y,
			left: screenCoords.x,
			opacity: determineLocationVisibility(point) ? 1 : 0,
		});
		$marker.appendTo('#globe');
	}
}
function updateFacilities() {
	for (var locationName in facilities) {
		var locationData = facilities[locationName];
		var $marker = locationData.marker;
		var sceneCoords = latLongToSceneCoords(locationData.lat, locationData.long);
		var screenCoords = sceneToScreenCoords(sceneCoords);
		$marker.css({
			top: screenCoords.y,
			left: screenCoords.x,
		});

		if ($marker.css('opacity') == 0 && determineLocationVisibility(sceneCoords) == true) {
			$marker.fadeTo(1000, 1);
		}
		if ($marker.css('opacity') == 1 && determineLocationVisibility(sceneCoords) == false) {
			$marker.fadeTo(500, 0);
		}
	}
}
function determineLocationVisibility(point) {
	return point.z > 0.4;
}