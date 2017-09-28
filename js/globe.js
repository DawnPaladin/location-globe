var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var loader = new THREE.OBJLoader(), globe;
loader.load('assets/globe-countries.obj', function(obj) {
	globe = obj;

	globe.position.y = -40;
	globe.position.x = 20;
	globe.scale.x = globe.scale.y = globe.scale.z = 5;

	scene.add(globe);
});

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add(light);
scene.background = new THREE.Color(0x72645b);

var plane = new THREE.Mesh(
	new THREE.PlaneBufferGeometry( 40, 40 ),
	new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
);
plane.rotation.x = -Math.PI/2;
plane.position.y = -0.5;
scene.add( plane );

plane.receiveShadow = true;

camera.position.y = 5
camera.position.z = 25

function animate() {
	requestAnimationFrame(animate);

	// if (globe) globe.rotation.x += .01;

	renderer.render(scene, camera);
}
animate();
