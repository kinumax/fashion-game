/* Design philosophy: Continental Editorial — a detailed sculptural platformer where every gameplay object feels carved, printed, or tailored. */
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";

export type City = "NEW YORK" | "MILANO" | "PARIS" | "TOKYO";
export type StageMode = "runway" | "vertical" | "underground" | "race" | "flight" | "dogfight";
export const TOTAL_STAGES = 12;
export const SECTIONS_PER_STAGE = 4;
export const TOTAL_STAGE_SECTIONS = TOTAL_STAGES * SECTIONS_PER_STAGE;
export type GameSnapshot = { score: number; city: City; progress: number; running: boolean; gameOver: boolean; finished: boolean; combo: number; lives: number; checkpoint: boolean; outfit: number; jumpBoost: boolean; speedBoost: boolean; bagAmmo: number; shoeAmmo: number; highScore: number; flyFuel: number; hasWings: boolean; crouching: boolean; partyCount: number; collection: number; stageIndex: number; sectionIndex: number; totalStages: number; sectionsPerStage: number; stageName?: string; stageMode?: StageMode; bossName?: string; bossHp?: number; bossMaxHp?: number; relics?: number; rescueKeys?: number; };
export type GameHandle = { dispose: () => void };
export type PopupEvent = { value: number; x: number; y: number; kind: "coin" | "enemy" | "combo" | "checkpoint" | "power" | "wings" | "rescue" };

type Platform = { mesh: Mesh; x: number; y: number; w: number; h: number; moving?: boolean; baseX?: number; phase?: number };
type WebAnchor = { mesh: Mesh; x: number; y: number; active: boolean };
type Enemy = { mesh: Mesh; x: number; y: number; w: number; h: number; vx: number; vy: number; kind: "crow" | "bat" | "hedgehog" | "drone"; baseX?: number; baseY?: number; phase?: number; dead?: boolean; hp?: number; maxHp?: number; isBoss?: boolean; spritePlate?: Mesh; spriteMaterial?: StandardMaterial; spriteTextures?: Record<string, Texture>; };
type Coin = { mesh: Mesh; x: number; y: number; taken: boolean; baseY: number; phase: number };
type PowerItem = { mesh: Mesh; x: number; y: number; kind: "bag" | "shoe" | "wings"; taken: boolean; baseY: number; phase: number };
type Projectile = { mesh: Mesh; x: number; y: number; vx: number; vy: number; active: boolean; kind: "bag" | "shoe"; gravity?: number; owner: "player" | "ally"; targetX?: number; targetY?: number };
type Particle = { mesh: Mesh; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; gravity: number };
type Ally = {
  root: TransformNode; body: Mesh; head: Mesh; hair: Mesh; saved: boolean; x: number; y: number; vx: number; vy: number;
  spritePlate?: Mesh; spriteMaterial?: StandardMaterial; spriteTextures?: Record<string, Texture>;
  targetX: number; offset: number; phase: number; color: string; hairColor: string; shoeColor: string;
  cage?: { root: TransformNode; bars: Mesh[]; x: number; y: number };
  lastShot: number; name: string;
};

const ASSETS = {
  background: "/manus-storage/fashion-runway-stage-realistic_033f52bb.png",
  enemySheet: "/manus-storage/fashion-enemy-hunter-realistic_56a6869b.png",
  propSheet: "/manus-storage/fashion-props-realistic_f7f71a1b.png",
  // Cleaned character sprites are local assets so Web and Android use the same files after build/sync.
  allyAriaIdle: "/assets/ally-aria-idle.png",
  allyAriaAction: "/assets/ally-aria-action.png",
  allyAriaRun: "/assets/ally-aria-run.png",
  velvetDroneIdle: "/assets/enemy-velvet-drone.png",
  velvetDroneAttack: "/assets/enemy-velvet-drone-attack.png",
  madameNoirIdle: "/assets/boss-madame-noir.png",
  madameNoirAttack: "/assets/boss-madame-noir-attack.png",
  madameNoirHit: "/assets/boss-madame-noir-hit.png",
  angelWings: "/assets/angel-wings-flight.png",
  angelWingsGlide: "/assets/angel-wings-glide.png",
};
const palette = { ink: "#171222", paper: "#F3E9D9", chartreuse: "#C8D36B", red: "#C63342", cobalt: "#274C77", lilac: "#6D4B74", stone: "#B9A88B", gold: "#FFD23F", sky1: "#55C3EF", sky2: "#F5C7A9", sky3: "#8FD3E8", sky4: "#FFC8A2", shadow: "#2D1F3D", feather: "#1A1A2E", wing: "#4A3F6B" };

