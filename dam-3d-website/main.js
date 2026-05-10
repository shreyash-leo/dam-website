// main.js - Enhanced version with advanced lighting, material adjustment and Arch Dam color fix
import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js";

// ============================================================
//  DEV MODE (set false for production)
// ============================================================
const DEV_MODE = false;
const devMapping = {};

// ============================================================
//  MODEL CONFIGURATION
// ============================================================
const modelConfigs = {
  "models/dam.glb": {
    name: "Concrete Gravity Dam",
    partMap: {
      "BuildingMesh-00155001_65": "reservoir",
      "BuildingMesh-00141001_60": "terrain",
      "BuildingMesh-00142001_61": "terrain",
      "BuildingMesh-00129001_58": "terrain",
      "BuildingMesh-00110001_52": "terrain",
      "BuildingMesh-00171001_76": "terrain",
      "BuildingMesh-00079001_37": "terrain",
      "BuildingMesh-00044001_16": "terrain",
      "BuildingMesh-00035001_11": "terrain",
      "BuildingMesh-00032001_10": "reservoir",
      "BuildingMesh-00010001_0": "terrain",
      "BuildingMesh-00028001_8": "terrain",
      "BuildingMesh-00040001_14": "terrain",
      "BuildingMesh-00026001_6": "terrain",
      "BuildingMesh-00161001_68": "terrain",
      "BuildingMesh-00162001_69": "terrain",
      "BuildingMesh-00024001_4": "terrain",
      "BuildingMesh-00029001_9": "terrain",
      "BuildingMesh-00018001_2": "terrain",
      "BuildingMesh-00025001_5": "terrain",
      "BuildingMesh-00050001_20": "terrain",
      "BuildingMesh-00059001_24": "terrain",
      "BuildingMesh-00060001_25": "terrain",
      "BuildingMesh-00076001_35": "terrain",
      "BuildingMesh-00090001_42": "terrain",
      "BuildingMesh-00119001_55": "terrain",
      "BuildingMesh-00149001_63": "terrain",
      "BuildingMesh-00156001_66": "terrain",
      "BuildingMesh-00157001_67": "terrain",
      "BuildingMesh-00134001_59": "terrain",
      "BuildingMesh-00109001_51": "intake",
      "BuildingMesh-00091001_43": "terrain",
      "BuildingMesh-00180001_82": "terrain",
      "BuildingMesh-00168001_73": "terrain",
      "BuildingMesh-00047001_18": "terrain",
      "BuildingMesh-00051001_21": "terrain",
      "BuildingMesh-00049001_19": "terrain",
      "BuildingMesh-00069001_31": "terrain",
      "BuildingMesh-00098001_46": "terrain",
      "BuildingMesh-00198001_98": "terrain",
      "BuildingMesh-00186001_87": "terrain",
      "BuildingMesh-00061001_26": "terrain",
      "BuildingMesh-00036001_12": "terrain",
      "BuildingMesh-00056001_23": "terrain",
      "BuildingMesh-00046001_17": "reservoir",
      "BuildingMesh-00148001_62": "reservoir",
      "BuildingMesh-00120001_56": "reservoir",
      "BuildingMesh-00083001_38": "dam_wall",
      "BuildingMesh-00084001_39": "reservoir",
      "BuildingMesh-00072001_32": "gates",
      "BuildingMesh-00074001_34": "powerhouse",
      "BuildingMesh-00073001_33": "foundation",
      "BuildingMesh-00187001_88": "outlet",
      "BuildingMesh-00188001_89": "outlet",
      "BuildingMesh-00196001_96": "dam_wall",
      "BuildingMesh-00055001_22": "terrain",
      "BuildingMesh-00169001_74": "terrain",
      "BuildingMesh-00170001_75": "foundation",
      "BuildingMesh-00195001_95": "foundation"
    }
  },
  "models/dam2.glb": {
    name: "Earthfill Dam",
    partMap: {}
  },
  "models/dam3.glb": {
    name: "Arch Dam",
    partMap: {}
  }
};

let objectPartMap = modelConfigs["models/dam.glb"].partMap;

