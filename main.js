const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);
scene.ambientColor = new BABYLON.Color3(1, 1, 1);

// const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, -250), scene);
// camera.setPosition(new BABYLON.Vector3(0, 0, 0));

const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, 1), scene);
camera.setTarget(BABYLON.Vector3.Zero());
// camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

light.intensity = 1;

const h = 300;
const bg = BABYLON.MeshBuilder.CreatePlane("plane", {width: h * 1.54692723, height: h}, scene);
const bgMaterial = new BABYLON.StandardMaterial("bg_mat");
bgMaterial.ambientTexture = new BABYLON.Texture("./bg3.jpg", scene);
bg.material = bgMaterial
bg.position.z -= 250;
bg.rotation.y = Math.PI;

let falcon;
let ast;
let asts = [];
let astVel = new BABYLON.Vector3(-1, -1, 1);
let txt;

BABYLON.SceneLoader.ImportMesh("", "./", "falcon.glb", scene, (meshes) => {
	falcon = meshes[0];
	falcon.rotationQuaternion = null;
	falcon.rotation.y += 3 * Math.PI/2;
	falcon.rotation.z += 3 * Math.PI/2;

	falcon.position.z -= 150;
	falcon.position.x -= 80;
	falcon.position.y += 40;

});
BABYLON.SceneLoader.ImportMesh("", "./", "txt.stl", scene, (meshes) => {
	txt = meshes[0];
	txt.rotationQuaternion = null;
	txt.rotation.y += Math.PI;
	txt.position.z = -200;
	txt.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
	txt.position.y = 1000;
;});
BABYLON.SceneLoader.ImportMesh("", "./", "asteroid.glb", scene, (meshes) => {
	ast = meshes[0];
	ast.rotationQuaternion = null;
	ast.position.z -= 50;

	for (let i = 0; i < 100; ++i) {
		let inst = ast.clone(i.toString());

		let x = rand(-200, 200);
		let y = rand(-50, 200);

		inst.position.set(x, y, rand(-50, -200));
		inst.position.x += i;

		inst.rot = rand(1, 5) * 0.1;
		inst.speed = rand(1, 5) * 0.1;

		asts.push(inst);
	}

	ast.dispose();
});

let txtmat = new BABYLON.StandardMaterial("fjlk", scene);
txtmat.emissiveColor = new BABYLON.Color3(1, 1, 1);

let done = false;
let fullydone = false;
let fullyfullydone = false;
let reachedZ;

let stoprot = false;
let declight = false;

let alldone = false;

engine.runRenderLoop(() => {
	scene.render();

	if (done) {
		// txt.rotation.x += 0.1;
	}
	if (fullydone && !fullyfullydone) {
		let dist = -reachedZ;
		let speed = 5;
		camera.position.z += speed;
		let frames = dist/speed - 0.2;

		if (!stoprot) {
			txt.rotation.z += Math.PI * 2/frames;
			bg.rotation.z += Math.PI * 2/frames;
		}

		if (txt.rotation.z >= 2 * Math.PI) {
			stoprot = true;
			declight = true;
			txt.material = txtmat;
		}

		if (camera.position.z > 0) {
			fullyfullydone = true;
		}

	}

	if(declight) {
		light.intensity -= 0.05;
		if (light.intensity <= 0.3) {
			declight = false;
			alldone = true;
		}
	}

	if (alldone) {
		let f = 0.5 * Math.sin(Date.now()/200)/3 + 0.75;
		txt.scaling.set(f, f, f);
	}
});

window.scrollTo(0, 0);
let pt = 0;
document.body.onscroll = () => {
	const fact = 0.05;
	const t = -fact * document.body.getBoundingClientRect().top;
	let dt = t - pt;

	if (!fullydone) {
	
		if (falcon) {
			falcon.position.x += dt * 1.3;
			falcon.position.z += dt * 1.2;
			falcon.position.y -= dt/1.5;

			falcon.rotation.z += dt/10;
			// falcon.rotation.y -= dt/100;

			
		}
		
		asts.forEach((ast) => {
			ast.position.addInPlace(astVel.scale(Math.sign(dt) * ast.speed));
			ast.rotation.x += ast.rot * dt;
			ast.rotation.y += ast.rot * dt;
			ast.rotation.z += ast.rot * dt;
		});

		camera.position.z -= dt * 1.2;
	
	}

	pt = t;

	if (t > 1200 * fact) {
		done = true;
		txt.position.y = -5;
	}

	if (t > 2800 * fact) {
		fullydone = true;

		asts.forEach((ast) => {
			ast.dispose();
		});

		falcon.dispose();

		reachedZ = camera.position.z;
	}
};

window.addEventListener("resize", () => {
	engine.resize();
});

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}