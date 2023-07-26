import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";

THREE.ColorManagement.enabled = false;

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "pink",
};

gui.addColor(parameters, "materialColor");

// Import

const textureLoader = new THREE.TextureLoader();
const toonTexture = textureLoader.load("/textures/gradients/3.jpg");
toonTexture.magFilter = THREE.NearestFilter;

const particlesTexture = textureLoader.load("/textures/particles/4.png");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: '#ff0000' })
// )
// scene.add(cube)

// Objects

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: toonTexture,
});

const objectDistance = 4;

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

const meshes = [mesh1, mesh2, mesh3];

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

mesh2.position.y = -objectDistance * 1;
mesh3.position.y = -objectDistance * 2;

scene.add(mesh1, mesh2, mesh3);

// Particles

const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
  transparent: true,
  alphaMap: particlesTexture,
  color: parameters.materialColor,
  size: 0.1,
  sizeAttenuation: true,
  depthWrite: false,
});
const particlesCount = 2000;
const positions = new Float32Array(particlesCount * 3);
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

for (let index = 0; index < particlesCount * 3; index++) {
  const index3 = index * 3;
  positions[index3 + 0] = (Math.random() - 0.5) * 10;
  positions[index3 + 1] =
    objectDistance * 0.5 - Math.random() * objectDistance * 3;
  positions[index3 + 2] = (Math.random() - 0.5) * 10;
}
const particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles);

// Light

const directionalLight = new THREE.DirectionalLight("#fff", 1, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scroll
let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(meshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=5",
      y: "+=3",
      z: "+=1",
    });
  }
});

// Cursor Section

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate mesh
  for (const mesh of meshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.2;
  }

  // Animate Camera
  camera.position.y = (-scrollY / sizes.height) * objectDistance;
  const parallaxX = -cursor.x * 0.5;
  const parallaxY = cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