// ============================================================
//  ENGINEERING KNOWLEDGE BASE
// ============================================================
const damInfo = {
  dam_wall: `<h3>Dam Wall (Main Structure)</h3><b>Definition:</b><br>The main barrier that holds back the reservoir water.<br><br><b>Functions:</b><ul><li>Resists hydrostatic water pressure</li><li>Stores reservoir water</li><li>Transfers load to foundation & abutments</li></ul><b>Engineering Concepts:</b><ul><li>Stability against sliding & overturning</li><li>Compressive strength of material</li><li>Seepage and uplift pressure control</li></ul><b>Materials:</b> Concrete / Earthfill / Rockfill / Masonry`,
  reservoir: `<h3>Reservoir</h3><b>Purpose:</b> Stores water impounded behind the dam.<br><br><b>Storage Zones:</b><ul><li><b>Dead Storage</b> — below outlet; not usable, traps sediment</li><li><b>Live (Active) Storage</b> — usable for power & irrigation</li><li><b>Flood / Surcharge Storage</b> — temporary buffer above normal pool</li></ul><b>Uses:</b> Drinking water, irrigation, hydropower, flood control, recreation`,
  powerhouse: `<h3>Powerhouse</h3><b>Function:</b> Converts hydraulic energy into electrical energy.<br><br><b>Energy Chain:</b><br>Potential Energy → Kinetic Energy → Mechanical → Electrical<br><br><b>Key Components:</b><ul><li>Turbines — Francis, Kaplan (low head), Pelton (high head)</li><li>Generators — coupled to turbine shaft</li><li>Step-up Transformers — raise voltage for transmission</li><li>Control & Protection Systems</li></ul>`,
  terrain: `<h3>Abutments / Terrain</h3><b>Definition:</b> Natural valley walls on either side of the dam.<br><br><b>Functions:</b><ul><li>Provide lateral support to the dam body</li><li>Transfer water pressure loads into bedrock</li><li>Prevent seepage around the dam ends</li></ul><b>Critical for:</b> Arch dams — the entire thrust is transferred to abutments`,
  spillway: `<h3>Spillway</h3><b>Purpose:</b> Safely discharge excess flood water to prevent overtopping.<br><br><b>Types:</b><ul><li><b>Ogee (Overflow)</b> — smooth S-curve crest, most common</li><li><b>Chute / Open Channel</b> — inclined concrete channel</li><li><b>Shaft (Morning Glory)</b> — circular funnel intake</li></ul>`,
  gates: `<h3>Gates & Control Structures</h3><b>Function:</b> Regulate and control water release from the dam.<br><br><b>Types:</b><ul><li><b>Radial (Tainter) Gate</b> — most common spillway gate</li><li><b>Sluice / Slide Gate</b> — simple vertical sliding plate</li><li><b>Roller Gate</b> — cylindrical</li></ul>`,
  intake: `<h3>Intake Structure</h3><b>Function:</b> Controlled entry point for water flowing to turbines / outlets.<br><br><b>Components:</b><ul><li><b>Trash Racks</b> — bar screens</li><li><b>Intake Gates</b> — emergency shut-off valves</li><li><b>Penstocks</b> — high-pressure pipes</li></ul>`,
  outlet: `<h3>Outlet Works</h3><b>Function:</b> Release water from the reservoir at controlled rates.<br><br><b>Purposes:</b><ul><li>Irrigation & municipal water supply</li><li>Maintaining minimum environmental flows</li><li>Reservoir drawdown for maintenance</li></ul>`,
  foundation: `<h3>Foundation</h3><b>Function:</b> Transfers all structural loads from the dam to the ground.<br><br><b>Requirements:</b><ul><li>High bearing capacity</li><li>Low permeability — prevent seepage & piping failure</li><li>Resistance to erosion and dissolution</li></ul><b>Treatment:</b> Grouting, drainage curtains`,
  general: `<h3>Dam Engineering</h3><b>Interactive 3D Learning Tool</b><br><br>A dam is a hydraulic structure built across a watercourse to:<br><ul><li>Store water (reservoir)</li><li>Control floods</li><li>Generate hydroelectric power</li><li>Supply irrigation & drinking water</li></ul><hr><i>Click any part of the model to see its engineering information.</i>`
};

const tooltipNames = { foundation: "Foundation", dam_wall: "Dam Wall", reservoir: "Reservoir", spillway: "Spillway", gates: "Gates", powerhouse: "Power House", intake: "Intake Structure", outlet: "Outlet Works", terrain: "Terrain / Abutments" };

// ============================================================
//  SETUP SCENE WITH PRO LIGHTING
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFAF6F0);
window.__threeScene = scene; // expose for lighting patch

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = 1;
controls.maxDistance = 100;

