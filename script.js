
const canvas = document.getElementById('bg3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0a0e27, 0.1);

camera.position.set(0, 20, 60);
camera.lookAt(0, 0, 0);


const particleGeometry = new THREE.BufferGeometry();
const particleCount = 4000;
const positions = new Float32Array(particleCount * 3);
const originalPositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 45 + Math.random() * 10;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    originalPositions[i * 3] = x;
    originalPositions[i * 3 + 1] = y;
    originalPositions[i * 3 + 2] = z;

   
    const intensity = (y + radius) / (2 * radius);
    colors[i * 3] = 0.4 + intensity * 0.4;
    colors[i * 3 + 1] = 0.65 + intensity * 0.3;
    colors[i * 3 + 2] = 0.9 + intensity * 0.1;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);


const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const targetPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});


let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.001;

  
    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.00005;

  
    raycaster.setFromCamera(mouse, camera);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(targetPlane, target);

    const pos = particleGeometry.attributes.position;

   
    for (let i = 0; i < particleCount; i++) {
        const px = pos.getX(i);
        const py = pos.getY(i);
        const pz = pos.getZ(i);

        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

   
        const dx = px - target.x * 30;
        const dy = py - target.y * 30;
        const distance = Math.sqrt(dx * dx + dy * dy);

     
        const repelRange = 20;
        const force = 3.5;

        let tx = ox,
            ty = oy,
            tz = oz;

        if (distance < repelRange) {
            const angle = Math.atan2(dy, dx);
            const push = (repelRange - distance) * force;
            tx = ox + Math.cos(angle) * push;
            ty = oy + Math.sin(angle) * push;
            tz = oz - push * 0.5;
        }

     
        pos.setX(i, px + (tx - px) * 0.12);
        pos.setY(i, py + (ty - py) * 0.12);
        pos.setZ(i, pz + (tz - pz) * 0.12);
    }

    pos.needsUpdate = true;
    renderer.render(scene, camera);
}

animate();


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));