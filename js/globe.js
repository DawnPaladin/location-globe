var scene, camera, renderer, globe;
function sceneSetup() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	var loader = new THREE.OBMLoader();
	loader.load('assets/globes_pack_thin26small.obm', function(obj) {
		globe = obj;

		// var mat = new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } );

		console.log(globe);
		// globe.traverse(function(child) {
		// 	child.material = mat;
		// })
		// globe.children[1].material = mat;

		scene.add(globe);

		var box = new THREE.Box3().setFromObject(globe);
		globe.radius = box.max;

		populateLocations(locations);		
	});

	var light = new THREE.PointLight(0x404040); // soft white light
	light.position.y = 5;
	light.position.x = -5;
	scene.add(light);
	scene.background = new THREE.Color(0x72645b);

	camera.position.y = 1;
	camera.position.z = 3;
	camera.rotation.x = -0.4;
}
sceneSetup();

function animate() {
	requestAnimationFrame(animate);

	if (globe) {
		globe.rotation.y += .01;
		updateLocations();
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

var locations = {
	Dallas: {
		lat: 32.777663, 
		long: -96.630416
	}
}
function populateLocations() {
	for (var locationName in locations) {
		var $marker = $('<img src="assets/marker.svg" alt="" class="marker" />');
		$marker.attr('id', locationName);
		var locationData = locations[locationName];
		locationData.marker = $marker;
		var sceneCoords = latLongToSceneCoords(locationData.lat, locationData.long);
		var screenCoords = sceneToScreenCoords(sceneCoords);
		$marker.css({
			top: screenCoords.y,
			left: screenCoords.x
		});
		$marker.appendTo('body');
	}
}
function updateLocations() {
	for (var locationName in locations) {
		var locationData = locations[locationName];
		var $marker = locationData.marker;
		var sceneCoords = latLongToSceneCoords(locationData.lat, locationData.long);
		var screenCoords = sceneToScreenCoords(sceneCoords);
		$marker.css({
			top: screenCoords.y,
			left: screenCoords.x
		});
	}
}