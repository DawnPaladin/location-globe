var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var loader = new THREE.OBJLoader(), land, sea;
loader.load('assets/globe-countries.obj', function(obj) {
	land = obj;

	land.position.y = -40;
	land.position.x = 20;
	land.scale.x = land.scale.y = land.scale.z = 5;

	scene.add(land);
});
loader.load('assets/wire-globe.obj', function(obj) {
	sea = obj;

	sea.scale.x = sea.scale.y = sea.scale.z = 3;
	sea.position.y = -25;

	var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
	sea.traverse(function(child) {
		if (child instanceof THREE.Mesh) {
			child.material = material;
		}
	})

	console.log(sea);

	scene.add(sea);
})

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