export async function createGameScene(canvas: HTMLCanvasElement, onSnapshot: (snapshot: GameSnapshot) => void, onPopup?: (ev: PopupEvent) => void): Promise<GameHandle> {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, antialias: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.33, 0.76, 0.94, 1);
  scene.autoClear = true;

  const camera = new FreeCamera("camera", new Vector3(0, 0, -22), scene);
  camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
  camera.setTarget(Vector3.Zero());
  const resize = () => {
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    camera.orthoLeft = -10.2 * aspect;
    camera.orthoRight = 10.2 * aspect;
    camera.orthoTop = 6.4;
    camera.orthoBottom = -6.4;
    engine.resize();
  };
  resize();
  window.addEventListener("resize", resize);

  const hemi = new HemisphericLight("sky-light", new Vector3(0, 1, -0.3), scene);
  hemi.intensity = 0.85;
  hemi.diffuse = new Color3(1.0, 0.97, 0.92);
  hemi.groundColor = new Color3(0.35, 0.28, 0.4);
  const dir = new DirectionalLight("sun-light", new Vector3(-0.6, -1, 0.2), scene);
  dir.intensity = 1.15;
  dir.diffuse = new Color3(1.0, 0.96, 0.86);
  dir.position = new Vector3(50, 30, -40);
  const rim = new PointLight("runway-rim-light", new Vector3(0, 4, -6), scene);
  rim.diffuse = new Color3(0.28, 0.72, 1.0); rim.specular = new Color3(0.45, 0.7, 1.0); rim.intensity = 0.9; rim.range = 18;
  const warmFill = new PointLight("runway-warm-fill", new Vector3(-4, 1, -3), scene);
  warmFill.diffuse = new Color3(1.0, 0.34, 0.24); warmFill.intensity = 0.42; warmFill.range = 12;

  const shadowGen = new ShadowGenerator(1024, dir);
  shadowGen.useBlurCloseExponentialShadowMap = true;
  shadowGen.blurKernel = 16;
  shadowGen.darkness = 0.35;

  const material = (name: string, hex: string, emissive = "#171222", emiAmount = 0.08) => {
    const mat = new StandardMaterial(name, scene);
    mat.diffuseColor = Color3.FromHexString(hex);
    mat.emissiveColor = Color3.FromHexString(emissive).scale(emiAmount);
    mat.specularColor = new Color3(0.08, 0.07, 0.12);
    mat.specularPower = 16;
    return mat;
  };
  const mats = {
    ink: material("ink", palette.ink), paper: material("paper", palette.paper, "#4B3542", 0.08),
    chartreuse: material("chartreuse", palette.chartreuse, "#606A2A", 0.12), red: material("red", palette.red, "#4D1625", 0.1),
    cobalt: material("cobalt", palette.cobalt, "#182D49", 0.12), lilac: material("lilac", palette.lilac, "#271A36", 0.1),
    stone: material("stone", palette.stone, "#4B3C31", 0.08), gold: material("gold", palette.gold, "#7A5B10", 0.2),
    feather: material("feather", palette.feather, "#0A0A15", 0.15), wing: material("wing", palette.wing, "#2A2240", 0.1),
    spike: material("spike", palette.stone, "#3A2F25", 0.15), cage: material("cage", "#8B7355", "#4A3C2A", 0.1),
  };

  const makeCharacterSpritePlate = (name: string, url: string, width: number, height: number, parent: TransformNode, z = -0.7) => {
    const plate = MeshBuilder.CreatePlane(name, { width, height }, scene);
    plate.parent = parent;
    plate.position.set(0, 0, z);
    plate.isPickable = false;
    const plateMat = new StandardMaterial(`${name}-material`, scene);
    plateMat.disableLighting = true;
    plateMat.backFaceCulling = false;
    plateMat.useAlphaFromDiffuseTexture = true;
    plateMat.transparencyMode = 2;
    const tex = new Texture(url, scene, true, false);
    tex.hasAlpha = true;
    plateMat.diffuseTexture = tex;
    plateMat.emissiveColor = new Color3(1, 1, 1);
    plate.material = plateMat;
    return { plate, plateMaterial: plateMat };
  };

  const skyMat = new StandardMaterial("sky-vignette", scene);
  skyMat.disableLighting = true;
  const sky = MeshBuilder.CreatePlane("sky-pane", { width: 300, height: 20 }, scene);
  sky.position.z = 9;
  sky.material = skyMat;

  const bg = MeshBuilder.CreatePlane("city-backdrop", { width: 280, height: 17 }, scene);
  bg.position.z = 7.5;
  const bgMat = new StandardMaterial("editorial-city-material", scene);
  bgMat.disableLighting = true;
  const bgTexture = new Texture(ASSETS.background, scene, true, false);
  bgTexture.uScale = 1.05; bgTexture.vScale = -1; bgTexture.vOffset = 1;
  bgMat.diffuseColor = Color3.FromHexString("#55C3EF");
  bgMat.emissiveColor = Color3.FromHexString("#55C3EF");
  bg.material = bgMat;

  const hazeLayer = MeshBuilder.CreatePlane("haze", { width: 300, height: 18 }, scene);
  hazeLayer.position.z = 6.2;
  const hazeMat = new StandardMaterial("haze-mat", scene);
  hazeMat.disableLighting = true;
  hazeMat.alpha = 0.18;
  hazeMat.transparencyMode = 2;
  hazeMat.diffuseColor = new Color3(1, 1, 1);
  hazeLayer.material = hazeMat;

  const parFoliage: Mesh[] = [];
  for (let layer = 0; layer < 3; layer++) {
    const zBase = 6.6 - layer * 0.4;
    for (let i = 0; i < 14; i++) {
      const size = 1.2 + (i % 5) * 0.3 + layer * 0.2;
      const tree = MeshBuilder.CreateBox(`far-tree-${layer}-${i}`, { width: size * 0.5, height: size, depth: 0.18 }, scene);
      tree.position.set(-20 + i * 21 + (layer * 4), -3.3 + size / 2, zBase);
      tree.material = layer === 0 ? mats.cobalt : layer === 1 ? mats.lilac : mats.ink;
      tree.convertToFlatShadedMesh();
      parFoliage.push(tree);
    }
  }

  const landmarks: { mesh: Mesh; cityStart: number; cityEnd: number }[] = [];
  const addLandmark = (x: number, y: number, cityStart: number, cityEnd: number, kind: string) => {
    const root = new TransformNode(`lm-${kind}-${x}`, scene);
    root.position.set(x, y, 4.8);
    if (kind === "statue") {
      const base = MeshBuilder.CreateBox("st-base", { width: 2.2, height: 0.6, depth: 0.6 }, scene); base.parent = root; base.position.y = 0.3; base.material = mats.stone;
      const col = MeshBuilder.CreateCylinder("st-col", { height: 3.2, diameter: 0.7, tessellation: 8 }, scene); col.parent = root; col.position.y = 2.2; col.material = mats.paper; col.convertToFlatShadedMesh();
      const torch = MeshBuilder.CreateSphere("st-torch", { diameter: 0.8, segments: 8 }, scene); torch.parent = root; torch.position.y = 4.2; torch.position.x = 0.5; torch.material = mats.gold; torch.convertToFlatShadedMesh();
      const head = MeshBuilder.CreateSphere("st-head", { diameter: 1.2, segments: 8 }, scene); head.parent = root; head.position.y = 4.3; head.material = mats.paper; head.convertToFlatShadedMesh();
    } else if (kind === "eiffel") {
      const l1 = MeshBuilder.CreateBox("ef-l1", { width: 2.4, height: 0.3, depth: 0.5 }, scene); l1.parent = root; l1.position.y = 0.15; l1.material = mats.cobalt;
      const legA = MeshBuilder.CreateBox("ef-la", { width: 0.3, height: 3, depth: 0.3 }, scene); legA.parent = root; legA.position.set(-0.8, 1.5, 0); legA.rotation.z = -0.12; legA.material = mats.cobalt;
      const legB = MeshBuilder.CreateBox("ef-lb", { width: 0.3, height: 3, depth: 0.3 }, scene); legB.parent = root; legB.position.set(0.8, 1.5, 0); legB.rotation.z = 0.12; legB.material = mats.cobalt;
      const l2 = MeshBuilder.CreateBox("ef-l2", { width: 1.4, height: 0.2, depth: 0.3 }, scene); l2.parent = root; l2.position.y = 3.1; l2.material = mats.cobalt;
      const top = MeshBuilder.CreateCylinder("ef-top", { height: 2.6, diameter: 0.3, tessellation: 6 }, scene); top.parent = root; top.position.y = 4.5; top.material = mats.red; top.convertToFlatShadedMesh();
      const flag = MeshBuilder.CreateBox("ef-flag", { width: 0.8, height: 0.4, depth: 0.08 }, scene); flag.parent = root; flag.position.set(0.4, 5.9, 0); flag.material = mats.chartreuse;
    } else if (kind === "duomo") {
      const base = MeshBuilder.CreateBox("dm-base", { width: 3.2, height: 2, depth: 0.5 }, scene); base.parent = root; base.position.y = 1; base.material = mats.stone; base.convertToFlatShadedMesh();
      const dome = MeshBuilder.CreateSphere("dm-dome", { diameter: 2.2, segments: 12, arc: 0.5, slice: 1 }, scene); dome.parent = root; dome.position.y = 2.8; dome.material = mats.paper; dome.convertToFlatShadedMesh();
      const cross = MeshBuilder.CreateBox("dm-cross", { width: 0.12, height: 0.7, depth: 0.12 }, scene); cross.parent = root; cross.position.y = 4.2; cross.material = mats.gold;
      const crossB = MeshBuilder.CreateBox("dm-crossb", { width: 0.4, height: 0.12, depth: 0.12 }, scene); crossB.parent = root; crossB.position.y = 4.0; crossB.material = mats.gold;
    } else if (kind === "tower") {
      const base = MeshBuilder.CreateBox("tw-base", { width: 1.8, height: 0.4, depth: 0.5 }, scene); base.parent = root; base.position.y = 0.2; base.material = mats.red;
      const body = MeshBuilder.CreateCylinder("tw-body", { height: 4.2, diameter: 0.9, tessellation: 10 }, scene); body.parent = root; body.position.y = 2.5; body.material = mats.red; body.convertToFlatShadedMesh();
      const mid = MeshBuilder.CreateBox("tw-mid", { width: 1.4, height: 0.2, depth: 0.3 }, scene); mid.parent = root; mid.position.y = 3.4; mid.material = mats.cobalt;
      const antenna = MeshBuilder.CreateCylinder("tw-ant", { height: 1.8, diameter: 0.12 }, scene); antenna.parent = root; antenna.position.y = 5.5; antenna.material = mats.gold;
    }
    landmarks.push({ mesh: root as unknown as Mesh, cityStart, cityEnd });
  };
  addLandmark(22, -3, 0, 65, "statue");
  addLandmark(95, -3, 65, 130, "duomo");
  addLandmark(158, -3, 130, 190, "eiffel");
  addLandmark(218, -3, 190, 300, "tower");

  const makeBox = (name: string, w: number, h: number, d: number, mat: StandardMaterial, x: number, y: number, z = 0, castShadows = true, recvShadows = true) => {
    const mesh = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    mesh.position.set(x, y, z); mesh.material = mat;
    if (castShadows) shadowGen.addShadowCaster(mesh);
    if (recvShadows) mesh.receiveShadows = true;
    return mesh;
  };
  const safeFloor = makeBox("safe-runway-floor", 280, 0.32, 0.5, mats.stone, 125, -3.06, 0.15);
  const farBackStrip = MeshBuilder.CreateBox("farBack", { width: 280, height: 0.45, depth: 0.2 }, scene);
  farBackStrip.position.set(0, -3.35, 3.8); farBackStrip.material = mats.paper; farBackStrip.receiveShadows = true;
  const farInk = MeshBuilder.CreateBox("far-city-ink", { width: 280, height: 2, depth: 0.2 }, scene);
  farInk.position.set(0, -3.8, 4); farInk.material = mats.cobalt; farInk.receiveShadows = true;
  const platforms: Platform[] = [{ mesh: safeFloor, x: -15, y: -3.06, w: 280, h: 0.32 }];

  for (let i = 0; i < 40; i++) {
    const w = 1.6 + (i % 5) * 0.7;
    const h = 0.6 + (i % 6) * 0.5;
    const mat = i % 7 === 0 ? mats.red : i % 5 === 0 ? mats.lilac : i % 3 === 0 ? mats.chartreuse : mats.cobalt;
    const b = makeBox(`bldg-${i}`, w, h, 0.35, mat, -10 + i * 7.3, -3.22 + h / 2, 5.2, false, true);
    b.convertToFlatShadedMesh();
    if (i % 3 !== 0) {
      for (let fy = 0; fy < Math.floor(h * 1.6); fy++) {
        for (let fx = 0; fx < Math.max(1, Math.floor(w * 0.9)); fx++) {
          const win = makeBox(`win-${i}-${fx}-${fy}`, 0.18, 0.22, 0.02, (Math.random() > 0.55) ? mats.gold : mats.ink, b.position.x - w / 2 + 0.35 + fx * 0.5, b.position.y - h / 2 + 0.35 + fy * 0.55, 5.02, false, false);
        }
      }
    }
  }
  for (let i = 0; i < 12; i++) {
    const cloud = makeBox(`cloud-${i}`, 5.5 + (i % 3) * 1.4, 0.65, 0.2, mats.paper, -12 + i * 28, 3 + (i % 2) * 0.9, 7.8, false, false);
    cloud.rotation.z = (i % 2 ? -1 : 1) * 0.04;
    cloud.material!.alpha = 0.88;
  }

  const platformData: [number, number, number, number, "stone" | "cobalt" | "red" | "paper" | "chartreuse", boolean?][] = [
    [-10, -3.05, 28, .5, "stone"], [20, -3.05, 14, .5, "stone"], [38, -2.55, 10, .5, "cobalt", true],
    [51, -3.05, 17, .5, "stone"], [72, -2.35, 12, .5, "red"], [87, -3.05, 21, .5, "stone"],
    [112, -2.2, 14, .5, "cobalt", true], [130, -3.05, 23, .5, "stone"], [157, -2.25, 13, .5, "red"],
    [173, -3.05, 25, .5, "stone"], [198, -2.7, 18, .5, "cobalt", true], [219, -3.05, 31, .5, "stone"],
  ];
  platformData.forEach(([x, y, w, h, key, moving], index) => {
    const mesh = makeBox(`platform-${index}`, w, h, 0.65, mats[key], x + w / 2, y, 0.2);
    if (h > 0.35) {
      const top = makeBox(`platform-top-${index}`, w * 0.98, 0.06, 0.68, (key === "stone") ? mats.paper : mats.gold, x + w / 2, y + h / 2 + 0.03, 0.21, false, false);
      top.material!.alpha = 0.85;
    }
    platforms.push({ mesh, x, y, w, h, moving, baseX: x, phase: index * 0.8 });
  });
  const upperData: [number, number, number][] = [
    [9, -1.1, 5], [18, 0.55, 5], [28, -0.65, 6], [42, 0.25, 5], [58, 0.85, 5], [78, 0.1, 6],
    [96, 0.85, 6], [117, 0.35, 7], [142, 0.55, 6], [160, 0.85, 6], [181, 0.15, 6], [201, 0.7, 6], [226, 0.25, 7]
  ];
  upperData.forEach(([x, y, w], index) => {
    const mesh = makeBox(`upper-platform-${index}`, w, 0.32, 0.7, index % 2 ? mats.chartreuse : mats.paper, x + w / 2, y, 0.1);
    const trim = makeBox(`up-trim-${index}`, w * 1.02, 0.06, 0.72, mats.gold, x + w / 2, y + 0.2, 0.12, false, false);
    trim.material!.alpha = 0.7;
        platforms.push({ mesh, x, y, w, h: 0.32 });
  });

  // Vertical runway route: repeated jumps and wing flight can move the player upward.
  const skyRoute: [number, number, number, number, "cobalt" | "lilac" | "chartreuse" | "red"][] = [
    [118, 0.2, 8.5, 0.46, "cobalt"], [132, 2.8, 6.5, 0.46, "lilac"],
    [145, 5.0, 7.5, 0.46, "chartreuse"], [160, 2.0, 7.5, 0.46, "red"],
    [176, 5.3, 8.5, 0.46, "cobalt"], [193, 7.5, 7.5, 0.46, "lilac"],
    [210, 4.2, 8.5, 0.46, "chartreuse"], [228, 7.0, 10, 0.46, "red"],
  ];
  skyRoute.forEach(([sx, sy, sw, sh, key], index) => {
    const mesh = makeBox(`sky-platform-${index}`, sw, sh, 0.7, mats[key], sx + sw / 2, sy, 0.12);
    const trim = makeBox(`sky-platform-trim-${index}`, sw * 0.92, 0.07, 0.72, mats.gold, sx + sw / 2, sy + sh / 2 + 0.04, 0.1, false, false);
    mats.gold.emissiveColor = Color3.FromHexString(palette.gold).scale(0.45);
    platforms.push({ mesh, x: sx, y: sy, w: sw, h: sh });
  });
  const verticalBeacon = MeshBuilder.CreateTorus("vertical-route-beacon", { diameter: 2.2, thickness: 0.12, tessellation: 32 }, scene);
  verticalBeacon.position.set(197, 9.8, -0.5); verticalBeacon.rotation.x = Math.PI / 2; verticalBeacon.material = mats.gold;
  const verticalBeaconGlow = MeshBuilder.CreateSphere("vertical-route-beacon-glow", { diameter: 0.55, segments: 16 }, scene);
  verticalBeaconGlow.position.set(197, 9.8, -0.55); verticalBeaconGlow.material = mats.chartreuse; verticalBeaconGlow.visibility = 0.8;

  // Underground descent route: the runway floor becomes a shaft after the entry gate.
  const undergroundPlatforms: Platform[] = [];
  [[18, -5.6, 11], [36, -9.4, 9], [55, -13.2, 12], [78, -17.8, 10], [101, -22.5, 13], [126, -27.4, 9], [151, -32.5, 12], [178, -38, 10], [205, -43.5, 13], [230, -49, 14]].forEach(([ux, uy, uw], index) => {
    const mesh = makeBox(`underground-platform-${index}`, uw, 0.42, 0.82, index % 2 ? mats.lilac : mats.cobalt, ux + uw / 2, uy, 0.18);
    const trim = makeBox(`underground-trim-${index}`, uw * 0.92, 0.07, 0.86, mats.red, ux + uw / 2, uy + 0.24, 0.12, false, false);
    trim.material!.alpha = 0.75;
    undergroundPlatforms.push({ mesh, x: ux, y: uy, w: uw, h: 0.42 });
    platforms.push(undergroundPlatforms[undergroundPlatforms.length - 1]);
  });

  undergroundPlatforms.forEach((platform) => platform.mesh.setEnabled(false));

  type Obstacle = { mesh: Mesh; x: number; y: number; w: number; h: number; kind: "laser" | "blade" | "gate"; phase: number; active: boolean };
  const obstacles: Obstacle[] = [];
  const makeObstacle = (x: number, y: number, kind: Obstacle["kind"], phase: number) => {
    const dims = kind === "laser" ? [0.18, 3.4] : kind === "blade" ? [1.6, 0.22] : [0.7, 4.2];
    const mesh = makeBox(`obstacle-${kind}-${obstacles.length}`, dims[0], dims[1], 0.28, kind === "laser" ? mats.red : kind === "blade" ? mats.gold : mats.lilac, x, y, -0.55, true, false);
    mesh.convertToFlatShadedMesh();
    obstacles.push({ mesh, x, y, w: dims[0], h: dims[1], kind, phase, active: true });
  };
  [[58, -1.15, "laser"], [86, -1.05, "blade"], [119, -0.8, "gate"], [151, -1.0, "laser"], [187, -0.95, "blade"], [220, -0.75, "gate"]].forEach(([x, y, kind], index) => makeObstacle(x as number, y as number, kind as Obstacle["kind"], index * 1.3));
  const playerRoot = new TransformNode("fashion-model-player", scene);
  playerRoot.position.set(-5, -0.35, -2.4);
  playerRoot.scaling.setAll(0.88);
  const body = makeBox("model-tailored-body", 0.8, 1.35, 0.38, mats.ink, 0, 0, -1, true, false);
  body.parent = playerRoot; body.position.set(0, 0, 0);
  const coat = makeBox("model-red-scarf", 0.68, 0.16, 0.42, mats.red, 0, 0, -1, true, false);
  coat.parent = playerRoot; coat.position.set(0, 0.5, -0.12);
  const legL = makeBox("model-long-leg-l", 0.32, 1.8, 0.42, mats.ink, 0, 0, -1, true, false);
  legL.parent = playerRoot; legL.position.set(-0.22, -1.45, 0);
  const legR = makeBox("model-long-leg-r", 0.32, 1.8, 0.42, mats.ink, 0, 0, -1, true, false);
  legR.parent = playerRoot; legR.position.set(0.22, -1.45, 0);
  const neck = MeshBuilder.CreateCylinder("model-neck", { height: 0.22, diameter: 0.24, tessellation: 16 }, scene);
  neck.parent = playerRoot; neck.position.set(0, 0.59, -0.02); neck.material = mats.paper; shadowGen.addShadowCaster(neck);
  const head = MeshBuilder.CreateSphere("model-face", { diameter: 0.82, segments: 32 }, scene);
  head.parent = playerRoot; head.position.set(0, 0.98, -0.02); head.material = mats.paper; head.scaling.y = 1.08;
  head.convertToFlatShadedMesh(); shadowGen.addShadowCaster(head);
  const shoulderL = MeshBuilder.CreateSphere("model-shoulder-l", { diameter: 0.42, segments: 16 }, scene);
  shoulderL.parent = playerRoot; shoulderL.position.set(-0.46, 0.42, -0.02); shoulderL.scaling.set(1.18, 0.82, 0.9); shoulderL.material = mats.ink; shadowGen.addShadowCaster(shoulderL);
  const shoulderR = MeshBuilder.CreateSphere("model-shoulder-r", { diameter: 0.42, segments: 16 }, scene);
  shoulderR.parent = playerRoot; shoulderR.position.set(0.46, 0.42, -0.02); shoulderR.scaling.set(1.18, 0.82, 0.9); shoulderR.material = mats.ink; shadowGen.addShadowCaster(shoulderR);
  const eyeL = MeshBuilder.CreateSphere("model-eye-l", { diameter: 0.09, segments: 12 }, scene);
  eyeL.parent = playerRoot; eyeL.position.set(-0.15, 1.02, -0.38); eyeL.material = mats.gold;
  const eyeR = MeshBuilder.CreateSphere("model-eye-r", { diameter: 0.09, segments: 12 }, scene);
  eyeR.parent = playerRoot; eyeR.position.set(0.15, 1.02, -0.38); eyeR.material = mats.gold;
  shadowGen.addShadowCaster(eyeL); shadowGen.addShadowCaster(eyeR);
  const hair = makeBox("model-geometric-hair", 1.1, 0.62, 0.38, mats.chartreuse, 0, 0, -1, true, false);
  hair.parent = playerRoot; hair.position.set(0, 1.26, 0.02); hair.convertToFlatShadedMesh();
  const glasses = makeBox("model-sunglasses", 0.88, 0.14, 0.12, mats.ink, 0, 0, -1, true, false);
  glasses.parent = playerRoot; glasses.position.set(0, 1.0, -0.39);
  const shoeL = makeBox("model-shoe-l", 0.52, 0.18, 0.45, mats.red, 0, 0, -1, true, false);
  shoeL.parent = playerRoot; shoeL.position.set(-0.24, -2.35, -0.08);
  const shoeR = makeBox("model-shoe-r", 0.52, 0.18, 0.45, mats.red, 0, 0, -1, true, false);
  shoeR.parent = playerRoot; shoeR.position.set(0.24, -2.35, -0.08);
  const armL = makeBox("model-arm-l", 0.28, 1.18, 0.38, mats.paper, 0, 0, -1, true, false);
  armL.parent = playerRoot; armL.position.set(-0.56, -0.05, -0.08); armL.rotation.z = -0.12;
  const armR = makeBox("model-arm-r", 0.28, 1.18, 0.38, mats.paper, 0, 0, -1, true, false);
  armR.parent = playerRoot; armR.position.set(0.56, -0.05, -0.08); armR.rotation.z = 0.12;
  const lapelL = makeBox("model-lapel-l", 0.18, 0.62, 0.08, mats.paper, 0, 0, -1, false, false);
  lapelL.parent = playerRoot; lapelL.position.set(-0.22, 0.32, -0.24); lapelL.rotation.z = -0.3;
  const lapelR = makeBox("model-lapel-r", 0.18, 0.62, 0.08, mats.paper, 0, 0, -1, false, false);
  lapelR.parent = playerRoot; lapelR.position.set(0.22, 0.32, -0.24); lapelR.rotation.z = 0.3;
  const belt = makeBox("model-red-belt", 0.84, 0.15, 0.4, mats.red, 0, 0, -1, false, false);
  belt.parent = playerRoot; belt.position.set(0, -0.55, -0.22);
  const shirt = makeBox("model-cobalt-shirt", 0.3, 0.36, 0.08, mats.cobalt, 0, 0, -1, false, false);
  shirt.parent = playerRoot; shirt.position.set(0, 0.3, -0.25);
  const hairSideL = makeBox("model-hair-side-l", 0.22, 0.72, 0.3, mats.chartreuse, 0, 0, -1, true, false);
  hairSideL.parent = playerRoot; hairSideL.position.set(-0.47, 1.03, 0.02); hairSideL.rotation.z = -0.15;
  const hairSideR = makeBox("model-hair-side-r", 0.22, 0.72, 0.3, mats.chartreuse, 0, 0, -1, true, false);
  hairSideR.parent = playerRoot; hairSideR.position.set(0.47, 1.03, 0.02); hairSideR.rotation.z = 0.15;
  const faceAccent = makeBox("model-lip-accent", 0.12, 0.04, 0.08, mats.red, 0, 0, -1, false, false);
  faceAccent.parent = playerRoot; faceAccent.position.set(0.08, 0.82, -0.42);
  const wingFeathers: Mesh[] = [];
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 4; i++) {
      const feather = makeBox(`angel-feather-${side}-${i}`, 0.16 + i * 0.04, 1.05 + i * 0.18, 0.12, mats.feather, 0, 0, -1, true, false);
      feather.parent = playerRoot;
      feather.position.set(side * (0.62 + i * 0.12), 0.38 - i * 0.06, 0.08 + i * 0.015);
      feather.rotation.z = side * (0.35 + i * 0.12);
      feather.rotation.y = side * 0.12;
      feather.isVisible = false;
      wingFeathers.push(feather);
    }
  }
  const wingGlow = MeshBuilder.CreateTorus("angel-wing-aura", { diameter: 1.45, thickness: 0.06, tessellation: 24 }, scene);
  wingGlow.parent = playerRoot; wingGlow.position.set(0, 0.4, 0.12); wingGlow.rotation.x = Math.PI / 2; wingGlow.material = mats.gold; wingGlow.isVisible = false;
  const angelWingSprite = makeCharacterSpritePlate("angel-wings-sprite", ASSETS.angelWings, 3.6, 3.2, playerRoot, 0.18);
  angelWingSprite.plate.position.set(0, 0.35, 0.18);
  angelWingSprite.plate.scaling.setAll(0.72);
  angelWingSprite.plate.isVisible = false;
  const raceCarRoot = new TransformNode("race-car-root", scene);
  const raceCarBody = makeBox("race-car-body", 2.4, 0.55, 0.7, mats.red, 0, -1.15, -0.15, true, false);
  raceCarBody.parent = raceCarRoot;
  const raceCarCabin = makeBox("race-car-cabin", 1.0, 0.48, 0.56, mats.cobalt, -0.15, -0.72, -0.12, true, false);
  raceCarCabin.parent = raceCarRoot;
  const raceCarSpoiler = makeBox("race-car-spoiler", 0.18, 0.5, 0.12, mats.chartreuse, -1.05, -0.75, 0.05, true, false);
  raceCarSpoiler.parent = raceCarRoot;
  for (const side of [-1, 1] as const) {
    const wheel = MeshBuilder.CreateCylinder(`race-car-wheel-${side}`, { diameter: 0.48, height: 0.18, tessellation: 16 }, scene);
    wheel.parent = raceCarRoot; wheel.position.set(side * 0.72, -1.48, -0.18); wheel.rotation.z = Math.PI / 2; wheel.material = mats.ink;
  }
  raceCarRoot.parent = playerRoot;
  raceCarRoot.position.set(0, 0.1, -0.8); raceCarRoot.setEnabled(false);
  const modelSprite = MeshBuilder.CreatePlane("model-realistic-hero", { width: 1.8, height: 3.55 }, scene);
  modelSprite.parent = playerRoot; modelSprite.position.set(0, -0.2, -1.15); modelSprite.scaling.setAll(1.16); modelSprite.isVisible = true;
  const modelSpriteMat = new StandardMaterial("model-realistic-hero-material", scene);
  const makeHeroPoseTexture = (path: string) => {
    const texture = new Texture(path, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
    texture.hasAlpha = true;
    texture.vScale = -1;
    texture.vOffset = 1;
    return texture;
  };
  const heroPoseTextures = {
    idle: makeHeroPoseTexture("/assets/hero-idle.png"),
    run: makeHeroPoseTexture("/assets/hero-run.png"),
    runAlt: makeHeroPoseTexture("/assets/hero-run-2.png"),
    jump: makeHeroPoseTexture("/assets/hero-jump.png"),
    attack: makeHeroPoseTexture("/assets/hero-attack.png"),
    fly: makeHeroPoseTexture("/assets/hero-fly.png"),
  };
  let activeHeroTexture: keyof typeof heroPoseTextures = "idle";
  modelSpriteMat.diffuseTexture = heroPoseTextures.idle;
  modelSpriteMat.useAlphaFromDiffuseTexture = true;
  modelSpriteMat.diffuseColor = new Color3(1, 1, 1);
  modelSpriteMat.emissiveColor = new Color3(0.08, 0.08, 0.08);
  modelSpriteMat.backFaceCulling = false;
  modelSpriteMat.disableDepthWrite = true;
  modelSprite.material = modelSpriteMat;
  // The reference-matched sprite is the primary hero. Keep the procedural mesh
  // hidden so it cannot visually stack into the old pillar-like silhouette.
  playerRoot.getChildMeshes().forEach((mesh) => {
    if (mesh !== modelSprite) mesh.isVisible = false;
  });
  const applyCelOutline = (root: TransformNode | AbstractMesh) => {
    root.getChildMeshes().forEach((mesh) => {
      mesh.renderOutline = false;
      mesh.outlineColor = Color3.FromHexString(palette.ink);
      mesh.outlineWidth = 0.035;
    });
  };
  applyCelOutline(playerRoot);
  applyCelOutline(raceCarRoot);
  const GLB_URL = "/assets/fashion-hero-rigged.glb";
  const ENABLE_GLB = false;
  let glbRoot: AbstractMesh | null = null;
  let glbReady = false;
  let glbCurrentAnimation = "";
  const glbAnimations = new Map<string, AnimationGroup>();
  const setGLBAnimation = (name: string) => {
    if (!glbReady || glbCurrentAnimation === name) return;
    glbAnimations.forEach((group, key) => { if (key === name) group.start(true); else group.stop(); });
    glbCurrentAnimation = name;
  };
  const glbFileName = GLB_URL.split("/").pop() ?? "fashion-hero-rigged.glb";
  const glbRootUrl = GLB_URL.slice(0, GLB_URL.lastIndexOf("/") + 1);
  if (ENABLE_GLB) SceneLoader.ImportMeshAsync("", glbRootUrl, glbFileName, scene).then((result) => {
    if (scene.isDisposed) return;
    glbRoot = result.meshes.find((mesh) => mesh.name === "FashionHero" || mesh.parent === null) ?? result.meshes[0] ?? null;
    if (!glbRoot) return;
    glbRoot.parent = playerRoot;
    glbRoot.position.set(0, -1.65, -0.95);
    glbRoot.scaling.setAll(0.64);
    glbRoot.rotation.set(0, 0, 0);
    result.animationGroups.forEach((group) => glbAnimations.set(group.name, group));
    applyCelOutline(glbRoot);
    glbReady = glbAnimations.has("Idle");
    if (glbReady) {
      modelSprite.isVisible = false;
      setGLBAnimation("Idle");
    }
  }).catch(() => {
    // The local transparent hero remains visible if the optional GLB is unavailable.
    glbReady = false;
    modelSprite.isVisible = true;
  });
  let bagAnimT = 0;
  let shoeAnimT = 0;
  const BAG_ANIM_DUR = 0.22;
  const SHOE_ANIM_DUR = 0.28;
  let bagCooldown = 0;
  let shoeCooldown = 0;
  const BAG_COOLDOWN = 0.32;
  const SHOE_COOLDOWN = 0.45;

  const enemies: Enemy[] = [];
  const makeEnemy = (x: number, y: number, kind: Enemy["kind"], isBoss = false) => {
    const root = new TransformNode(`enemy-${kind}-${enemies.length}`, scene);
    root.position.set(x, y, isBoss ? -0.8 : -0.3);
    let w = isBoss ? 2.8 : 0.8, h = isBoss ? 3.2 : 0.8, vy0 = 0;

    if (kind === "crow") {
      w = 0.95; h = 0.55;
      const crowBody = makeBox("crow-body", 0.6, 0.35, 0.35, mats.feather, 0, 0, 0);
      crowBody.parent = root;
      const crowHead = MeshBuilder.CreateSphere("crow-head", { diameter: 0.3, segments: 8 }, scene);
      crowHead.parent = root; crowHead.position.set(0.3, 0.15, 0); crowHead.material = mats.feather;
      shadowGen.addShadowCaster(crowHead);
      const beak = makeBox("crow-beak", 0.25, 0.1, 0.12, mats.gold, 0.5, 0.12, 0, false, false);
      beak.parent = root;
      const eye = makeBox("crow-eye", 0.08, 0.08, 0.05, mats.red, 0.36, 0.2, -0.18, false, false);
      eye.parent = root;
      const wingL = makeBox("crow-wing-l", 0.55, 0.08, 0.3, mats.ink, -0.1, 0.18, 0, true, false);
      wingL.parent = root; wingL.rotation.z = 0.35;
      const wingR = makeBox("crow-wing-r", 0.55, 0.08, 0.3, mats.ink, -0.1, -0.08, 0, true, false);
      wingR.parent = root; wingR.rotation.z = -0.35;
      const tail = makeBox("crow-tail", 0.25, 0.08, 0.25, mats.feather, -0.42, 0, 0, false, false);
      tail.parent = root;
    } else if (kind === "bat") {
      w = 1.05; h = 0.5;
      const batBody = MeshBuilder.CreateSphere("bat-body", { diameter: 0.32, segments: 8 }, scene);
      batBody.parent = root; batBody.position.set(0, 0, 0); batBody.material = mats.wing;
      shadowGen.addShadowCaster(batBody);
      const batHead = MeshBuilder.CreateSphere("bat-head", { diameter: 0.22, segments: 8 }, scene);
      batHead.parent = root; batHead.position.set(0.18, 0.1, 0); batHead.material = mats.wing;
      const earL = makeBox("bat-ear-l", 0.08, 0.2, 0.06, mats.wing, 0.1, 0.28, 0, false, false);
      earL.parent = root; earL.rotation.z = -0.2;
      const earR = makeBox("bat-ear-r", 0.08, 0.2, 0.06, mats.wing, 0.26, 0.28, 0, false, false);
      earR.parent = root; earR.rotation.z = 0.2;
      const eyeL = makeBox("bat-eye-l", 0.06, 0.06, 0.04, mats.red, 0.2, 0.13, -0.17, false, false);
      eyeL.parent = root;
      const eyeR = makeBox("bat-eye-r", 0.06, 0.06, 0.04, mats.red, 0.28, 0.13, -0.17, false, false);
      eyeR.parent = root;
      const wingL = makeBox("bat-wing-l", 0.7, 0.06, 0.35, mats.wing, -0.15, 0.12, 0, true, false);
      wingL.parent = root; wingL.rotation.z = 0.5;
      const wingR = makeBox("bat-wing-r", 0.7, 0.06, 0.35, mats.wing, -0.15, -0.12, 0, true, false);
      wingR.parent = root; wingR.rotation.z = -0.5;
      const fangs = makeBox("bat-fangs", 0.12, 0.08, 0.04, mats.paper, 0.25, -0.02, -0.16, false, false);
      fangs.parent = root;
    } else if (kind === "drone") {
      w = 1.25; h = 0.9;
      const droneBody = MeshBuilder.CreateSphere(`drone-body-${enemies.length}`, { diameter: 0.62, segments: 12 }, scene);
      droneBody.parent = root; droneBody.material = mats.cobalt; shadowGen.addShadowCaster(droneBody);
      const lens = MeshBuilder.CreateSphere(`drone-lens-${enemies.length}`, { diameter: 0.24, segments: 12 }, scene);
      lens.parent = root; lens.position.z = -0.32; lens.material = mats.red;
      for (const side of [-1, 1] as const) {
        const arm = makeBox(`drone-arm-${enemies.length}-${side}`, 0.72, 0.08, 0.12, mats.ink, side * 0.42, 0.08, 0, true, false);
        arm.parent = root; arm.rotation.z = side * 0.18;
        const rotor = MeshBuilder.CreateTorus(`drone-rotor-${enemies.length}-${side}`, { diameter: 0.48, thickness: 0.045, tessellation: 16 }, scene);
        rotor.parent = root; rotor.position.set(side * 0.62, 0.16, 0); rotor.rotation.x = Math.PI / 2; rotor.material = mats.chartreuse;
      }
      const beacon = MeshBuilder.CreateCylinder(`drone-beacon-${enemies.length}`, { height: 0.28, diameter: 0.12, tessellation: 8 }, scene);
      beacon.parent = root; beacon.position.y = 0.42; beacon.material = mats.gold;
    } else if (kind === "hedgehog") {
      w = 0.85; h = 0.65;
      const hogBody = MeshBuilder.CreateSphere("hog-body", { diameter: 0.55, segments: 10 }, scene);
      hogBody.parent = root; hogBody.position.set(0, 0, 0); hogBody.material = mats.stone;
      shadowGen.addShadowCaster(hogBody);
      const hogFace = makeBox("hog-face", 0.28, 0.3, 0.3, mats.paper, 0.3, -0.05, 0, false, false);
      hogFace.parent = root;
      const nose = makeBox("hog-nose", 0.12, 0.1, 0.1, mats.ink, 0.5, -0.1, -0.02, false, false);
      nose.parent = root;
      const eye = makeBox("hog-eye", 0.07, 0.07, 0.04, mats.ink, 0.38, 0.02, -0.17, false, false);
      eye.parent = root;
      for (let si = 0; si < 9; si++) {
        const angle = (si / 9) * Math.PI - Math.PI / 2;
        const sx = Math.cos(angle) * 0.32;
        const sy = Math.sin(angle) * 0.32 + 0.05;
        const spike = makeBox(`hog-spike-${enemies.length}-${si}`, 0.08, 0.28, 0.08, mats.spike, sx, sy, 0, false, false);
        spike.parent = root;
        spike.rotation.z = angle + Math.PI / 2;
        spike.position.z = -0.02;
      }
      const feetF = makeBox("hog-feet-f", 0.35, 0.08, 0.22, mats.ink, 0.2, -0.3, 0, false, false);
      feetF.parent = root;
      const feetB = makeBox("hog-feet-b", 0.35, 0.08, 0.22, mats.ink, -0.25, -0.3, 0, false, false);
      feetB.parent = root;
    }

    if (isBoss) { w = 2.8; h = 3.2; }
    (root as unknown as Mesh).convertToFlatShadedMesh?.();
    // Keep the procedural enemy meshes visible. Optional sprite sheets are not required at runtime.
    const enemyPlate = MeshBuilder.CreatePlane(`enemy-realistic-plate-${kind}-${enemies.length}`, { width: w * 1.32, height: h * 1.55 }, scene);
    enemyPlate.parent = root; enemyPlate.position.set(0, 0, -0.48); enemyPlate.isVisible = false; enemyPlate.visibility = 0; enemyPlate.isPickable = false;
    let spritePlate: Mesh | undefined;
    let spriteMaterial: StandardMaterial | undefined;
    let spriteTextures: Record<string, Texture> | undefined;
    const spriteUrl = isBoss ? ASSETS.madameNoirIdle : kind === "drone" ? ASSETS.velvetDroneIdle : undefined;
    if (spriteUrl) {
      const sprite = makeCharacterSpritePlate(`character-sprite-${kind}-${enemies.length}`, spriteUrl, w * (isBoss ? 1.15 : 1.35), h * (isBoss ? 1.32 : 1.55), root, -0.82);
      spritePlate = sprite.plate;
      spriteMaterial = sprite.plateMaterial;
      spriteTextures = { idle: spriteMaterial.diffuseTexture as Texture };
      if (isBoss) {
        spriteTextures.attack = new Texture(ASSETS.madameNoirAttack, scene, true, false);
        spriteTextures.hit = new Texture(ASSETS.madameNoirHit, scene, true, false);
      } else if (kind === "drone") {
        spriteTextures.attack = new Texture(ASSETS.velvetDroneAttack, scene, true, false);
      }
      spritePlate.isVisible = true;
    }
    if (isBoss) {
      const crown = MeshBuilder.CreateTorus(`boss-crown-${enemies.length}`, { diameter: 1.5, thickness: 0.18, tessellation: 5 }, scene);
      crown.parent = root; crown.position.set(0, 1.65, -0.58); crown.rotation.x = Math.PI / 2; crown.material = mats.gold;
      const bossCore = MeshBuilder.CreateSphere(`boss-core-${enemies.length}`, { diameter: 0.72, segments: 20 }, scene);
      bossCore.parent = root; bossCore.position.set(0, 0.3, -0.62); bossCore.material = mats.red;
      const bossAura = MeshBuilder.CreateTorus(`boss-aura-${enemies.length}`, { diameter: 3.5, thickness: 0.08, tessellation: 32 }, scene);
      bossAura.parent = root; bossAura.position.set(0, 0.3, 0.15); bossAura.rotation.x = Math.PI / 2; bossAura.material = mats.lilac;
    }
    if (spritePlate) {
      root.getChildMeshes().forEach((child) => {
        if (child !== spritePlate && (!isBoss || (!child.name.startsWith("boss-aura") && !child.name.startsWith("boss-crown")))) child.isVisible = false;
      });
    }
    applyCelOutline(root);
    if (isBoss) root.getChildMeshes().forEach((mesh) => { mesh.outlineColor = Color3.FromHexString(palette.red); mesh.outlineWidth = 0.07; });
    enemies.push({ mesh: root as unknown as Mesh, x, y, w, h, vx: kind === "hedgehog" ? 0.85 : kind === "bat" ? 1.3 : 1.0, vy: vy0, kind, baseX: x, baseY: y, phase: enemies.length * 0.7, hp: isBoss ? 12 : 1, maxHp: isBoss ? 12 : 1, isBoss, spritePlate, spriteMaterial, spriteTextures });
  };
  [
    [8, -2.3, "hedgehog"], [14, 0.3, "crow"], [25, 1.2, "crow"], [33, -0.5, "bat"],
    [48, -1.8, "hedgehog"], [63, 0.5, "bat"], [77, -2.2, "hedgehog"], [83, -0.2, "crow"],
    [96, 1.1, "bat"], [108, -1.8, "hedgehog"], [124, -0.3, "crow"], [138, 0.8, "bat"],
    [150, -1.9, "hedgehog"], [166, 0.2, "crow"], [180, -1.4, "hedgehog"], [189, 0.9, "bat"],
    [205, -1.9, "hedgehog"], [215, 0.1, "crow"], [228, 0.7, "bat"], [238, -2.0, "hedgehog"],
  ].forEach((e) => makeEnemy(e[0] as number, e[1] as number, e[2] as Enemy["kind"]));
  makeEnemy(232, -1.8, "crow", true);

  const coins: Coin[] = [];
  const makeCoin = (x: number, y: number) => {
    const mesh = MeshBuilder.CreateTorus(`wood-ring-${coins.length}`, { diameter: 0.64, thickness: 0.13, tessellation: 22 }, scene);
    mesh.position.set(x, y, -0.6); mesh.material = mats.gold; shadowGen.addShadowCaster(mesh);
    const inner = MeshBuilder.CreateTorus(`wood-in-${coins.length}`, { diameter: 0.38, thickness: 0.05, tessellation: 16 }, scene);
    inner.position.set(x, y, -0.58); inner.material = mats.chartreuse;
    inner.parent = mesh as unknown as TransformNode;
    coins.push({ mesh: mesh as unknown as Mesh, x, y, taken: false, baseY: y, phase: coins.length * 0.4 });
  };
  [[3,-1.3],[5,-.2],[7,1.35],[11,-.25],[13,1.65],[18,2.1],[21,-1.4],[24,-.05],[28,.9],[33,1.7],[41,1.4],[45,1.7],[54,-1.3],[58,1.7],[65,-1.15],[70,.9],[77,1.2],[82,1.6],[91,-1.25],[98,1.9],[108,1.1],[116,1.6],[126,1.15],[137,-1.2],[145,1.6],[153,1.3],[163,1.9],[178,-1.3],[201,1.2],[215,-.9],[229,1.3],[240,-1.1]].forEach(([x,y]) => makeCoin(x,y));

  const powerItems: PowerItem[] = [];
  const makePowerItem = (x: number, y: number, kind: PowerItem["kind"]) => {
    let mesh: Mesh;
    let halo: Mesh;
    if (kind === "wings") {
      const wingL = MeshBuilder.CreateBox(`wing-L-${powerItems.length}`, { width: 0.7, height: 0.18, depth: 0.4 }, scene);
      wingL.position.set(-0.38, y, -0.7); wingL.material = mats.cobalt; wingL.rotation.z = -0.35; wingL.convertToFlatShadedMesh(); shadowGen.addShadowCaster(wingL);
      const wingR = MeshBuilder.CreateBox(`wing-R-${powerItems.length}`, { width: 0.7, height: 0.18, depth: 0.4 }, scene);
      wingR.position.set(0.38, y, -0.7); wingR.material = mats.cobalt; wingR.rotation.z = 0.35; wingR.convertToFlatShadedMesh(); shadowGen.addShadowCaster(wingR);
      const gem = MeshBuilder.CreateSphere(`wing-gem-${powerItems.length}`, { diameter: 0.3, segments: 10 }, scene);
      gem.position.set(0, y, -0.66); gem.material = mats.gold; shadowGen.addShadowCaster(gem);
      const root = new TransformNode(`wing-root-${powerItems.length}`, scene);
      wingL.parent = root; wingR.parent = root; gem.parent = root;
      mesh = root as unknown as Mesh;
      halo = MeshBuilder.CreateTorus(`halo-wings-${powerItems.length}`, { diameter: 1.4, thickness: 0.06, tessellation: 24 }, scene);
      halo.position.set(x, y, -0.72); halo.material = mats.cobalt;
    } else {
      mesh = makeBox(`${kind}-item-${powerItems.length}`, kind === "bag" ? 0.7 : 0.9, kind === "bag" ? 0.55 : 0.28, 0.35, kind === "bag" ? mats.red : mats.chartreuse, x, y, -0.7);
      mesh.convertToFlatShadedMesh();
      // Keep the procedural bag/shoe meshes visible; no external prop texture is required.
      const propPlate = MeshBuilder.CreatePlane(`prop-realistic-plate-${kind}-${powerItems.length}`, { width: kind === "bag" ? 0.92 : 1.15, height: kind === "bag" ? 0.72 : 0.48 }, scene);
      propPlate.parent = mesh; propPlate.position.z = -0.45; propPlate.isVisible = false;
      halo = MeshBuilder.CreateTorus(`halo-${kind}-${powerItems.length}`, { diameter: kind === "bag" ? 1.0 : 1.2, thickness: 0.05, tessellation: 24 }, scene);
      halo.position.set(x, y, -0.72); halo.material = mats.gold;
    }
    halo.material!.alpha = 0.55;
    powerItems.push({ mesh, x, y, kind, taken: false, baseY: y, phase: powerItems.length * 0.6 });
    return halo;
  };
  [[4.5,-1.4,"bag"],[6.5,-1.1,"shoe"],[32,.9,"bag"],[74,1.35,"shoe"],[118,1.2,"bag"],[137,0.6,"wings"],[164,1.2,"shoe"],[205,1.1,"bag"],[228,1.2,"shoe"]].forEach((e) => makePowerItem(e[0] as number, e[1] as number, e[2] as PowerItem["kind"]));
    const projectiles: Projectile[] = [];
  const bossOrbs: { mesh: Mesh; x: number; y: number; vx: number; vy: number; life: number }[] = [];
  let bossShotCooldown = 2.2;
  let bossCollapseLevel = 0;
  let autoAdvanceTimer: number | undefined;
  const allies: Ally[] = [];
  const makeAlly = (name: string, cageX: number, cageY: number, color: string, hairColor: string, shoeColor: string, offset: number) => {
    const bodyMat = material(`ally-body-${name}`, color, "#2A1F3A", 0.08);
    const hairMat = material(`ally-hair-${name}`, hairColor, "#2A2010", 0.12);
    const shoeMat = material(`ally-shoe-${name}`, shoeColor, "#3A1520", 0.1);

    const cageRoot = new TransformNode(`cage-${name}`, scene);
    cageRoot.position.set(cageX, cageY, -0.5);
    const cageBars: Mesh[] = [];
    for (let bx = -2; bx <= 2; bx++) {
      const barV = makeBox(`cage-v-${name}-${bx}`, 0.08, 2.6, 0.08, mats.cage, bx * 0.45, 0, 0);
      barV.parent = cageRoot; cageBars.push(barV);
    }
    for (let by = -1; by <= 1; by++) {
      const barH = makeBox(`cage-h-${name}-${by}`, 2.2, 0.08, 0.08, mats.cage, 0, by * 0.85, 0);
      barH.parent = cageRoot; cageBars.push(barH);
    }
    const cageTop = makeBox(`cage-top-${name}`, 2.3, 0.12, 0.5, mats.gold, 0, 1.35, 0);
    cageTop.parent = cageRoot; cageBars.push(cageTop);
    const cageBottom = makeBox(`cage-bot-${name}`, 2.3, 0.12, 0.5, mats.stone, 0, -1.35, 0);
    cageBottom.parent = cageRoot; cageBars.push(cageBottom);
    const lockMesh = makeBox(`cage-lock-${name}`, 0.25, 0.3, 0.1, mats.red, 0, 0, 0.28);
    lockMesh.parent = cageRoot; cageBars.push(lockMesh);

    const aRoot = new TransformNode(`ally-${name}`, scene);
    aRoot.position.set(cageX, cageY - 0.3, -2.0);
    aRoot.scaling.setAll(0.58);
    const aBody = makeBox(`ally-body-${name}`, 0.76, 1.3, 0.36, bodyMat, 0, 0, -1, true, false);
    aBody.parent = aRoot;
    const aCoat = makeBox(`ally-coat-${name}`, 0.64, 0.15, 0.4, shoeMat, 0, 0.48, -0.12, true, false);
    aCoat.parent = aRoot;
    const aLegL = makeBox(`ally-leg-l-${name}`, 0.2, 1.75, 0.26, bodyMat, -0.2, -1.42, 0, true, false);
    aLegL.parent = aRoot;
    const aLegR = makeBox(`ally-leg-r-${name}`, 0.2, 1.75, 0.26, bodyMat, 0.2, -1.42, 0, true, false);
    aLegR.parent = aRoot;
    const aHead = MeshBuilder.CreateSphere(`ally-head-${name}`, { diameter: 0.72, segments: 20 }, scene);
    aHead.parent = aRoot; aHead.position.set(0, 0.92, -0.02); aHead.material = mats.paper;
    shadowGen.addShadowCaster(aHead);
    const aHair = makeBox(`ally-hair-${name}`, 1.05, 0.6, 0.36, hairMat, 0, 1.24, 0.02, true, false);
    aHair.parent = aRoot; aHair.convertToFlatShadedMesh();
    const aShoeL = makeBox(`ally-shoe-l-${name}`, 0.48, 0.17, 0.42, shoeMat, -0.22, -2.32, -0.08, true, false);
    aShoeL.parent = aRoot;
    const aShoeR = makeBox(`ally-shoe-r-${name}`, 0.48, 0.17, 0.42, shoeMat, 0.22, -2.32, -0.08, true, false);
    aShoeR.parent = aRoot;
    const aArmL = makeBox(`ally-arm-l-${name}`, 0.17, 1.15, 0.28, mats.paper, -0.53, -0.04, -0.08, true, false);
    aArmL.parent = aRoot; aArmL.rotation.z = -0.12;
        const aArmR = makeBox(`ally-arm-r-${name}`, 0.17, 1.15, 0.28, mats.paper, 0.53, -0.04, -0.08, true, false);
    aArmR.parent = aRoot; aArmR.rotation.z = 0.12;
    const allySprite = name === "nyc" ? makeCharacterSpritePlate(`ally-sprite-${name}`, ASSETS.allyAriaIdle, 2.15, 3.2, aRoot, -1.25) : undefined;
    const allySpriteTextures = allySprite ? { idle: allySprite.plateMaterial.diffuseTexture as Texture, run: new Texture(ASSETS.allyAriaRun, scene, true, false) } : undefined;
    if (allySprite) {
      allySprite.plate.position.set(0, -0.25, -1.25);
      allySprite.plate.isVisible = true;
      aRoot.getChildMeshes().forEach((child) => { if (child !== allySprite.plate) child.isVisible = false; });
    }
    allies.push({

      root: aRoot, body: aBody, head: aHead, hair: aHair, saved: false, spritePlate: allySprite?.plate, spriteMaterial: allySprite?.plateMaterial, spriteTextures: allySpriteTextures,
      x: cageX, y: cageY - 0.3, vx: 0, vy: 0, targetX: cageX, offset, phase: Math.random() * 6,
      color, hairColor, shoeColor,
      cage: { root: cageRoot, bars: cageBars, x: cageX, y: cageY },
      lastShot: 0, name,
    });
  };
  makeAlly("nyc", 42, -0.7, palette.lilac, palette.gold, palette.red, -1.8);
  makeAlly("milano", 105, -0.7, palette.cobalt, palette.paper, palette.chartreuse, -0.6);
  makeAlly("paris", 172, -0.7, palette.red, palette.chartreuse, palette.ink, 0.6);

  type StageSpec = {
    mode: StageMode;
    platforms: [number, number, number][];
    enemies: [number, number, Enemy["kind"], boolean?][];
    coins: [number, number][];
    items: [number, number, PowerItem["kind"]][];
    allies: [number, number][];
  };
  const STAGE_SPECS: StageSpec[] = [
    {
      // Stage 01: a readable runway tutorial. Every jump has a safe landing and the goal is visible from the final approach.
      mode: "runway",
      platforms: [[-15,-3.06,280],[10,-1.9,7],[25,-0.9,7],[42,-2.1,10],[62,-1.1,8],[82,-2.0,9],[105,-0.8,8],[130,-1.8,10],[156,-0.7,9],[182,-1.8,10],[210,-0.9,11],[236,-2.0,8]],
      enemies: [[18,-1.55,"hedgehog"],[49,-1.35,"crow"],[91,-1.45,"hedgehog"],[138,-1.3,"crow"],[191,-1.35,"hedgehog"],[238,-1.45,"crow",true]],
      coins: [[6,-1.25],[15,-0.95],[29,0.15],[46,-1.25],[66,0.05],[86,-1.25],[110,0.3],[135,-1.05],[161,0.45],[187,-1.05],[216,0.2],[240,-1.1]],
      items: [[13,-0.55,"bag"],[69,0.35,"shoe"],[145,0.5,"bag"]], allies: [],
    },
    {
      // Stage 02: a different horizontal rhythm with short step-ups, still no vertical/underground/race/flight rules.
      mode: "runway",
      platforms: [[-15,-3.06,280],[12,-2.2,10],[29,-1.0,6],[45,-2.3,12],[67,-1.1,6],[86,-2.4,13],[110,-1.2,7],[132,-2.1,11],[156,-1.0,7],[180,-2.3,12],[206,-1.1,8],[232,-2.2,12]],
      enemies: [[16,-1.55,"hedgehog"],[38,-0.6,"crow"],[53,-1.6,"hedgehog"],[75,-0.65,"crow"],[96,-1.65,"hedgehog"],[119,-0.75,"crow"],[143,-1.5,"hedgehog"],[169,-0.65,"crow"],[194,-1.55,"hedgehog"],[220,-0.7,"crow"],[240,-1.55,"crow",true]],
      coins: [[8,-1.3],[17,-1.35],[32,-0.15],[49,-1.35],[70,-0.2],[90,-1.45],[113,-0.25],[137,-1.2],[160,0.0],[185,-1.35],[209,-0.15],[236,-1.25]],
      items: [[31,-0.2,"bag"],[91,-0.35,"shoe"],[161,0.2,"bag"],[212,0.0,"shoe"]], allies: [],
    },
    {
      mode: "underground",
      platforms: [[-15,-3.06,18],[18,-5.6,11],[36,-9.4,9],[55,-13.2,12],[78,-17.8,10],[101,-22.5,13],[126,-27.4,9],[151,-32.5,12],[178,-38,10],[205,-43.5,13],[230,-49,14]],
      enemies: [[24,-4.2,"hedgehog"],[41,-8.0,"bat"],[60,-11.8,"crow"],[84,-16.2,"bat"],[106,-21.0,"hedgehog"],[132,-25.8,"crow"],[157,-30.9,"bat"],[184,-36.3,"hedgehog"],[212,-41.9,"crow"],[238,-47.2,"crow",true]],
      coins: [[20,-4.4],[29,-6.7],[40,-8.3],[59,-12.2],[82,-16.7],[105,-21.5],[130,-26.4],[155,-31.5],[183,-37],[211,-42.5],[237,-48]],
      items: [[35,-8.2,"bag"],[81,-16.8,"shoe"],[128,-26.2,"wings"],[183,-36.5,"bag"]], allies: [[31,-6.2],[82,-16.6],[155,-31.2]],
    },
    {
      mode: "race",
      platforms: [[-15,-3.06,280],[18,-2.5,14],[48,-2.5,12],[78,-2.5,16],[112,-2.5,13],[145,-2.5,15],[180,-2.5,14],[216,-2.5,18]],
      enemies: [[24,-1.5,"hedgehog"],[52,-1.5,"crow"],[82,-1.5,"bat"],[110,-1.5,"hedgehog"],[140,-1.5,"crow"],[171,-1.5,"bat"],[202,-1.5,"hedgehog"],[232,-1.5,"crow",true]],
      coins: [[10,-1.4],[22,-.8],[38,-1.4],[55,-.8],[72,-1.4],[90,-.8],[108,-1.4],[126,-.8],[146,-1.4],[166,-.8],[188,-1.4],[210,-.8],[232,-1.4]],
      items: [[35,-1.2,"shoe"],[96,-1.2,"bag"],[158,-1.2,"shoe"],[205,-1.2,"bag"]], allies: [[64,-1.4],[130,-1.4],[190,-1.4]],
    },
    {
      mode: "dogfight",
      platforms: [[-15,-3.06,280],[36,-2.8,8],[92,-1.1,7],[148,1.1,7],[204,-.5,8],[235,2.2,10]],
      enemies: [[20,1.2,"drone"],[42,3.2,"drone"],[65,.2,"drone"],[88,4.4,"drone"],[112,1.8,"drone"],[138,3.8,"drone"],[165,.8,"drone"],[188,4.6,"drone"],[214,2.2,"drone"],[238,3.5,"drone",true]],
      coins: [[18,2.2],[39,4.0],[61,1.4],[84,5.0],[108,2.8],[132,4.6],[158,1.8],[182,5.1],[208,3.0],[232,4.6]],
      items: [[18,2.8,"wings"],[74,4.1,"bag"],[132,3.8,"shoe"],[190,4.8,"bag"]], allies: [[42,2.3],[116,3.2],[188,2.8]],
    },
  ];
  type StageProfile = { name: string; mode: StageMode; boss: string; gimmick: "neon-gates" | "sky-rails" | "lava-lift" | "turbo-ramp" | "drone-storm" | "mirror-walls" | "rescue-train" | "cannon-climb" | "web-towers" | "laser-runway" | "cloud-bridge" | "core-collapse"; terrainShift: number; terrainWave: number; accent: "gold" | "red" | "cobalt" | "lilac" | "chartreuse" };
  const STAGE_PROFILES: StageProfile[] = [
    { name: "NEON RUNWAY", mode: "runway", boss: "The Velvet Panther", gimmick: "neon-gates", terrainShift: 0, terrainWave: 0.08, accent: "gold" },
    { name: "MILANO STEP RUN", mode: "runway", boss: "Madame Elevator", gimmick: "mirror-walls", terrainShift: 0.05, terrainWave: 0.04, accent: "cobalt" },
    { name: "CINDER DESCENT", mode: "underground", boss: "The Ash Moth", gimmick: "lava-lift", terrainShift: -0.2, terrainWave: 0.42, accent: "red" },
    { name: "TURBO COUTURE", mode: "race", boss: "Chrome Jackal", gimmick: "turbo-ramp", terrainShift: 0.1, terrainWave: 0.12, accent: "chartreuse" },
    { name: "DRONE HORIZON", mode: "dogfight", boss: "Nino Prime", gimmick: "drone-storm", terrainShift: 0.6, terrainWave: 0.35, accent: "lilac" },
    { name: "MIRROR MILANO", mode: "runway", boss: "The Glass Countess", gimmick: "mirror-walls", terrainShift: -0.3, terrainWave: 0.18, accent: "gold" },
    { name: "RESCUE EXPRESS", mode: "vertical", boss: "The Iron Stylist", gimmick: "rescue-train", terrainShift: 0.45, terrainWave: 0.32, accent: "red" },
    { name: "CANNON COUTURE", mode: "underground", boss: "Baron Basalt", gimmick: "cannon-climb", terrainShift: -0.4, terrainWave: 0.5, accent: "cobalt" },
    { name: "WEB TOWERS", mode: "runway", boss: "Silk Widow", gimmick: "web-towers", terrainShift: 0.2, terrainWave: 0.24, accent: "lilac" },
    { name: "LASER RUNWAY", mode: "race", boss: "Laser Leopard", gimmick: "laser-runway", terrainShift: 0.05, terrainWave: 0.16, accent: "chartreuse" },
    { name: "CLOUD BRIDGE", mode: "flight", boss: "The Sky Empress", gimmick: "cloud-bridge", terrainShift: 0.8, terrainWave: 0.38, accent: "gold" },
    { name: "CORE COLLAPSE", mode: "dogfight", boss: "Nino Omega", gimmick: "core-collapse", terrainShift: 0.15, terrainWave: 0.62, accent: "red" },
  ];
  const stageGimmickRoot = new TransformNode("stage-gimmick-root", scene);
  const stageGimmickMeshes: Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const gate = makeBox(`stage-gimmick-gate-${i}`, 0.16, 3.8 + i * 0.22, 0.18, mats.gold, 0, 0, -0.15, true, false);
    gate.parent = stageGimmickRoot; gate.position.x = i * 1.6;
    stageGimmickMeshes.push(gate);
    const light = MeshBuilder.CreateSphere(`stage-gimmick-light-${i}`, { diameter: 0.24, segments: 10 }, scene);
    light.parent = stageGimmickRoot; light.position.set(i * 1.6, 1.8 + i * 0.18, -0.35); light.material = mats.chartreuse; stageGimmickMeshes.push(light);
  }
  stageGimmickRoot.setEnabled(false);
  const stageIndexForCollection = (index: number) => Math.floor(index / SECTIONS_PER_STAGE);
  const stageProfileForCollection = (index: number) => STAGE_PROFILES[Math.min(STAGE_PROFILES.length - 1, stageIndexForCollection(index))];
  const sectionIndexForCollection = (index: number) => index % SECTIONS_PER_STAGE;
  const stageModeForCollection = (index: number): StageMode => stageProfileForCollection(index).mode;
  const applyStageLayout = () => {
    const stageIndex = stageIndexForCollection(collectionIndex);
    const sectionIndex = sectionIndexForCollection(collectionIndex);
    const profile = stageProfileForCollection(collectionIndex);
    const spec = STAGE_SPECS[stageIndex % STAGE_SPECS.length];
    const remix = sectionIndex;
    const terrainOffset = profile.terrainShift + Math.sin(sectionIndex * 1.7) * profile.terrainWave;
    platforms.forEach((p) => p.mesh.setEnabled(false));
    spec.platforms.forEach(([px, py, pw], index) => {
      const p = platforms[index]; if (!p) return;
      const wave = Math.sin((index + sectionIndex * 2) * 0.9) * profile.terrainWave;
      p.x = px; p.y = py + terrainOffset + wave; p.w = pw; p.mesh.setEnabled(true); p.mesh.position.set(px + pw / 2 + profile.terrainShift, p.y, p.mesh.position.z); p.mesh.scaling.x = 1 + ((stageIndex % 3) * 0.035);
    });
    enemies.forEach((e, index) => {
      const data = spec.enemies[index];
      if (!data) { e.dead = true; e.mesh.setEnabled(false); return; }
      e.x = data[0] + remix * 0.8 + profile.terrainShift; e.y = data[1] + Math.sin(index * 0.8 + sectionIndex) * profile.terrainWave; e.baseX = e.x; e.baseY = e.y; e.dead = false; e.isBoss = Boolean(data[3]); e.hp = Math.ceil((e.maxHp ?? 1) * (1 + collectionIndex * 0.3 + stageIndex * 0.08)); e.mesh.setEnabled(true); e.mesh.getChildMeshes().forEach((child) => { if (!child.name.startsWith("enemy-realistic-plate")) { child.setEnabled(true); child.isVisible = true; } }); e.mesh.position.set(e.x, e.y, e.mesh.position.z);
    });
    coins.forEach((c, index) => {
      const data = spec.coins[index]; if (!data) { c.taken = true; c.mesh.setEnabled(false); return; }
      c.x = data[0] + remix * 0.6; c.y = data[1]; c.baseY = c.y; c.taken = false; c.mesh.setEnabled(true); c.mesh.position.set(c.x, c.y, c.mesh.position.z);
    });
    powerItems.forEach((p, index) => {
      const data = spec.items[index]; if (!data) { p.taken = true; p.mesh.setEnabled(false); return; }
      p.x = data[0] + remix * 0.6; p.y = data[1]; p.kind = data[2]; p.baseY = p.y; p.taken = false; p.mesh.setEnabled(true); p.mesh.position.set(p.x, p.y, p.mesh.position.z);
    });
    allies.forEach((a, index) => {
      const [ax, ay] = spec.allies[index] ?? [-100, -100];
      a.saved = false; a.x = ax; a.y = ay; a.targetX = ax; a.root.position.set(ax, ay - 0.3, -2.0);
      if (a.cage) { a.cage.x = ax; a.cage.y = ay; a.cage.root.position.set(ax, ay, -0.5); a.cage.root.setEnabled(ax > 0); a.cage.bars.forEach((bar) => bar.setEnabled(ax > 0)); }
    });
    safeFloor.setEnabled(spec.mode !== "underground");
    bossCollapseLevel = 0;
    stagePortalRoot.position.x = spec.mode === "underground" ? 18 : 8;
    stagePortalRoot.position.y = spec.mode === "underground" ? -5.2 : -2.25;
    stagePortalRoot.setEnabled(collectionIndex > 0 || spec.mode !== "runway");
    stagePortal.material = profile.accent === "lilac" ? mats.lilac : profile.accent === "cobalt" ? mats.cobalt : profile.accent === "chartreuse" ? mats.chartreuse : profile.accent === "gold" ? mats.gold : mats.red;
    stagePortalRing.material = profile.gimmick === "laser-runway" || profile.gimmick === "drone-storm" || profile.gimmick === "core-collapse" ? mats.chartreuse : mats.gold;
    stageGimmickRoot.setEnabled(true);
    stageGimmickRoot.position.set(42 + stageIndex * 2.5, profile.gimmick === "lava-lift" || profile.gimmick === "cannon-climb" ? -1.0 : 0.1, -0.55);
    stageGimmickRoot.rotation.z = profile.gimmick === "sky-rails" || profile.gimmick === "cloud-bridge" ? 0.16 : profile.gimmick === "mirror-walls" ? -0.12 : 0;
    const gimmickMaterial = profile.accent === "red" ? mats.red : profile.accent === "cobalt" ? mats.cobalt : profile.accent === "lilac" ? mats.lilac : profile.accent === "chartreuse" ? mats.chartreuse : mats.gold;
    stageGimmickMeshes.forEach((mesh, index) => { mesh.material = index % 2 === 0 ? gimmickMaterial : mats.chartreuse; mesh.setEnabled(true); });
    raceCarRoot.setEnabled(spec.mode === "race" || profile.gimmick === "turbo-ramp" || profile.gimmick === "laser-runway");
  };

  const checkpointPole = makeBox("checkpoint-pole", 0.18, 2.8, 0.22, mats.cobalt, 57, -1.4, -0.4, true, true);
  const flag = MeshBuilder.CreatePlane("checkpoint-cloth", { width: 1.3, height: 0.7 }, scene);
  flag.position.set(57.55, -0.65, -0.42); flag.material = mats.chartreuse;
  flag.receiveShadows = true;
  const goal = makeBox("runway-goal-gate", 1.2, 4.2, 0.28, mats.cobalt, 250, -1.05, -0.4);
  const goalTop = makeBox("runway-goal-top", 3.8, 0.34, 0.34, mats.chartreuse, 250, 0.92, -0.45);
  const goalRing = MeshBuilder.CreateTorus("goal-ring", { diameter: 2.1, thickness: 0.18, tessellation: 28 }, scene);
  goalRing.position.set(250, 0.05, -0.5); goalRing.rotation.x = Math.PI / 2; goalRing.material = mats.gold;
  const stagePortalRoot = new TransformNode("stage-portal-root", scene);
  const stagePortal = MeshBuilder.CreateCylinder("stage-portal", { height: 1.75, diameter: 1.8, tessellation: 20 }, scene);
  stagePortal.parent = stagePortalRoot; stagePortal.position.y = 0.78; stagePortal.material = mats.cobalt;
  const stagePortalRing = MeshBuilder.CreateTorus("stage-portal-ring", { diameter: 1.95, thickness: 0.16, tessellation: 24 }, scene);
  stagePortalRing.parent = stagePortalRoot; stagePortalRing.position.y = 1.62; stagePortalRing.rotation.x = Math.PI / 2; stagePortalRing.material = mats.gold;
  const stagePortalGlow = MeshBuilder.CreateTorus("stage-portal-glow", { diameter: 1.25, thickness: 0.05, tessellation: 24 }, scene);
  stagePortalGlow.parent = stagePortalRoot; stagePortalGlow.position.y = 0.78; stagePortalGlow.rotation.x = Math.PI / 2; stagePortalGlow.material = mats.chartreuse;
  const confetti: Mesh[] = [];
  for (let i = 0; i < 80; i++) {
    const c = makeBox(`confetti-${i}`, 0.1 + Math.random() * 0.12, 0.04 + Math.random() * 0.05, 0.02, [mats.chartreuse, mats.red, mats.gold, mats.lilac, mats.paper, mats.cobalt][i % 6], 250 + (Math.random() - 0.5) * 10, 4 + Math.random() * 6, -0.5 + (Math.random() - 0.5) * 1, false, false);
    c.setEnabled(false); confetti.push(c);
  }

  const particles: Particle[] = [];
  const spawnParticles = (sx: number, sy: number, count: number, color: string, spread = 2, sizeBase = 0.08, life = 0.7, gravity = -8, speed = 3.5) => {
    for (let i = 0; i < count; i++) {
      const size = sizeBase * (0.6 + Math.random() * 0.8);
      const matKey = color + Math.floor(Math.random() * 100);
      let mat: StandardMaterial;
      if (color === "spark") mat = material(`p-${matKey}`, "#FFE688", "#FFD23F", 1.5);
      else if (color === "dust") mat = material(`p-${matKey}`, "#F3E9D9", "#4B3542", 0.1);
      else if (color === "blood") mat = material(`p-${matKey}`, palette.red, "#4D1625", 0.3);
      else if (color === "chart") mat = material(`p-${matKey}`, palette.chartreuse, "#606A2A", 0.8);
      else if (color === "blue") mat = material(`p-${matKey}`, palette.cobalt, "#182D49", 0.5);
      else if (color === "lilac") mat = material(`p-${matKey}`, palette.lilac, "#271A36", 0.5);
      else mat = material(`p-${matKey}`, palette.paper, "#4B3542", 0.1);
      const m = MeshBuilder.CreateBox(`p-mesh-${Date.now()}-${Math.random()}`, { width: size, height: size, depth: size }, scene);
      m.position.set(sx, sy, -0.5);
      m.material = mat;
      const ang = Math.random() * Math.PI * 2;
      const spd = speed * (0.4 + Math.random());
      particles.push({ mesh: m, x: sx, y: sy, vx: Math.cos(ang) * spd * spread, vy: Math.sin(ang) * spd + speed * 0.3, life, maxLife: life, color, size, gravity });
    }
  };
  const updateParticles = (dt: number) => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      const a = Math.max(0, p.life / p.maxLife);
      p.mesh.position.set(p.x, p.y, -0.5);
      (p.mesh.material as StandardMaterial).alpha = a;
      p.mesh.scaling.setAll(0.4 + a * 0.8);
      p.mesh.rotation.z += dt * 8;
      if (p.life <= 0 || p.y < -6) {
        p.mesh.dispose();
        particles.splice(i, 1);
      }
    }
  };

  const shakeBurst = (amount: number, duration: number) => { shakeAmt = Math.max(shakeAmt, amount); shakeDur = Math.max(shakeDur, duration); };
  const flashBurst = (hex: string, strength: number, duration: number) => { flashColor = Color3.FromHexString(hex); flashAmt = Math.max(flashAmt, strength); flashDur = Math.max(flashDur, duration); };
  const freeze = (time: number) => { hitStop = Math.max(hitStop, time); };

  let demoMode = new URLSearchParams(window.location.search).has("demo");
  let running = demoMode;
  let gameOver = false;
  let finished = false;
  let x = -5; let y = -1.2; let vx = 0; let vy = 0;
  let jumps = 0; let score = 0; let combo = 0; let lives = 3;
  let checkpointReached = false; let cameraX = 0; let cameraTargetX = 0; let cameraY = 0; let cameraTargetY = 0;
  let last = performance.now(); let invulnerable = 0;
  let outfitIndex = 0; let spin = 0; let lastInputDirection = 1;
  let jumpBuffer = 0; let coyoteTime = 0;
  let jumpBoostTimer = 0; let speedBoostTimer = 0;
  let bagAmmo = 99; let shoeAmmo = 99; let spinActive = false;
  let shakeAmt = 0; let shakeDur = 0; let shakeX = 0; let shakeY = 0;
  let flashAmt = 0; let flashDur = 0; let flashColor = new Color3(1, 1, 1);
  let hitStop = 0;
  let runCycle = 0; let lastLanded = false;
  let highScore = Number(localStorage.getItem("frw-high") || "0");
  let confettiActive = false;
  let hasWings = false;
  let flyFuel = 0;
  let webAnchorIndex = -1;
  let webLength = 0;
  let webLine: LinesMesh | null = null;
  let webPulse = 0;
  let renderLean = 0;
  let renderBob = 0;
  const FLY_MAX_FUEL = 6.0;
  const FLY_LIFT_ACCEL = 58;
  const FLY_FALL_DAMP = 0.72;
  const webAnchors: WebAnchor[] = [
    [-2, 4.4], [12, 5.8], [27, 4.8], [43, 7.2], [61, 5.4], [82, 8.6], [104, 6.5], [128, 9.2], [154, 7.6], [183, 10.2], [214, 8.8]
  ].map(([ax, ay], index) => {
    const mesh = MeshBuilder.CreateSphere(`web-anchor-${index}`, { diameter: 0.34, segments: 12 }, scene);
    mesh.position.set(ax, ay, -0.35);
    mesh.material = mats.chartreuse;
    mesh.renderOutline = false; mesh.outlineColor = Color3.FromHexString(palette.ink); mesh.outlineWidth = 0.035;
    return { mesh, x: ax, y: ay, active: true };
  });
  const clearWebLine = () => { if (webLine) { webLine.dispose(); webLine = null; } };
  const releaseWeb = () => { if (webAnchorIndex >= 0) { webAnchorIndex = -1; webLength = 0; webPulse = 0; clearWebLine(); } };
  const attachWeb = () => {
    let best = -1; let bestDist = 17;
    webAnchors.forEach((anchor, index) => {
      if (!anchor.active) return;
      const dx = anchor.x - x; const dy = anchor.y - y; const dist = Math.hypot(dx, dy);
      if (dist < bestDist && (dy > 0.25 || dist < 6)) { best = index; bestDist = dist; }
    });
    if (best < 0) return;
    webAnchorIndex = best; webLength = Math.max(3.2, bestDist); webPulse = 1;
    vx += (webAnchors[best].x >= x ? 2.2 : -2.2); vy += 3.5;
    spawnParticles(x, y + 0.4, 12, "spark", 1.2, 0.06, 0.6, -2, 2.8);
  };
  const refreshWebLine = () => {
    clearWebLine();
    if (webAnchorIndex < 0) return;
    const anchor = webAnchors[webAnchorIndex];
    webLine = MeshBuilder.CreateLines("web-line", { points: [new Vector3(x, y + 0.65, -0.45), new Vector3(anchor.x, anchor.y, -0.45)] }, scene);
    webLine.color = new Color3(0.94, 0.98, 1); webLine.alpha = 0.9;
    webLine.renderOutline = false; webLine.outlineColor = Color3.FromHexString(palette.ink); webLine.outlineWidth = 0.025;
  };
  let crouching = false;
  let crouchInput = false;
  const CROUCH_H_MULT = 0.58;
  let wingFlapPhase = 0;
  let partyCount = 1;
  let collectionIndex = 0;
  let loadout: "balanced" | "arsenal" | "sky" = "balanced";
  // Eight stages: each city returns with a harder remix and new gimmick pacing.
  const COLLECTIONS: City[] = ["NEW YORK", "MILANO", "PARIS", "TOKYO", "NEW YORK", "MILANO", "PARIS", "TOKYO", "NEW YORK", "MILANO", "PARIS", "TOKYO"];
  const stageIndex = () => stageIndexForCollection(collectionIndex);
  const sectionIndex = () => sectionIndexForCollection(collectionIndex);
  const stageMode = (): StageMode => stageModeForCollection(collectionIndex);
  applyStageLayout();

  const flashOverlay = MeshBuilder.CreatePlane("flash-overlay", { width: 280, height: 20 }, scene);
  flashOverlay.position.z = -19.5;
  const flashMat = new StandardMaterial("flash-mat", scene);
  flashMat.disableLighting = true; flashMat.transparencyMode = 2; flashMat.alpha = 0; flashMat.backFaceCulling = false;
  flashOverlay.material = flashMat;

  const applyOutfit = (index: number) => {
    outfitIndex = ((index % 3) + 3) % 3;
    if (outfitIndex === 0) { body.material = mats.ink; coat.material = mats.red; hair.material = mats.chartreuse; belt.material = mats.red; shirt.material = mats.cobalt; shoeL.material = mats.red; shoeR.material = mats.red; hairSideL.material = mats.chartreuse; hairSideR.material = mats.chartreuse; }
    else if (outfitIndex === 1) { body.material = mats.red; coat.material = mats.paper; hair.material = mats.paper; belt.material = mats.cobalt; shirt.material = mats.paper; shoeL.material = mats.stone; shoeR.material = mats.stone; hairSideL.material = mats.paper; hairSideR.material = mats.paper; }
    else { body.material = mats.ink; coat.material = mats.cobalt; hair.material = mats.lilac; belt.material = mats.chartreuse; shirt.material = mats.paper; shoeL.material = mats.ink; shoeR.material = mats.ink; hairSideL.material = mats.lilac; hairSideR.material = mats.lilac; }
  };
  applyOutfit(0);

  const cityForX = (px: number): City => COLLECTIONS[stageIndex() % COLLECTIONS.length];
  const skyForCity = (c: City) => c === "NEW YORK" ? palette.sky1 : c === "MILANO" ? palette.sky2 : c === "PARIS" ? palette.sky3 : palette.sky4;
  const snapshot = () => {
    const city = cityForX(x);
    const activeBoss = enemies.find((enemy) => enemy.isBoss && !enemy.dead);
    const bossNames: Record<City, string> = { "NEW YORK": "THE EDITOR", MILANO: "LA SCISSORA", PARIS: "MADAME NOIR", TOKYO: "KAMI OF THE RUNWAY" };
    if (score > highScore) { highScore = score; localStorage.setItem("frw-high", String(highScore)); }
    const relics = coins.filter((coin) => coin.taken).length;
    const rescueKeys = Math.floor(relics / 5);
    onSnapshot({ score, city, progress: Math.min(1, Math.max(0, x / 250)), running, gameOver, finished, combo, lives, checkpoint: checkpointReached, outfit: outfitIndex, jumpBoost: jumpBoostTimer > 0, speedBoost: speedBoostTimer > 0, bagAmmo, shoeAmmo, highScore, flyFuel: flyFuel / FLY_MAX_FUEL, hasWings, crouching, partyCount, collection: collectionIndex, stageIndex: stageIndex(), sectionIndex: sectionIndex(), totalStages: TOTAL_STAGES, sectionsPerStage: SECTIONS_PER_STAGE, stageName: stageProfileForCollection(collectionIndex).name, stageMode: stageMode(), bossName: activeBoss ? stageProfileForCollection(collectionIndex).boss : undefined, bossHp: activeBoss?.hp, bossMaxHp: activeBoss?.maxHp, relics, rescueKeys });
  };

  const popup = (value: number, px: number, py: number, kind: PopupEvent["kind"]) => {
    onPopup?.({ value, x: px, y: py, kind });
  };

  const nearestEnemyTarget = () => enemies
    .filter((enemy) => !enemy.dead && enemy.mesh.isEnabled() && enemy.x > x - 1 && enemy.x < x + 24)
    .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
  const throwBag = () => {
    if (!running || bagCooldown > 0) return;
    bagCooldown = BAG_COOLDOWN;
    bagAnimT = BAG_ANIM_DUR;
    const dir = lastInputDirection || 1;
    const target = nearestEnemyTarget();
    const mesh = makeBox(`thrown-bag-${projectiles.length}`, 0.55, 0.42, 0.32, mats.red, x + dir * 1.1, y + 0.35, -0.8);
    projectiles.push({ mesh, x: x + dir * 1.1, y: y + 0.35, vx: dir * 17.5, vy: 2.5, active: true, kind: "bag", gravity: target ? 0 : 14, owner: "player", targetX: target?.x, targetY: target ? target.y + target.h / 2 : undefined });
    spawnParticles(x + dir * 0.9, y + 0.3, 8, "blood", 1.2, 0.08, 0.4, -3, 2.2);
    shakeBurst(0.06, 0.1);
    freeze(0.015);
  };

  const kickShoe = () => {
    if (!running || shoeCooldown > 0) return;
    shoeCooldown = SHOE_COOLDOWN;
    shoeAnimT = SHOE_ANIM_DUR;
    const dir = lastInputDirection || 1;
    const target = nearestEnemyTarget();
    const mesh = makeBox(`kicked-shoe-${projectiles.length}`, 0.85, 0.22, 0.38, mats.chartreuse, x + dir * 1.3, y - 0.9, -0.8);
    projectiles.push({ mesh, x: x + dir * 1.3, y: y - 0.9, vx: dir * 21.5, vy: 5.2, active: true, kind: "shoe", gravity: target ? 0 : 16, owner: "player", targetX: target?.x, targetY: target ? target.y + target.h / 2 : undefined });
    spawnParticles(x + dir * 1.0, y - 0.8, 10, "chart", 1.4, 0.09, 0.45, -4, 2.8);
    shakeBurst(0.09, 0.13);
    flashBurst(palette.chartreuse, 0.1, 0.08);
    freeze(0.02);
  };

  const jump = () => {
    if (!running) { restart(true, false); jumpBuffer = 0.12; snapshot(); return; }
    jumpBuffer = 0.12;
    if (jumps === 0 || coyoteTime > 0) {
      vy = jumpBoostTimer > 0 ? 12.8 : 10.8;
      jumps = 1; spinActive = false; lastLanded = false; coyoteTime = 0;
      spawnParticles(x, y - 1.6, 10, "dust", 1.3, 0.1, 0.55, -4, 2.2);
      shakeBurst(0.05, 0.12);
    } else if (jumps === 1) {
      // Press jump again while airborne: perform a second jump with an aerial spin.
      // This is available in the beginner stages too, so the action is easy to discover.
      vy = jumpBoostTimer > 0 ? 10.6 : 8.8;
      jumps = 2; spinActive = true; spin = 0; coyoteTime = 0;
      spawnParticles(x, y - 0.3, 14, "chart", 1.8, 0.09, 0.7, -6, 3.5);
      shakeBurst(0.08, 0.15); flashBurst(palette.chartreuse, 0.18, 0.1); freeze(0.04);
    }
  };
  const dash = () => {
    if (running) {
      vx = speedBoostTimer > 0 ? 18.5 : 14.5; lastInputDirection = 1;
      spawnParticles(x - 0.3, y - 1.2, 12, "blue", 1.5, 0.12, 0.5, -3, 3);
      shakeBurst(0.1, 0.16); flashBurst(palette.cobalt, 0.15, 0.12); freeze(0.02);
    }
  };
  const restart = (autoStart = false, advanceStage = false) => {
    if (advanceStage) {
      collectionIndex = Math.min(COLLECTIONS.length - 1, collectionIndex + 1);
    }
    const mode = stageMode();
    x = (advanceStage || !checkpointReached) ? -5 : 57;
    y = mode === "underground" ? 0.6 : -1.2;
    vx = 0; vy = 0; jumps = 0; jumpBuffer = 0; coyoteTime = 0;
    jumpBoostTimer = 0; speedBoostTimer = 0; bagAmmo = 99; shoeAmmo = 99; spinActive = false; spin = 0; lastInputDirection = 1;
    hasWings = mode === "flight" || mode === "dogfight"; flyFuel = mode === "flight" || mode === "dogfight" ? FLY_MAX_FUEL * 2.4 : 0; crouching = false; crouchInput = false;
    applyStageLayout();
    bagAnimT = 0; shoeAnimT = 0; bagCooldown = 0; shoeCooldown = 0;
    playerRoot.rotation.z = 0; playerRoot.rotation.y = 0;
    if (!advanceStage && !checkpointReached) score = 0;
    else if (!advanceStage) score = Math.floor(score / 2);
    combo = 0; lives = 3;
    gameOver = false; finished = false; running = autoStart; confettiActive = false;
    confetti.forEach(c => c.setEnabled(false));
    playerRoot.setEnabled(true);
    allies.forEach((a) => {
      if (!advanceStage) {
        a.saved = false;
        a.x = a.cage?.x ?? a.x;
        a.y = (a.cage?.y ?? a.y) - 0.3;
        a.vx = 0; a.vy = 0;
        a.root.position.set(a.x, a.y, -2.0);
        a.cage?.root.setEnabled(true);
        a.cage?.bars.forEach(b => b.setEnabled(true));
      }
    });
    partyCount = allies.filter(al => al.saved).length + 1;
    // applyStageLayout has already loaded the next stage's independent entities.
    enemies.forEach(e => { e.mesh.setEnabled(true); e.mesh.getChildMeshes().forEach((child) => { if (!child.name.startsWith("enemy-realistic-plate")) { child.setEnabled(true); child.isVisible = true; } }); e.mesh.scaling.setAll((1 + collectionIndex * 0.08) * (e.isBoss ? 1.12 : 1)); });
    checkpointReached = advanceStage ? false : checkpointReached;
    snapshot();
  };
  const restartEvent = () => restart();
  const nextStageEvent = () => restart(true, true);
  const startEvent = () => { if (!running) restart(true, false); };
  const setCrouch = (on: boolean) => { crouchInput = on; };
  const move = (direction: -1 | 1) => {
    if (!running) { running = true; gameOver = false; finished = false; snapshot(); }
    lastInputDirection = direction;
    const beginnerHorizontal = stageIndex() < 2 && stageMode() === "runway";
    vx += direction * (beginnerHorizontal ? 1.9 : 4.6);
  };
  const attack = throwBag;
  let attackHeld = false;
  let kickHeld = false;
  let jumpHeld = false;
  const selectOutfit = (event: Event) => { applyOutfit((event as CustomEvent<number>).detail); snapshot(); };
  const selectLoadout = (event: Event) => {
    const next = (event as CustomEvent<"balanced" | "arsenal" | "sky">).detail;
    if (next === "balanced" || next === "arsenal" || next === "sky") loadout = next;
    snapshot();
  };
  window.addEventListener("frw:select-outfit", selectOutfit);
  window.addEventListener("frw:select-loadout", selectLoadout);
  const attackDown = () => { attackHeld = true; throwBag(); };
  const attackUp = () => { attackHeld = false; };
  const kickDown = () => { kickHeld = true; kickShoe(); };
  const kickUp = () => { kickHeld = false; };
  window.addEventListener("frw:jump", jump); window.addEventListener("frw:attack", attack); window.addEventListener("frw:kick", kickShoe);
  window.addEventListener("frw:attack-down", attackDown); window.addEventListener("frw:attack-up", attackUp);
  window.addEventListener("frw:kick-down", kickDown); window.addEventListener("frw:kick-up", kickUp);
  window.addEventListener("frw:jump-down", () => { jumpHeld = true; jump(); });
  window.addEventListener("frw:jump-up", () => { jumpHeld = false; });
  window.addEventListener("frw:crouch-down", () => setCrouch(true));
  window.addEventListener("frw:crouch-up", () => setCrouch(false));
  window.addEventListener("frw:start", startEvent); window.addEventListener("frw:restart", restartEvent); window.addEventListener("frw:next-stage", nextStageEvent);
  window.addEventListener("frw:dash", dash);
  window.addEventListener("frw:web-attach", attachWeb);
  window.addEventListener("frw:web-release", releaseWeb);
  const laneListener = (event: Event) => move((event as CustomEvent<-1 | 1>).detail);
  window.addEventListener("frw:lane", laneListener);
  const keydown = (event: KeyboardEvent) => {
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") { if (!jumpHeld) { jumpHeld = true; jump(); } }
    if (event.code === "ArrowLeft" || event.code === "KeyA") move(-1);
    if (event.code === "ArrowRight" || event.code === "KeyD") move(1);
    if (event.code === "ShiftLeft") dash();
    if (event.code === "KeyQ") attachWeb();
    if (event.code === "KeyE") releaseWeb();
    if (event.code === "KeyX" || event.code === "KeyZ") { attackHeld = true; attack(); }
    if (event.code === "KeyC" || event.code === "KeyV" || event.code === "KeyK") { kickHeld = true; kickShoe(); }
    if (event.code === "ArrowDown" || event.code === "KeyS") setCrouch(true);
  };
  const keyup = (event: KeyboardEvent) => {
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") jumpHeld = false;
    if (event.code === "KeyX" || event.code === "KeyZ") attackHeld = false;
    if (event.code === "KeyC" || event.code === "KeyV" || event.code === "KeyK") kickHeld = false;
    if (event.code === "ArrowDown" || event.code === "KeyS") setCrouch(false);
  };
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);

  let globalT = 0;
  const update = (dt: number) => {
    globalT += dt;
    if (running) {
      if (attackHeld) throwBag();
      if (kickHeld) kickShoe();
    }
    const wasOnGround = lastLanded;
    const wasVerticalRoute = cameraY > 0.35;
    wingFlapPhase += dt * 14;
    bagCooldown = Math.max(0, bagCooldown - dt);
    shoeCooldown = Math.max(0, shoeCooldown - dt);
    bagAnimT = Math.max(0, bagAnimT - dt);
    shoeAnimT = Math.max(0, shoeAnimT - dt);

    jumpBuffer = Math.max(0, jumpBuffer - dt);
    coyoteTime = Math.max(0, coyoteTime - dt);
    jumpBoostTimer = Math.max(0, jumpBoostTimer - dt);
    speedBoostTimer = Math.max(0, speedBoostTimer - dt);
    shakeDur = Math.max(0, shakeDur - dt);
    if (shakeDur <= 0) shakeAmt = 0;
    flashDur = Math.max(0, flashDur - dt);
    if (flashDur <= 0) flashAmt = 0;

    const beginnerHorizontal = stageIndex() < 2 && stageMode() === "runway";
    const wantCrouch = crouchInput && lastLanded && Math.abs(vx) < 14;
    crouching = wantCrouch;

    // Beginner stages use responsive acceleration/deceleration instead of forced auto-run.
    // Advanced modes retain the original forward-run bias.
    vx *= Math.pow(beginnerHorizontal ? 0.08 : 0.0007, dt);
    const baseVx = beginnerHorizontal ? 0 : (crouching ? 1.4 : 2.4);
    const maxVx = beginnerHorizontal ? (speedBoostTimer > 0 ? 13.5 : 10.5) : (speedBoostTimer > 0 ? 18.5 : 15.5);
    const maxVxClamped = crouching ? Math.min(maxVx, 7.2) : maxVx;
    if (vx < baseVx && running) vx = baseVx;
    vx = Math.min(maxVxClamped, Math.max(-3.2, vx));

    const mode = stageMode();
    const flying = (mode === "flight" || mode === "dogfight") && hasWings && !lastLanded && jumpHeld && flyFuel > 0;
    if (flying) {
      flyFuel = Math.max(0, flyFuel - dt);
      vy += FLY_LIFT_ACCEL * dt;
      vy = Math.min(vy, 11.5);
      if (Math.random() < 0.72) {
        spawnParticles(x + (Math.random() - 0.5) * 0.9, y - 0.6 - Math.random() * 0.7, 1, "lilac", 0.45, 0.06, 0.35, -2, 1.2);
      }
    }

    const variableJumpGravity = beginnerHorizontal && jumpHeld && vy > 0 ? 0.68 : 1.0;
    const gravityScale = hasWings && !lastLanded && jumpHeld ? 0.18 : variableJumpGravity;
    x += vx * dt; vy -= 21.2 * gravityScale * dt; y += vy * dt;
    if (webAnchorIndex >= 0) {
      const anchor = webAnchors[webAnchorIndex];
      const dx = x - anchor.x; const dy = y - anchor.y; const distance = Math.max(0.001, Math.hypot(dx, dy));
      const nx = dx / distance; const ny = dy / distance;
      const tangentX = -ny; const tangentY = nx;
      const swingInput = (lastInputDirection || 1) * 9.5;
      vx += tangentX * swingInput * dt; vy += tangentY * swingInput * dt;
      const stretch = distance - webLength;
      if (stretch > 0) {
        x = anchor.x + nx * webLength; y = anchor.y + ny * webLength;
        const radialSpeed = vx * nx + vy * ny;
        vx -= radialSpeed * nx; vy -= radialSpeed * ny;
      }
      webPulse = Math.max(0, webPulse - dt * 2.4);
    }

    platforms.forEach(p => {
      if (p.moving && p.baseX !== undefined) {
        const nv = p.baseX + Math.sin(globalT * 0.8 + (p.phase || 0)) * 2.2;
        p.mesh.position.x = nv + p.w / 2; p.x = nv;
      }
    });

    let landed = false;
    const playerHitBoxH = crouching ? 1.65 * CROUCH_H_MULT : 1.65;
    for (const platform of platforms) {
      if (mode === "underground" && platform.mesh === safeFloor && x > 16) continue;
      const top = platform.y + platform.h / 2;
      const withinX = x + 0.45 > platform.x && x - 0.45 < platform.x + platform.w;
      const crossing = y - playerHitBoxH <= top && y - playerHitBoxH - vy * dt >= top - 0.02;
      if (withinX && crossing && vy <= 0) {
        y = top + playerHitBoxH; vy = 0; jumps = 0; coyoteTime = 0.11; landed = true;
      }
    }

    if (landed) {
      if (hasWings) flyFuel = FLY_MAX_FUEL;
    }

    if (landed && !wasOnGround && !lastLanded) {
      spawnParticles(x, y - playerHitBoxH, 14 + collectionIndex * 5, "dust", 1.6 + collectionIndex * 0.2, 0.11, 0.6, -5, 2.8);
      const impactRing = MeshBuilder.CreateTorus(`landing-impact-${globalT}`, { diameter: 1.3 + collectionIndex * 0.12, thickness: 0.06, tessellation: 24 }, scene);
      impactRing.position.set(x, y - playerHitBoxH + 0.04, -0.72); impactRing.rotation.x = Math.PI / 2; impactRing.material = mats.gold;
      window.setTimeout(() => impactRing.dispose(), 280);
      shakeBurst(0.12 + collectionIndex * 0.025, 0.18 + collectionIndex * 0.03); flashBurst(palette.gold, 0.12, 0.08); freeze(0.025);
    }
    lastLanded = landed;

    const failDepth = mode === "underground" ? -58 : -8;
    if (!landed && y < failDepth) {
      if (!demoMode) { lives = Math.max(0, lives - 1); }
      combo = 0;
      x = checkpointReached ? 57 : -5; y = mode === "underground" ? 0.6 : -1.2; vy = 0; jumps = 0; spinActive = false; spin = 0; cameraY = 0; cameraTargetY = 0;
      spawnParticles(x, y - 1.4, 18, "blood", 2, 0.13, 0.8, -6, 4);
      shakeBurst(0.25, 0.35); flashBurst(palette.red, 0.45, 0.3); freeze(0.08);
      if (!demoMode && lives <= 0) { gameOver = true; running = false; }
    }
    if (x > 57 && !checkpointReached) {
      checkpointReached = true; score += 500;
      popup(500, 57, 0.5, "checkpoint");
      spawnParticles(57, -0.5, 22, "spark", 2.2, 0.12, 1.1, -4, 4.5);
      shakeBurst(0.15, 0.2); flashBurst(palette.chartreuse, 0.35, 0.25); freeze(0.07);
    }
    if (x >= 249.2 && !finished) {
      finished = true; running = false; score += 2500 + (partyCount - 1) * 1000;
      popup(2500 + (partyCount - 1) * 1000, 250, 1, "combo");
      confettiActive = true;
      confetti.forEach(c => { c.setEnabled(true); c.position.y = 3 + Math.random() * 7; });
      spawnParticles(250, 1, 48, "spark", 3.2, 0.18, 2.2, -2, 5.2);
            shakeBurst(0.35, 0.9); flashBurst(palette.gold, 0.6, 0.65); freeze(0.14);
      // Keep the clear result visible. The player explicitly chooses NEXT SECTION or NEXT STAGE.
      if (autoAdvanceTimer !== undefined) { window.clearTimeout(autoAdvanceTimer); autoAdvanceTimer = undefined; }
    }
    if (landed) {
      coyoteTime = 0.11; spinActive = false;
      if (jumpBuffer > 0 && !crouching) {
        jumpBuffer = 0; vy = jumpBoostTimer > 0 ? 12.8 : 10.8; jumps = 1;
        spinActive = false; landed = false; lastLanded = false;
        spawnParticles(x, y - playerHitBoxH, 10, "dust", 1.3, 0.1, 0.55, -4, 2.2);
        shakeBurst(0.05, 0.12);
      }
    }

    runCycle += dt * (3 + Math.abs(vx) * 0.25) * (crouching ? 1.5 : 1);
    const legSwingBase = (crouching ? 0.25 : 0.55) * Math.sin(runCycle) * Math.min(1, Math.abs(vx) / 4);
    const armSwingBase = (crouching ? 0.2 : 0.45) * Math.sin(runCycle + Math.PI) * Math.min(1, Math.abs(vx) / 4);
    const bob = Math.abs(Math.sin(runCycle * 2)) * (crouching ? 0.03 : 0.06) * Math.min(1, Math.abs(vx) / 4);
    const crouchBase = crouching ? 1 - (1 - CROUCH_H_MULT) * 0.9 : 1;

    let legLRotX = legSwingBase;
    let legRRotX = -legSwingBase;
    let armLRotZ = -0.12 + armSwingBase;
    let armRRotZ = 0.12 - armSwingBase;
    let armLSwing = 0, armRSwing = 0;

    if (bagAnimT > 0) {
      const t = 1 - bagAnimT / BAG_ANIM_DUR;
      const swing = Math.sin(t * Math.PI) * 1.6;
      armRRotZ = 0.12 - swing;
      armRSwing = swing;
    }
    if (shoeAnimT > 0) {
      const t = 1 - shoeAnimT / SHOE_ANIM_DUR;
      const kick = Math.sin(t * Math.PI) * 1.9;
      legRRotX = -legSwingBase + kick;
    }

    if (landed) {
      legL.rotation.x = legLRotX; legR.rotation.x = legRRotX;
      armL.rotation.z = armLRotZ; armR.rotation.z = armRRotZ;
      body.scaling.y = crouchBase;
      body.position.y = bob - (crouching ? 0.35 : 0);
      head.position.y = (crouching ? 0.55 : 0.93) + bob * 0.7;
      hair.position.y = (crouching ? 0.88 : 1.26) + bob * 0.7;
      glasses.position.y = (crouching ? 0.62 : 1.0) + bob * 0.7;
      legL.position.y = crouching ? -1.75 : -1.45;
      legR.position.y = crouching ? -1.75 : -1.45;
      legL.scaling.y = crouching ? 0.68 : 1;
      legR.scaling.y = crouching ? 0.68 : 1;
      const playerStageScale = 0.88 + collectionIndex * 0.07;
      playerRoot.scaling.setAll(playerStageScale + bob * 0.15);
    } else {
      const airCrouch = crouchInput;
      const crouchScale = airCrouch ? 0.82 : 1;
      legL.rotation.x = airCrouch ? 0.9 : bagAnimT > 0 ? legLRotX : -0.3;
      legR.rotation.x = airCrouch ? 0.9 : shoeAnimT > 0 ? legRRotX : 0.3;
      armL.rotation.z = bagAnimT > 0 ? armLRotZ : -0.55;
      armR.rotation.z = bagAnimT > 0 ? armRRotZ : 0.55;
      body.scaling.y = crouchScale;
      head.position.y = (airCrouch ? 0.75 : 0.93);
      hair.position.y = (airCrouch ? 1.08 : 1.26);
      glasses.position.y = (airCrouch ? 0.82 : 1.0);
      legL.scaling.y = crouchScale;
      legR.scaling.y = crouchScale;
      playerRoot.scaling.setAll(0.88 + collectionIndex * 0.07);
    }

    wingFeathers.forEach((feather, index) => {
      feather.isVisible = hasWings;
      if (hasWings) {
        const side = index < 4 ? -1 : 1;
        const featherIndex = index % 4;
        feather.rotation.z = side * (0.35 + featherIndex * 0.12 + Math.sin(wingFlapPhase + featherIndex * 0.4) * (flying ? 0.22 : 0.07));
        feather.position.y = 0.38 - featherIndex * 0.06 + Math.sin(wingFlapPhase * 0.5 + featherIndex) * (flying ? 0.08 : 0.025);
      }
    });
    wingGlow.isVisible = hasWings;
    angelWingSprite.plate.isVisible = hasWings;
    if (hasWings) {
      const flap = Math.sin(wingFlapPhase) * (flying ? 0.85 : 0.25);
      wingGlow.rotation.z = flap * 0.16;
      wingGlow.scaling.setAll(1 + (flying ? 0.08 : 0));
      angelWingSprite.plate.rotation.z = flap * 0.08;
      angelWingSprite.plate.scaling.setAll(0.72 + (flying ? 0.04 : 0));
      (armL as Mesh).scaling = new Vector3(1, 1 + (flying ? 0.22 : 0) + flap * 0.15, 1 + Math.abs(flap) * 0.1);
      (armR as Mesh).scaling = new Vector3(1, 1 + (flying ? 0.22 : 0) + flap * 0.15, 1 + Math.abs(flap) * 0.1);
      const lift = flying ? 0.08 : 0;
      hair.position.y += lift; head.position.y += lift; glasses.position.y += lift;
    }

    playerRoot.position.x = x; playerRoot.position.y = y;
    const targetLean = webAnchorIndex >= 0 ? Math.max(-0.34, Math.min(0.34, vx * 0.018)) : Math.max(-0.22, Math.min(0.22, vx * 0.011));
    renderLean += (targetLean - renderLean) * Math.min(1, dt * 14);
    const targetBob = lastLanded ? Math.sin(runCycle * 0.5) * 0.035 : Math.sin(globalT * 7) * 0.018;
    renderBob += (targetBob - renderBob) * Math.min(1, dt * 16);
    const landingPulse = lastLanded ? Math.max(0, 1 - Math.min(1, dt * 18)) : 0;
    playerRoot.rotation.z += renderLean;
    playerRoot.position.y += renderBob - landingPulse * 0.045;
    playerRoot.scaling.x = (0.88 + collectionIndex * 0.07) * (1 + landingPulse * 0.08);
    playerRoot.scaling.y = (0.88 + collectionIndex * 0.07) * (1 - landingPulse * 0.1);
    if (!landed && spinActive) {
      const turnDirection = Math.sign(vx || lastInputDirection || 1);
      spin += dt * turnDirection * (vy > 0 ? 10.2 : 7.8);
      playerRoot.rotation.z = spin;
    } else if (landed) { spin = 0; playerRoot.rotation.z = 0; }
        playerRoot.rotation.y = vx > 8 ? -0.08 : 0.02;
    // Keep the high-density hero plate physically readable: shoulder-led sway, landing compression, and flight lean.
    const heroMotion = Math.sin(runCycle * 0.5) * 0.018 + Math.max(-0.08, Math.min(0.08, -vx * 0.004)) + (flying ? -0.055 : 0);
    const heroPose: keyof typeof heroPoseTextures = flying
      ? "fly"
      : (bagAnimT > 0 || shoeAnimT > 0)
        ? "attack"
        : !landed && Math.abs(vy) > 0.24
          ? "jump"
          : Math.abs(vx) > 0.7
            ? "run"
            : "idle";
    // Alternate the two running drawings so the feet visibly trade places.
    // runCycle is continuous, so this stays in phase with the movement speed.
    const heroTextureKey: keyof typeof heroPoseTextures = heroPose === "run"
      ? (Math.floor(runCycle * 1.55) % 2 === 0 ? "run" : "runAlt")
      : heroPose;
    if (heroTextureKey !== activeHeroTexture) {
      activeHeroTexture = heroTextureKey;
      modelSpriteMat.diffuseTexture = heroPoseTextures[heroTextureKey];
    }
    const requestedGLBAnimation = flying ? "Fly" : (bagAnimT > 0 || shoeAnimT > 0) ? "Attack" : heroPose === "jump" ? "Run" : heroPose === "run" ? "Run" : "Idle";
    setGLBAnimation(requestedGLBAnimation);
    if (glbRoot) {
      glbRoot.rotation.z = heroMotion * 0.72;
      glbRoot.rotation.y = vx > 8 ? -0.08 : 0.02;
      glbRoot.position.y = -1.65 + bob * 0.22 + (flying ? 0.08 : 0);
    }
    modelSprite.rotation.z = heroMotion + (bagAnimT > 0 ? -0.08 : 0) + (shoeAnimT > 0 ? 0.045 : 0);
    modelSprite.position.y = -0.2 + bob * 0.55 + (flying ? 0.06 : 0);
    modelSprite.scaling.x = 1.16 + Math.sin(runCycle) * 0.012;
    modelSprite.scaling.y = 1.16 + (flying ? 0.035 : 0) - (crouching ? 0.18 : 0);
    const camLead = Math.min(6, vx * 0.35);
    cameraTargetX = x - 1.2 + camLead;
    cameraX += (cameraTargetX - cameraX) * Math.min(1, dt * 4.5);
    const verticalRoute = mode === "vertical" || ((mode === "flight" || mode === "dogfight") && hasWings);
    const undergroundRoute = mode === "underground" && x > 16;
    cameraTargetY = verticalRoute ? Math.max(0, Math.min(8.5, y - 1.0)) : undergroundRoute ? Math.min(0, Math.max(-50, y + 1.0)) : 0;
    cameraY += (cameraTargetY - cameraY) * Math.min(1, dt * 3.8);
    shakeX = (Math.random() - 0.5) * shakeAmt * 2;
    shakeY = (Math.random() - 0.5) * shakeAmt * 2;
    camera.position.x = cameraX + shakeX;
    camera.position.y = cameraY + shakeY;
    verticalBeacon.rotation.z += dt * 1.8;
    verticalBeaconGlow.scaling.setAll(1 + Math.sin(globalT * 4) * 0.12);
    verticalBeacon.setEnabled(mode === "vertical"); verticalBeaconGlow.setEnabled(mode === "vertical");
    webAnchors.forEach((anchor, index) => {
      const enabled = !finished && mode !== "race" && mode !== "dogfight";
      anchor.mesh.setEnabled(enabled);
      anchor.mesh.scaling.setAll(1 + Math.sin(globalT * 5 + index) * 0.13 + webPulse * 0.4);
      anchor.mesh.position.z = -0.35;
    });
    refreshWebLine();
    if (verticalRoute && !wasVerticalRoute) {
      popup(800, x, y + 1.4, "wings");
      spawnParticles(x, y, 18, "spark", 2.2, 0.1, 0.8, -2, 4);
      flashBurst(palette.sky1, 0.22, 0.18);
    }

    bgTexture.uOffset = (x / 180) % 1;
    hazeLayer.position.x = cameraX * 0.05;
    hazeLayer.position.y = Math.sin(globalT * 0.2) * 0.12;

    for (let cIdx = 0; cIdx < 12; cIdx++) {
      const cloud = scene.getMeshByName(`cloud-${cIdx}`);
      if (cloud) {
        cloud.position.x += dt * (0.15 + (cIdx % 3) * 0.05);
        if (cloud.position.x > cameraX + 160) cloud.position.x = cameraX - 150 - Math.random() * 40;
        if (cloud.position.x < cameraX - 160) cloud.position.x = cameraX + 150 + Math.random() * 40;
        cloud.position.y = 3 + (cIdx % 2) * 0.9 + Math.sin(globalT * 0.15 + cIdx) * 0.15;
      }
    }

    parFoliage.forEach((t, i) => {
      const depthLayer = Math.floor(i / 14);
      t.position.x = (t.position.x % 300) - 0;
      const px = t.position.x - cameraX * (0.3 + depthLayer * 0.2);
      const wrappedPx = ((px % 300) + 450) % 300 - 150;
      t.position.x = wrappedPx + cameraX * (0.3 + depthLayer * 0.2);
    });

    const city = cityForX(x) as City;
    const skyHex = skyForCity(city);
    const sCol = Color3.FromHexString(skyHex);
    bgMat.diffuseColor = sCol; bgMat.emissiveColor = sCol;
    skyMat.diffuseColor = sCol; skyMat.emissiveColor = sCol;
    const sceneCol = sCol.scale(0.5);
    scene.clearColor = new Color4(sceneCol.r, sceneCol.g, sceneCol.b, 1);
    if (city === "NEW YORK" || city === "PARIS") farBackStrip.material = mats.paper;
    else if (city === "MILANO") farBackStrip.material = mats.chartreuse;
    else farBackStrip.material = mats.red;
    if (city === "TOKYO") {
      hazeMat.diffuseColor = new Color3(1 + Math.sin(globalT * 2) * 0.05, 0.75 + Math.sin(globalT * 3) * 0.05, 1);
    } else if (city === "MILANO") {
      hazeMat.diffuseColor = new Color3(1 + Math.sin(globalT * 1.2) * 0.03, 0.85 + Math.sin(globalT * 1.5) * 0.02, 0.65);
    } else if (city === "PARIS") {
      hazeMat.diffuseColor = new Color3(1, 1, 1);
    } else {
      hazeMat.diffuseColor = new Color3(1, 1, 1);
    }

    for (const a of allies) {
      if (!a.saved && a.cage) {
        const dx = x - a.cage.x;
        const dy = y - a.cage.y;
        const rescueKeys = Math.floor(coins.filter((coin) => coin.taken).length / 5);
        const requiredKeys = allies.filter((ally) => ally.saved).length + 1;
        if (Math.abs(dx) < 2.8 && Math.abs(dy) < 3.5 && rescueKeys >= requiredKeys) {
          a.saved = true;
          a.cage.root.setEnabled(false);
          a.cage.bars.forEach(b => b.setEnabled(false));
          a.root.position.z = -2.2;
          a.x = x + a.offset;
          a.y = Math.max(y, -1.2);
          a.root.position.x = a.x;
          a.root.position.y = a.y;
          partyCount = allies.filter(al => al.saved).length + 1;
          score += 1500; combo += 1;
          popup(1500, a.cage.x, a.cage.y + 1.5, "rescue");
          spawnParticles(a.cage.x, a.cage.y, 32, "lilac", 2.4, 0.14, 1.2, -4, 4.5);
          spawnParticles(a.cage.x, a.cage.y, 22, "spark", 2.2, 0.12, 1.0, -3, 4);
          shakeBurst(0.22, 0.35); flashBurst(palette.lilac, 0.42, 0.32); freeze(0.08);
        }
      }

      if (a.saved) {
        a.phase += dt * 2.5;
        const target = x + a.offset + Math.sin(a.phase) * 0.25;
        a.targetX = target;
        const diff = a.targetX - a.x;
        a.vx = diff * 5.5;
        a.x += a.vx * dt;

        let aLanded = false;
        a.vy -= 21.2 * dt;
        a.y += a.vy * dt;
        for (const p of platforms) {
          const top = p.y + p.h / 2;
          const withinX = a.x + 0.4 > p.x && a.x - 0.4 < p.x + p.w;
          const cross = a.y - 1.55 <= top && a.y - 1.55 - a.vy * dt >= top - 0.02;
          if (withinX && cross && a.vy <= 0) {
            a.y = top + 1.55; a.vy = 0; aLanded = true;
          }
        }
                if (a.y < -8) { a.y = -1.2; a.vy = 0; aLanded = true; }
        const allyJumpWave = Math.sin(a.phase * 1.7 + a.offset * 2.4);
        if (aLanded && allyJumpWave > 0.985 && a.vy === 0) a.vy = 8.2;
        a.root.position.x = a.x; a.root.position.y = a.y;
        if (a.spriteMaterial && a.spriteTextures) {
          const moving = Math.abs(a.vx) > 0.35;
          a.spriteMaterial.diffuseTexture = moving ? (a.spriteTextures.run ?? a.spriteTextures.idle) : a.spriteTextures.idle;
        }
        const bobA = Math.abs(Math.sin(a.phase * 1.2)) * 0.05 * Math.min(1, Math.abs(a.vx) / 3);
        a.body.scaling.y = 1;
        a.body.position.y = bobA;
        a.head.position.y = 0.92 + bobA * 0.7;
        a.hair.position.y = 1.24 + bobA * 0.7;
        const lSwing = Math.sin(a.phase) * 0.42 * Math.min(1, Math.abs(a.vx) / 3);
        const allyChildren = a.root.getChildren();
        const leftLeg = allyChildren[4] as Mesh | undefined;
        const rightLeg = allyChildren[5] as Mesh | undefined;
        const leftArm = allyChildren[10] as Mesh | undefined;
        const rightArm = allyChildren[11] as Mesh | undefined;
        if (leftLeg) leftLeg.rotation.x = lSwing;
        if (rightLeg) rightLeg.rotation.x = -lSwing;
        const aSwing = Math.sin(a.phase + Math.PI) * 0.32 * Math.min(1, Math.abs(a.vx) / 3);
        if (leftArm) leftArm.rotation.z = -0.12 + aSwing;
        if (rightArm) rightArm.rotation.z = 0.12 - aSwing;

        a.lastShot -= dt;
        if (a.lastShot <= 0) {
          let nearestEnemy: Enemy | null = null;
          let nearestDist = 18;
          for (const e of enemies) {
            if (!e.mesh.isEnabled() || e.dead) continue;
            const d = Math.abs(e.x - a.x);
            if (d < nearestDist && e.x > a.x - 1 && e.x < a.x + 16) { nearestDist = d; nearestEnemy = e; }
          }
          if (nearestEnemy) {
            a.lastShot = 1.2 + Math.random() * 0.6;
            const dir = nearestEnemy.x > a.x ? 1 : -1;
            const kind: "bag" | "shoe" = Math.random() < 0.5 ? "bag" : "shoe";
            const mesh = makeBox(`ally-proj-${a.name}-${projectiles.length}`, kind === "bag" ? 0.45 : 0.7, kind === "bag" ? 0.35 : 0.18, 0.28, kind === "bag" ? mats.red : mats.chartreuse, a.x + dir * 0.9, a.y + 0.1, -0.8);
            const speed = kind === "bag" ? 14.5 : 18.5;
            projectiles.push({ mesh, x: a.x + dir * 0.9, y: a.y + 0.1, vx: dir * speed, vy: 3, active: true, kind, gravity: 15, owner: "ally" });
            const shootingArm = a.root.getChildren()[11] as Mesh | undefined;
            if (shootingArm) shootingArm.rotation.z = 0.12 - 1.3;
            spawnParticles(a.x + dir * 0.7, a.y, 5, kind === "bag" ? "blood" : "chart", 0.9, 0.06, 0.3, -3, 1.8);
          }
        }
      }
    }

    for (const item of powerItems) {
      if (item.taken) continue;
      if (item.kind !== "wings") {
        item.mesh.rotation.y += dt * 3;
        item.mesh.position.y = item.baseY + Math.sin(globalT * 2.5 + item.phase) * 0.12;
      } else {
        item.mesh.rotation.y = Math.sin(globalT * 1.2 + item.phase) * 0.15;
        (item.mesh as unknown as TransformNode).getChildMeshes().forEach((child, i) => {
          if (child.name.startsWith("wing-L-")) child.rotation.z = -0.35 + Math.sin(globalT * 4 + item.phase) * 0.35;
          if (child.name.startsWith("wing-R-")) child.rotation.z = 0.35 - Math.sin(globalT * 4 + item.phase) * 0.35;
          if (child.name.startsWith("wing-gem-")) child.position.y = item.baseY + Math.sin(globalT * 2.5 + item.phase) * 0.12;
        });
        (item.mesh as unknown as TransformNode).position.y = item.baseY + Math.sin(globalT * 2.5 + item.phase) * 0.12;
        (item.mesh as unknown as TransformNode).position.x = item.x;
      }
      if (Math.abs(item.x - x) < 1.2 && Math.abs(item.y - (y + 0.25)) < 1.5) {
        item.taken = true; item.mesh.setEnabled(false);
        if (item.kind === "bag") {
          bagAmmo = loadout === "arsenal" ? 180 : 99; jumpBoostTimer = loadout === "sky" ? 11 : 8; score += loadout === "arsenal" ? 520 : 350; popup(loadout === "arsenal" ? 520 : 350, item.x, item.y + 0.5, "power");
          spawnParticles(item.x, item.y, 20, "blood", 2, 0.11, 0.9, -4, 4);
        } else if (item.kind === "shoe") {
          shoeAmmo = loadout === "arsenal" ? 180 : 99; speedBoostTimer = loadout === "arsenal" ? 12 : 8; jumpBoostTimer = Math.max(jumpBoostTimer, loadout === "sky" ? 8 : 4); score += loadout === "arsenal" ? 520 : 350; popup(loadout === "arsenal" ? 520 : 350, item.x, item.y + 0.5, "power");
          spawnParticles(item.x, item.y, 20, "chart", 2, 0.11, 0.9, -4, 4);
        } else {
          hasWings = true; flyFuel = loadout === "sky" ? FLY_MAX_FUEL * 1.6 : FLY_MAX_FUEL; score += loadout === "sky" ? 800 : 500; popup(loadout === "sky" ? 800 : 500, item.x, item.y + 0.6, "wings");
          spawnParticles(item.x, item.y, 28, "spark", 2.6, 0.14, 1.1, -3, 5);
          shakeBurst(0.18, 0.24); flashBurst(palette.cobalt, 0.38, 0.28); freeze(0.07);
        }
        if (item.kind !== "wings") {
          shakeBurst(0.12, 0.18); flashBurst(palette.gold, 0.3, 0.18); freeze(0.04);
        }
      }
    }

    for (const p of projectiles) {
      if (!p.active) continue;
      if (p.targetX !== undefined && p.targetY !== undefined) {
        const target = enemies.find((enemy) => !enemy.dead && enemy.mesh.isEnabled() && Math.abs(enemy.x - p.targetX!) < 4) ?? undefined;
        if (target) { p.targetX = target.x; p.targetY = target.y + target.h / 2; }
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const distance = Math.max(0.001, Math.hypot(dx, dy));
        const speed = p.kind === "bag" ? 17.5 : 21.5;
        p.vx += (dx / distance * speed - p.vx) * Math.min(1, dt * 8);
        p.vy += (dy / distance * speed - p.vy) * Math.min(1, dt * 8);
      } else if (p.gravity) p.vy -= p.gravity * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.mesh.position.x = p.x; p.mesh.position.y = p.y;
      p.mesh.rotation.z += dt * (p.kind === "bag" ? 14 : 18);
      if (Math.random() < 0.72) {
        spawnParticles(p.x, p.y, 1, p.kind === "bag" ? "blood" : "chart", 0.28 + collectionIndex * 0.04, 0.045, 0.18, 0, 0.8);
      }
      p.mesh.rotation.y += dt * 9;
      if (p.x > x + 30 || p.x < x - 30 || p.y < -8) { p.active = false; p.mesh.setEnabled(false); continue; }
      for (const enemy of enemies) {
        if (enemy.dead || !enemy.mesh.isEnabled()) continue;
        if (Math.abs(p.x - enemy.x) < (enemy.w + 0.8) / 2 && Math.abs(p.y - (enemy.y + enemy.h / 2)) < (enemy.h + 0.8) / 2) {
          const damage = p.owner === "ally" ? 2 : 1;
          enemy.hp = Math.max(0, (enemy.hp ?? 1) - damage);
          p.active = false; p.mesh.setEnabled(false);
          const bossHit = Boolean(enemy.isBoss);
          const bonus = bossHit ? 180 : p.owner === "ally" ? 450 : 600;
          score += bonus; combo += 1;
          popup(bonus, enemy.x, enemy.y + 0.5, bossHit ? "checkpoint" : "enemy");
          if (combo > 0 && combo % 5 === 0) popup(combo * 10, x + 2, y + 1.5, "combo");
          const col = enemy.kind === "crow" ? "dust" : enemy.kind === "bat" ? "lilac" : "spark";
          spawnParticles(enemy.x, enemy.y + enemy.h / 2, bossHit ? 30 : 20, col, 2.2, 0.13, 0.95, -5, 4.5);
          spawnParticles(enemy.x, enemy.y + enemy.h / 2, bossHit ? 18 : 12, "spark", 1.8, 0.1, 0.7, -4, 3.5);
          if (enemy.hp <= 0) {
            enemy.dead = true; enemy.mesh.setEnabled(false); score += bossHit ? 5000 : 0;
            popup(bossHit ? 5000 : bonus, enemy.x, enemy.y + 1.4, bossHit ? "checkpoint" : "enemy");
            if (bossHit) {
              for (let burst = 0; burst < 3; burst++) spawnParticles(enemy.x, enemy.y + 0.7, 24, burst === 1 ? "gold" : "spark", 2.8, 0.16, 1.2, -5, 5.5);
              flashBurst(palette.gold, 0.8, 0.8); shakeBurst(0.5, 1.0); freeze(0.18);
            }
          }
          shakeBurst(bossHit ? 0.35 : 0.2, bossHit ? 0.42 : 0.24); flashBurst(bossHit ? palette.gold : enemy.kind === "bat" ? palette.lilac : palette.red, bossHit ? 0.5 : 0.32, bossHit ? 0.34 : 0.22); freeze(bossHit ? 0.1 : 0.06);
          break;
        }
      }
    }

        const difficulty = 1 + collectionIndex * 0.22;
    for (const obstacle of obstacles) {
      const pulse = Math.sin(globalT * (1.4 + difficulty * 0.25) + obstacle.phase);
      obstacle.active = obstacle.kind === "laser" ? pulse > -0.15 : obstacle.kind === "blade" ? pulse > -0.55 : pulse > 0.15;
      obstacle.mesh.setEnabled(obstacle.active && x > obstacle.x - 18 && x < obstacle.x + 18);
      if (obstacle.kind === "blade") obstacle.mesh.rotation.z = globalT * (2.2 + difficulty) + obstacle.phase;
      if (obstacle.kind === "gate") obstacle.mesh.scaling.y = 0.82 + (pulse + 1) * 0.18;
      const playerColH = crouching ? playerHitBoxH : 1.8;
      if (obstacle.active && invulnerable <= 0 && Math.abs(obstacle.x - x) < (obstacle.w + 0.8) / 2 && Math.abs(obstacle.y - (y - playerColH / 2)) < (obstacle.h + playerColH) / 2) {
        if (!demoMode) lives = Math.max(0, lives - 1);
        combo = 0; invulnerable = 1.25; x -= 1.5; vx = -4.2; vy = 5.5;
        popup(0, obstacle.x, obstacle.y, "checkpoint"); spawnParticles(x, y - 0.5, 16, "blood", 2, 0.12, 0.8, -6, 4);
        shakeBurst(0.24, 0.3); flashBurst(palette.red, 0.42, 0.28); freeze(0.07);
        if (!demoMode && lives <= 0) { gameOver = true; running = false; }
      }
    }
    bossShotCooldown -= dt;
    const activeBoss = enemies.find((enemy) => enemy.isBoss && !enemy.dead && enemy.mesh.isEnabled());
    if (activeBoss) {
      const bossRatio = (activeBoss.hp ?? 0) / Math.max(1, activeBoss.maxHp ?? 1);
      const bossPhase = bossRatio <= 0.33 ? 3 : bossRatio <= 0.66 ? 2 : 1;
      const collapseLevel = bossPhase >= 3 ? 2 : bossPhase >= 2 ? 1 : 0;
      if (collapseLevel > bossCollapseLevel) {
        bossCollapseLevel = collapseLevel;
        const collapseStart = activeBoss.x - (collapseLevel === 2 ? 52 : 30);
        platforms.forEach((platform, index) => {
          if (index === 0 || platform.x < collapseStart || platform.x > activeBoss.x + 4) return;
          platform.mesh.setEnabled(false);
          spawnParticles(platform.x + platform.w / 2, platform.y, 18, "stone", 1.8, 0.1, 0.8, 0, 3.5);
        });
        shakeBurst(collapseLevel === 2 ? 0.34 : 0.2, 0.42);
        flashBurst(collapseLevel === 2 ? palette.red : palette.gold, 0.24, 0.18);
      }
      activeBoss.x = (activeBoss.baseX ?? activeBoss.x) + Math.sin(globalT * (0.55 + bossPhase * 0.18)) * (1.2 + bossPhase * 0.65);
      activeBoss.y = (activeBoss.baseY ?? activeBoss.y) + Math.sin(globalT * (1.1 + bossPhase * 0.4)) * (0.35 + bossPhase * 0.18);
      activeBoss.mesh.scaling.setAll((1 + collectionIndex * 0.08) * (1.12 + bossPhase * 0.06));
      if (activeBoss.spriteMaterial && activeBoss.spriteTextures) {
        activeBoss.spriteMaterial.diffuseTexture = bossPhase === 3 ? (activeBoss.spriteTextures.hit ?? activeBoss.spriteTextures.idle) : bossPhase === 2 ? (activeBoss.spriteTextures.attack ?? activeBoss.spriteTextures.idle) : activeBoss.spriteTextures.idle;
      }
      if (bossPhase >= 2 && Math.random() < dt * (0.35 + bossPhase * 0.18)) spawnParticles(activeBoss.x, activeBoss.y + 1.2, 4, bossPhase === 3 ? "red" : "gold", 1.2, 0.08, 0.35, -2, 2.2);
    }
    if (activeBoss && x > activeBoss.x - 20 && bossShotCooldown <= 0) {
      const bossRatio = (activeBoss.hp ?? 0) / Math.max(1, activeBoss.maxHp ?? 1);
      const bossPhase = bossRatio <= 0.33 ? 3 : bossRatio <= 0.66 ? 2 : 1;
      bossShotCooldown = Math.max(0.55, 2.1 - collectionIndex * 0.25 - bossPhase * 0.22);
      const orb = MeshBuilder.CreateSphere(`boss-orb-${globalT}`, { diameter: 0.34, segments: 12 }, scene);
      orb.material = mats.red; orb.position.set(activeBoss.x - 1.2, activeBoss.y + 1.2, -1.2);
      bossOrbs.push({ mesh: orb, x: activeBoss.x - 1.2, y: activeBoss.y + 1.2, vx: -5.5 - collectionIndex * 0.8 - bossPhase * 0.65, vy: (y - activeBoss.y) * 0.25, life: 5.5 });
      if (bossPhase >= 2) {
        const sideOrb = MeshBuilder.CreateSphere(`boss-side-orb-${globalT}`, { diameter: 0.28, segments: 10 }, scene);
        sideOrb.material = bossPhase === 3 ? mats.red : mats.lilac;
        sideOrb.position.set(activeBoss.x - 1.5, activeBoss.y + 2.0, -1.2);
        bossOrbs.push({ mesh: sideOrb, x: activeBoss.x - 1.5, y: activeBoss.y + 2.0, vx: -4.3 - bossPhase, vy: -1.5, life: 4.5 });
      }
    }
    for (let i = bossOrbs.length - 1; i >= 0; i--) {
      const orb = bossOrbs[i]; orb.life -= dt; orb.x += orb.vx * dt; orb.y += orb.vy * dt; orb.mesh.position.set(orb.x, orb.y, -1.2); orb.mesh.rotation.z += dt * 8;
      if (orb.life <= 0 || orb.x < x - 24) { orb.mesh.dispose(); bossOrbs.splice(i, 1); continue; }
      if (invulnerable <= 0 && Math.abs(orb.x - x) < 0.8 && Math.abs(orb.y - y) < 1.2) {
        if (!demoMode) lives = Math.max(0, lives - 1); combo = 0; invulnerable = 1.1; x -= 1.2; vy = 5;
        orb.mesh.dispose(); bossOrbs.splice(i, 1); shakeBurst(0.2, 0.3); flashBurst(palette.red, 0.45, 0.25);
        if (!demoMode && lives <= 0) { gameOver = true; running = false; }
      }
    }
    landmarks.forEach(l => { l.mesh.setEnabled(x > l.cityStart - 40 && x < l.cityEnd + 30); });
    const enemySpeedScale = 1 + collectionIndex * 0.14;
    const enemyVisualScale = 1 + collectionIndex * 0.08;
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      enemy.x += enemy.vx * dt * enemySpeedScale;
      enemy.mesh.scaling.setAll(enemyVisualScale * (enemy.isBoss ? 1.12 : 1));
      if (enemy.kind === "crow") {
        enemy.y = (enemy.baseY || 0) + Math.sin(globalT * 3 + (enemy.phase || 0)) * 0.55;
        const wL = (enemy.mesh as unknown as TransformNode).getChildren().find(c => c.name?.includes("wing-l")) as Mesh;
        const wR = (enemy.mesh as unknown as TransformNode).getChildren().find(c => c.name?.includes("wing-r")) as Mesh;
        if (wL) wL.rotation.z = 0.35 + Math.sin(globalT * 14 + (enemy.phase || 0)) * 0.7;
        if (wR) wR.rotation.z = -0.35 - Math.sin(globalT * 14 + (enemy.phase || 0)) * 0.7;
      } else if (enemy.kind === "bat") {
        enemy.y = (enemy.baseY || 0) + Math.sin(globalT * 4.2 + (enemy.phase || 0)) * 0.65 + Math.cos(globalT * 2 + (enemy.phase || 0)) * 0.25;
        const wL = (enemy.mesh as unknown as TransformNode).getChildren().find(c => c.name?.includes("wing-l")) as Mesh;
        const wR = (enemy.mesh as unknown as TransformNode).getChildren().find(c => c.name?.includes("wing-r")) as Mesh;
        if (wL) wL.rotation.z = 0.5 + Math.sin(globalT * 18 + (enemy.phase || 0)) * 0.85;
        if (wR) wR.rotation.z = -0.5 - Math.sin(globalT * 18 + (enemy.phase || 0)) * 0.85;
      } else if (enemy.kind === "hedgehog") {
        const body = (enemy.mesh as unknown as TransformNode).getChildren()[0] as Mesh;
        if (body) body.rotation.z = Math.sin(globalT * 5 + (enemy.phase || 0)) * 0.08;
      }
      if (enemy.x < (enemy.baseX || 0) - 4 || enemy.x > (enemy.baseX || 0) + 4) enemy.vx *= -1;
      enemy.mesh.position.x = enemy.x; enemy.mesh.position.y = enemy.y;
      if (enemy.spriteMaterial && enemy.spriteTextures) {
        const attacking = enemy.kind === "drone" && Math.sin(globalT * 3.1 + (enemy.phase ?? 0)) > 0.72;
        enemy.spriteMaterial.diffuseTexture = attacking ? (enemy.spriteTextures.attack ?? enemy.spriteTextures.idle) : enemy.spriteTextures.idle;
      }
      const dir = enemy.vx > 0 ? 1 : -1;
      (enemy.mesh as unknown as TransformNode).rotation.y = dir * 0.08;
      const playerColH = crouching ? playerHitBoxH : 1.8;
      const playerCenterY = y - playerColH / 2;
      const enemyCenterY = enemy.y + enemy.h / 2;
      if (invulnerable <= 0 && Math.abs(enemy.x - x) < (enemy.w + 0.72) / 2 && Math.abs(enemyCenterY - playerCenterY) < (enemy.h + playerColH) / 2) {
        if (vy < -2.2 && y > enemy.y + enemy.h * 0.4) {
          vy = 8.6; score += 250; combo += 1;
          popup(250, enemy.x, enemy.y + 0.5, "enemy");
          if (combo > 0 && combo % 5 === 0) popup(combo * 10, x + 2, y + 1.5, "combo");
          enemy.dead = true; enemy.mesh.setEnabled(false);
          const col = enemy.kind === "crow" ? "dust" : enemy.kind === "bat" ? "lilac" : "spark";
          spawnParticles(enemy.x, enemy.y + enemy.h / 2, 18, col, 2, 0.12, 0.85, -5, 4.2);
          shakeBurst(0.16, 0.2); flashBurst(palette.chartreuse, 0.24, 0.16); freeze(0.05);
        } else {
          if (!demoMode) { lives = Math.max(0, lives - 1); }
          combo = 0; invulnerable = 1.4; x -= 2.2; vx = -4.5; vy = 5;
          spawnParticles(x, y - 0.5, 18, "blood", 2, 0.13, 0.9, -6, 4);
          shakeBurst(0.28, 0.35); flashBurst(palette.red, 0.5, 0.3); freeze(0.08);
          if (!demoMode && lives <= 0) { gameOver = true; running = false; }
        }
      }
    }

    for (const coin of coins) {
      if (coin.taken) continue;
      coin.mesh.rotation.y += dt * 5.5;
      coin.mesh.rotation.x = Math.sin(globalT * 3 + coin.phase) * 0.3;
      coin.mesh.position.y = coin.baseY + Math.sin(globalT * 2.5 + coin.phase) * 0.1;
      if (Math.abs(coin.x - x) < 1 && Math.abs(coin.y - (y + 0.3)) < 1.4) {
        coin.taken = true; coin.mesh.setEnabled(false);
        const gain = 100 + combo * 10;
        score += gain; combo += 1;
        popup(gain, coin.x, coin.y + 0.3, "coin");
        if (combo > 0 && combo % 5 === 0) popup(combo * 10, x + 2, y + 1.5, "combo");
        spawnParticles(coin.x, coin.y, 10, "spark", 1.4, 0.09, 0.65, -4, 3);
        if (combo >= 10) { shakeBurst(0.06, 0.1); flashBurst(palette.gold, 0.1, 0.08); }
      }
    }

    invulnerable = Math.max(0, invulnerable - dt);
    playerRoot.setEnabled(invulnerable <= 0 || Math.floor(invulnerable * 14) % 2 === 0);

    score += Math.floor(dt * 9);
    updateParticles(dt);

    if (flashAmt > 0) {
      flashMat.diffuseColor = flashColor; flashMat.emissiveColor = flashColor; flashMat.alpha = flashAmt * (flashDur > 0 ? 1 : 0);
    } else { flashMat.alpha = 0; }

    if (confettiActive) {
      confetti.forEach((c, i) => {
        c.rotation.z += dt * (1 + (i % 5) * 0.4);
        c.rotation.x += dt * (0.6 + (i % 3) * 0.3);
        c.position.y -= dt * (1.2 + (i % 7) * 0.2);
        c.position.x += dt * (Math.sin(i + globalT) * 0.8);
        if (c.position.y < -6) { c.position.y = 7 + Math.random() * 3; c.position.x = 250 + (Math.random() - 0.5) * 10; }
      });
    }
    snapshot();
  };
  const tick = () => {
    const now = performance.now();
    let dt = Math.min(0.035, (now - last) / 1000);
    last = now;
    if (hitStop > 0) { hitStop -= dt; dt *= 0.02; }
    if (running && !gameOver && !finished) update(dt);
    else if (gameOver || finished) updateParticles(dt);
    scene.render();
  };
  engine.runRenderLoop(tick);
  snapshot();

  return {
    dispose: () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("frw:select-outfit", selectOutfit);
      window.removeEventListener("frw:select-loadout", selectLoadout);
      window.removeEventListener("frw:jump", jump);
      window.removeEventListener("frw:jump-down", () => { jumpHeld = true; jump(); });
      window.removeEventListener("frw:jump-up", () => { jumpHeld = false; });
      window.removeEventListener("frw:crouch-down", () => setCrouch(true));
      window.removeEventListener("frw:crouch-up", () => setCrouch(false));
      window.removeEventListener("frw:start", jump);
      window.removeEventListener("frw:restart", restartEvent);
      window.removeEventListener("frw:next-stage", nextStageEvent);
      if (autoAdvanceTimer !== undefined) window.clearTimeout(autoAdvanceTimer);
      window.removeEventListener("frw:dash", dash);
    window.removeEventListener("frw:web-attach", attachWeb);
    window.removeEventListener("frw:web-release", releaseWeb);
    releaseWeb();
      window.removeEventListener("frw:attack", attack);
      window.removeEventListener("frw:kick", kickShoe);
      window.removeEventListener("frw:lane", laneListener);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      engine.stopRenderLoop(tick);
      glbAnimations.forEach((group) => group.stop());
      if (glbRoot) glbRoot.dispose(false, true);
      scene.dispose();
      engine.dispose();
    }
  };
}
