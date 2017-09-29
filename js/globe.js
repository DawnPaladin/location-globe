var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var loader = new THREE.OBJLoader(), globe;
loader.load('assets/globes_pack13.obj', function(obj) {
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
camera.position.z = 2.5;
camera.rotation.x = -0.4;

function animate() {
	requestAnimationFrame(animate);

	if (globe) globe.rotation.y += .001;

	renderer.render(scene, camera);
}
animate();