// === ENHANCED LIGHTING SYSTEM (fixes dark Arch Dam) ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
mainLight.position.set(8, 15, 5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
scene.add(mainLight);

const fillLightWarm = new THREE.PointLight(0xccaa88, 0.7);
fillLightWarm.position.set(3, 4, 6);
scene.add(fillLightWarm);

const fillLightCool = new THREE.PointLight(0x88aacc, 0.55);
fillLightCool.position.set(-2, 2, -4);
scene.add(fillLightCool);

const rimLight = new THREE.DirectionalLight(0xffdd99, 0.65);
rimLight.position.set(-3, 5, -4);
scene.add(rimLight);

const hemiLight = new THREE.HemisphereLight(0xd9cdb0, 0x8b9bb0, 0.5);
scene.add(hemiLight);

// Optional back rim
const backRim = new THREE.PointLight(0xffaa66, 0.45);
backRim.position.set(0, 3, -5);
scene.add(backRim);
// =======================================================

const tooltip = document.getElementById("tooltip");
const infoContent = document.getElementById("infoContent");
const resetBtn = document.getElementById("resetViewBtn");
const modelSelect = document.getElementById("modelSelect");

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0, mouseY = 0;
let isDragging = false;
let selectedObject = null;
let modelCenter = new THREE.Vector3();
let modelDistance = 15;
let damModel = null;
let currentModelPath = "models/dam.glb";
let isLoading = false;

const loadingIndicator = document.createElement("div");
loadingIndicator.className = "loading-indicator";
loadingIndicator.textContent = "Loading dam model...";
document.body.appendChild(loadingIndicator);

function showInfo(key) {
  const displayKey = key.toLowerCase().replace(/ /g, "_");
  const header = (tooltipNames[displayKey] || displayKey).toUpperCase();
  infoContent.innerHTML = `<div style="background:#8B735520;padding:6px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;color:#8B7355;text-align:center;font-weight:bold;">SELECTED: ${header}</div>${damInfo[displayKey] || damInfo.general}`;
}

function clearHighlight(obj) {
  if (!obj) return;
  const resetMat = (mat) => { if (mat && mat.emissive) { mat.emissive.setHex(0x000000); mat.emissiveIntensity = 0; } };
  if (Array.isArray(obj.material)) obj.material.forEach(resetMat);
  else resetMat(obj.material);
}

function highlight(obj) {
  if (selectedObject) clearHighlight(selectedObject);
  selectedObject = obj;
  const applyEmissive = (mat) => { if (mat && mat.emissive) { mat.emissive.setHex(0x8B7355); mat.emissiveIntensity = 0.55; } };
  if (Array.isArray(obj.material)) obj.material.forEach(applyEmissive);
  else applyEmissive(obj.material);
}

function pickObject(hit) {
  let obj = hit.object;
  for (let i = 0; i < 3 && obj.parent && obj.parent !== damModel; i++) {
    if (obj.parent.name && !obj.parent.name.startsWith("Object_") && obj.parent.name !== "") return obj.parent;
    obj = obj.parent;
  }
  return obj;
}

function loadModel(modelPath) {
  if (isLoading) return;
  isLoading = true;
  loadingIndicator.classList.add("active");
  if (damModel) scene.remove(damModel);
  if (selectedObject) clearHighlight(selectedObject);
  selectedObject = null;
  objectPartMap = modelConfigs[modelPath]?.partMap || {};

  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    damModel = gltf.scene;
    scene.add(damModel);
    damModel.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => { if (m) m.roughness = Math.max(0.3, m.roughness || 0.4); });
          else { child.material.roughness = Math.max(0.3, child.material.roughness || 0.4); }
        }
      }
    });
    const box = new THREE.Box3().setFromObject(damModel);
    modelCenter = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    modelDistance = Math.max(size * 1.5, 10);
    controls.target.copy(modelCenter);
    camera.position.set(modelCenter.x, modelCenter.y + modelDistance * 0.3, modelCenter.z + modelDistance);
    controls.update();
    isLoading = false;
    loadingIndicator.classList.remove("active");
    const modelName = modelConfigs[modelPath]?.name || "Dam Model";
    infoContent.innerHTML = `<div style="background:#8B735520;padding:6px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;color:#8B7355;text-align:center;font-weight:bold;">LOADED: ${modelName}</div>${damInfo.general}`;
  }, undefined, (err) => { console.error(err); isLoading = false; loadingIndicator.classList.remove("active"); infoContent.innerHTML = `<h3>Error Loading Model</h3><p>Failed to load ${modelPath}.</p>`; });
}

window.addEventListener("mousedown", () => { isDragging = false; });
window.addEventListener("mousemove", (e) => { isDragging = true; mouseX = e.clientX; mouseY = e.clientY; mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; });
window.addEventListener("click", (e) => {
  if (isDragging || !damModel || isLoading) return;
  const m = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  const rc = new THREE.Raycaster(); rc.setFromCamera(m, camera);
  const hits = rc.intersectObjects(damModel.children, true);
  if (!hits.length) return;
  const obj = pickObject(hits[0]);
  highlight(obj);
  const engineeringKey = objectPartMap[obj.name];
  if (engineeringKey) showInfo(engineeringKey);
  else infoContent.innerHTML = `<h3>Component</h3><p>Engineering data not yet assigned.</p>`;
});

modelSelect?.addEventListener("change", (e) => { if (e.target.value !== currentModelPath && !isLoading) { currentModelPath = e.target.value; loadModel(currentModelPath); } });
resetBtn?.addEventListener("click", () => { if (damModel) { camera.position.set(modelCenter.x, modelCenter.y + modelDistance * 0.3, modelCenter.z + modelDistance); controls.target.copy(modelCenter); clearHighlight(selectedObject); selectedObject = null; controls.update(); } });
window.addEventListener("resize", () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (damModel && !isLoading) {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(damModel.children, true);
    if (hits.length) {
      const obj = pickObject(hits[0]);
      const key = objectPartMap[obj.name];
      if (key) { tooltip.style.display = "block"; tooltip.style.left = mouseX + 15 + "px"; tooltip.style.top = mouseY + 15 + "px"; tooltip.innerHTML = tooltipNames[key] || key; }
      else tooltip.style.display = "none";
    } else tooltip.style.display = "none";
  }
  renderer.render(scene, camera);
}

showInfo("general");
loadModel("models/dam.glb");
animate();