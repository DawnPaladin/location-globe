var scene, camera, renderer, globe;
function sceneSetup() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	var loader = new THREE.OBJLoader();
	loader.load('assets/globes_pack_thin26.obj', function(obj) {
		globe = obj;
	
		// var mat = new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } );
	
		console.log(globe);
		// globe.traverse(function(child) {
		// 	child.material = mat;
		// })
		// globe.children[1].material = mat;
	
		scene.add(globe);
	})
	
	var light = new THREE.PointLight( 0x404040 ); // soft white light
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

	if (globe) globe.rotation.y += .001;

	renderer.render(scene, camera);
}
animate();

function sceneToScreenCoords(x, y, z) {
	var vector = new THREE.Vector3();
	var canvas = renderer.domElement;
	vector.set(x, y, z);

	vector.project(camera);

	vector.x = Math.round( (  vector.x + 1 ) * canvas.width  / 2 );
	vector.y = Math.round( ( -vector.y + 1 ) * canvas.height / 2 );
	vector.z = 0;

	return vector;
}
var $center = $('<img src="assets/marker.svg" alt="" class="marker" />');
var coords = sceneToScreenCoords(0,0,0);
$center.css({
	top: coords.y,
	left: coords.x
});
$center.appendTo('body');