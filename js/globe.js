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

		test();
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

	// if (globe) globe.rotation.y += .001;

	renderer.render(scene, camera);
}
animate();

function latLongToSceneCoords(lat, lon) {
	var out = new THREE.Vector3();
	var radius = globe.radius.y;
	
	var phi   = (90-lat)*(Math.PI/180)
	var theta = (lon+180)*(Math.PI/180)

	out.x = -((radius) * Math.sin(phi)*Math.cos(theta))
	out.z = ((radius) * Math.sin(phi)*Math.sin(theta))
	out.y = ((radius) * Math.cos(phi))

	return out;
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

function test() {
	var $southPole = $('<img src="assets/marker.svg" alt="" class="marker" />');
	var sceneCoords = latLongToSceneCoords(32.777663, -96.630416);
	var screenCoords = sceneToScreenCoords(sceneCoords);
	console.log("sceneCoords:", sceneCoords, "screenCoords", screenCoords);
	$southPole.css({
		top: screenCoords.y,
		left: screenCoords.x
	});
	var $body = $('body');
	$body.append($southPole);
}
