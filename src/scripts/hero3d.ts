/**
 * WebGL hero: an ink drawing of a system made of 27 modules.
 *
 * Scroll choreography (progress 0..1 comes from scroll.ts):
 *   0.00  isometric cube, to the side of the headline, one module marked
 *   0.04  exploded view: the modules separate
 *   0.30  the drawing turns to face the reader, camera tracks the marked module
 *   0.34  dive: that small module grows until its face fills the screen
 *
 * Drawn in the notebook's grammar: paper-coloured faces with hidden lines
 * removed, ink edges that "boil" slightly, marker fill on the one that matters.
 * Renders on demand only (scroll, pointer, boil tick); nothing runs offscreen.
 */
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { progress } from './scroll';

const FOV = 32;
const TAN = Math.tan((FOV * Math.PI) / 360);
const SIZE = 1;
const PITCH = SIZE + 0.07;
const SPREAD = 1.9;
const ISO_X = 0.6155;
const ISO_Y = -Math.PI / 4;
const BOIL_MS = 140;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const remap = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Module = { group: Group; base: Vector3; key: boolean };

/** Hands the main thread back between setup steps, so starting up never
    becomes one long task that would block the first taps and scrolls. */
const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function initHero(canvas: HTMLCanvasElement) {
  const host = canvas.closest<HTMLElement>('.hero');
  if (!host) return;
  await breathe();

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  // Line art needs density, but never more than 2x; weaker devices get 1.5x.
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, weak ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  await breathe();

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.05, 200);
  const assembly = new Group();
  scene.add(assembly);

  // Shared geometry and materials: 27 modules, 8 materials, 2 geometries.
  const box = new BoxGeometry(SIZE, SIZE, SIZE);
  const edges = new LineSegmentsGeometry().fromEdgesGeometry(new EdgesGeometry(box));
  const lineMat = new LineMaterial({ color: 0x000000, linewidth: 2.2, worldUnits: false });
  const face = () => new MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  // BoxGeometry material order: +x, -x, +y, -y, +z, -z
  const plain = { x: face(), y: face(), z: face() };
  const marked = { x: face(), y: face(), z: face() };
  const plainMats = [plain.x, plain.x, plain.y, plain.y, plain.z, plain.z];
  const markedMats = [marked.x, marked.x, marked.y, marked.y, marked.z, marked.z];

  const modules: Module[] = [];
  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        const key = x === 1 && y === 1 && z === 1;
        const group = new Group();
        group.add(new Mesh(box, key ? markedMats : plainMats));
        group.add(new LineSegments2(edges, lineMat));
        assembly.add(group);
        modules.push({ group, base: new Vector3(x, y, z), key });
      }
    }
  }
  const keyModule = modules.find((m) => m.key)!;

  /* ---------- Colours come from the page's own tokens ---------- */
  const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const paint = () => {
    const paper = new Color(css('--paper'));
    const shade = new Color(css('--paper-shade'));
    const blue = new Color(css('--blue'));
    const marker = new Color(css('--marker'));
    const wash = new Color(css('--marker-solid'));
    lineMat.color.set(css('--ink'));
    plain.y.color.copy(paper);
    plain.x.color.copy(shade);
    plain.z.color.copy(paper).lerp(blue, 0.13);
    marked.y.color.copy(wash);
    marked.x.color.copy(wash).lerp(marker, 0.22);
    marked.z.color.copy(wash).lerp(marker, 0.42);
    // The CSS wash that takes over when the face fills the screen must match it.
    document.documentElement.style.setProperty('--hero-wash', `#${marked.z.color.getHexString()}`);
    dirty = true;
  };

  /* ---------- Layout ---------- */
  let width = 1;
  let height = 1;
  let aspect = 1;
  let dirty = true;
  // Where the drawing rests, in CSS px relative to the canvas (centre + size).
  const rest = { cx: 0, cy: 0, w: 1, h: 1 };
  const slot = host.querySelector<HTMLElement>('[data-hero-slot]');
  const copy = slot?.parentElement ?? null;
  // Projected size of the assembled cube in world units, with a little air.
  const CUBE_W = 5;
  const CUBE_H = 6.1;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    aspect = width / height;
    if (slot && copy) {
      // Layout offsets, not client rects: the copy block moves while scrolling.
      rest.w = Math.max(1, slot.offsetWidth);
      rest.h = Math.max(1, slot.offsetHeight);
      rest.cx = copy.offsetLeft + slot.offsetLeft + rest.w / 2;
      rest.cy = copy.offsetTop + slot.offsetTop + rest.h / 2;
    } else {
      rest.w = width * 0.4;
      rest.h = height * 0.6;
      rest.cx = width * 0.75;
      rest.cy = height * 0.52;
    }
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    lineMat.resolution.set(width, height);
    dirty = true;
  };

  /* ---------- Pointer parallax (fine pointers only) ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (matchMedia('(pointer: fine)').matches) {
    host.addEventListener('pointermove', (event) => {
      pointer.tx = event.clientX / innerWidth - 0.5;
      pointer.ty = event.clientY / innerHeight - 0.5;
    });
  }

  /* ---------- Boil: hand-drawn lines never sit perfectly still ---------- */
  let lastBoil = 0;
  const boil = () => {
    for (const m of modules) {
      m.group.rotation.set((Math.random() - 0.5) * 0.012, (Math.random() - 0.5) * 0.012, (Math.random() - 0.5) * 0.012);
    }
  };

  const target = new Vector3();
  const keyWorld = new Vector3();
  const faceCentre = new Vector3();
  const faceEdge = new Vector3();
  const FACE_CENTRE = new Vector3(0, 0, SIZE / 2);
  const FACE_EDGE = new Vector3(SIZE / 2, 0, SIZE / 2);
  let lastP = -1;

  const frame = (p: number) => {
    const explode = ease(remap(p, 0.04, 0.46));
    const centre = ease(remap(p, 0.02, 0.34));
    const facing = ease(remap(p, 0.24, 0.5));
    const track = ease(remap(p, 0.28, 0.5));
    const dive = ease(remap(p, 0.32, 0.66));

    // Framing: the cube at rest fills the layout slot, so the view height follows.
    const pxPerUnit = Math.max(8, Math.min(rest.w / CUBE_W, rest.h / CUBE_H));
    const halfH = height / 2 / pxPerUnit;
    const distance = halfH / TAN;

    const spread = PITCH * (1 + explode * SPREAD);
    for (const m of modules) m.group.position.copy(m.base).multiplyScalar(spread);

    const turn = Math.sin(Math.PI * remap(p, 0, 0.45)) * 0.4;
    assembly.rotation.x = lerp(ISO_X, 0, facing) + pointer.y * 0.16 * (1 - facing);
    assembly.rotation.y = lerp(ISO_Y - turn, 0, facing) + pointer.x * 0.24 * (1 - facing);

    // At rest the drawing sits in its slot. The picture is shifted on screen
    // (view offset) instead of moving the object, so the cube keeps the same
    // straight-on perspective as the static drawing wherever the slot is.
    const dx = (rest.cx - width / 2) * (1 - centre);
    const dy = (rest.cy - height / 2) * (1 - centre);
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) camera.setViewOffset(width, height, -dx, -dy, width, height);
    else if (camera.view?.enabled) camera.clearViewOffset();
    assembly.updateMatrixWorld(true);

    // Camera: from framing the whole drawing to diving into the marked module.
    keyModule.group.getWorldPosition(keyWorld);
    target.set(0, 0, 0).lerp(keyWorld, track);
    const cover = SIZE / 2 + SIZE / 2 / (TAN * Math.max(1, aspect));
    const end = SIZE / 2 + (cover - SIZE / 2) * 0.55;
    const dist = distance * Math.pow(end / distance, dive);
    camera.position.set(target.x, target.y, target.z + dist);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);

    // Where the marked face is on screen and how big, so the page can keep
    // its text glued to it: the orange is never an empty field. Taken from
    // the assembly, not from the module, so the boil does not shake the text.
    faceCentre.copy(keyModule.base).multiplyScalar(spread).add(FACE_CENTRE);
    faceEdge.copy(keyModule.base).multiplyScalar(spread).add(FACE_EDGE);
    assembly.localToWorld(faceCentre).project(camera);
    assembly.localToWorld(faceEdge).project(camera);
    const cx = (faceCentre.x * 0.5 + 0.5) * width;
    const cy = (-faceCentre.y * 0.5 + 0.5) * height;
    const half = Math.hypot((faceEdge.x - faceCentre.x) * 0.5 * width, (faceEdge.y - faceCentre.y) * 0.5 * height);
    const scale = Math.min(1, (2 * half) / Math.max(width, height));
    // Once the face is the screen the text is simply the page's own layout.
    const settle = scale >= 1 ? 0 : 1;
    host.style.setProperty('--fs', scale.toFixed(4));
    host.style.setProperty('--fx', ((cx - width / 2) * settle).toFixed(1));
    host.style.setProperty('--fy', ((cy - height / 2) * settle).toFixed(1));
  };

  let visible = false;
  let raf = 0;

  const loop = (now: number) => {
    raf = 0;
    if (!visible) return;
    const p = progress.hero ?? 0;

    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    const drifting = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.0015;

    if (now - lastBoil > BOIL_MS && p < 0.86) {
      lastBoil = now;
      boil();
      dirty = true;
    }

    if (dirty || drifting || p !== lastP) {
      lastP = p;
      dirty = false;
      if (p < 0.9) {
        frame(p);
        renderer.render(scene, camera);
      }
    }
    raf = requestAnimationFrame(loop);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(host);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  if (slot) ro.observe(slot);
  document.addEventListener('themechange', paint);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    host.classList.remove('is-3d');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    host.classList.add('is-3d');
    dirty = true;
  });

  resize();
  paint();
  frame(progress.hero ?? 0);
  // Compile the two shader programs off the critical path, then draw.
  await renderer.compileAsync(scene, camera);
  await breathe();
  frame(progress.hero ?? 0);
  renderer.render(scene, camera);
  host.classList.add('is-3d');
}
