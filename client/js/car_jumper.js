var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    RATIO = WIDTH/HEIGHT,

    CUBE_LENGTH = 3,
    PLATFORM_LENGTH = 20,
    PLATFORM_SPACE = 5;

var scene, camera, renderer,
    geometry, material, mesh;

var car,
    velocity = 0,
    collision = true,
    jump = true;

var platforms = [];

function coords(x, y) {
  var vector = new THREE.Vector3();
  vector.set((x/WIDTH)*2-1, -(y/HEIGHT)*2+1, 0.5);
  vector.unproject(camera);

  var dir = vector.sub(camera.position).normalize();
  var distance = -camera.position.z/dir.z;
  var pos = camera.position.clone().add(dir.multiplyScalar(distance));

  return pos;
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, RATIO, 0.1, 10000);
  camera.position.z = 25;

  geometry = new THREE.BoxGeometry(CUBE_LENGTH,CUBE_LENGTH,CUBE_LENGTH);
  material = new THREE.MeshBasicMaterial({color: 0x00ff00});
  car = new THREE.Mesh(geometry, material);
  scene.add(car);

  geometry = new THREE.BoxGeometry(100,1,3);
  material = new THREE.MeshBasicMaterial({color: 0xff0000});
  mesh = new THREE.Mesh(geometry, material);
  platforms.push(mesh);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColor(0x00bfff);
  document.body.appendChild(renderer.domElement);

  window.onresize = function() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    RATIO = WIDTH/HEIGHT;

    camera.aspect = RATIO;
    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
  }

  animate();

  var position = coords(0,window.innerHeight/2);
  car.position.x = position.x+CUBE_LENGTH/2+5;
  car.position.y = position.y;

  var position = coords(0,window.innerHeight/2);
  mesh.position.x = position.x+3;
  mesh.position.y = position.y-3;

  setInterval(function() {
    geometry = new THREE.BoxGeometry(PLATFORM_LENGTH,1,3);
    material = new THREE.MeshBasicMaterial({color: 0xff0000});
    mesh = new THREE.Mesh(geometry, material);
    platforms.push(mesh);
    scene.add(mesh);

    var position = coords(window.innerWidth, window.innerHeight/2);
    mesh.position.x = position.x+PLATFORM_LENGTH/2;
    mesh.position.y = position.y+PLATFORM_SPACE/2-Math.random()*PLATFORM_SPACE;

    PLATFORM_LENGTH -= 0.3;
    PLATFORM_SPACE += 1;
  }, 1500);
}

document.onkeydown = function(e) {
  e.preventDefault();
  if (jump) {
    collision = false;
    velocity = 0.4;
  }
}

var prevTime = performance.now();
function animate() {
  requestAnimationFrame(animate);

  var time = performance.now();
  var delta = (time-prevTime)/1000;

  for (var i=0;i<car.geometry.vertices.length;i++) {
    var localVertex = car.geometry.vertices[i].clone();
    var globalVertex = localVertex.applyMatrix4(car.matrix);
    var directionVector = globalVertex.sub(car.position);

    var ray = new THREE.Raycaster(car.position, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(platforms);
    if (collisionResults.length>0 && collision) {
      velocity = 0;
      jump = true;
      break;
    } else {
      jump = false;
      velocity -= 0.7*delta/car.geometry.vertices.length;
    }
  }
  car.position.y += velocity;
  for (var i=0;i<platforms.length;i++) {
    platforms[i].position.x -= 20*delta;
  }
  collision = true;

  prevTime = time;

  renderer.render(scene, camera);
}

window.onload = init;
