import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Sun,
  Moon,
  Sunset,
  Maximize2,
  Minimize2,
  Eye,
  Layers,
  Sparkles,
  Palette,
  Ruler,
  Compass,
  RefreshCw,
  Info,
  Check,
  Bed,
  Coffee,
  X,
} from 'lucide-react';
import { Property } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface Property3DViewerProps {
  property: Property;
  className?: string;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

type LightingMode = 'day' | 'sunset' | 'night';
type FlooringMaterial = 'marble' | 'wood' | 'concrete';
type ViewPreset = 'dollhouse' | 'topdown' | 'living' | 'kitchen' | 'master' | 'terrace';

export function Property3DViewer({
  property,
  className = '',
  onClose,
  isExpanded = false,
  onToggleExpand,
}: Property3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewer state
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [flooringMaterial, setFlooringMaterial] = useState<FlooringMaterial>('marble');
  const [activeViewPreset, setActiveViewPreset] = useState<ViewPreset>('dollhouse');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(false);
  const [showRoofCutaway, setShowRoofCutaway] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit control states
  const orbitState = useRef({
    isDragging: false,
    isPanning: false,
    previousMousePosition: { x: 0, y: 0 },
    spherical: new THREE.Spherical(22, Math.PI / 3.2, Math.PI / 4),
    target: new THREE.Vector3(0, 0, 0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    cameraTargetPos: new THREE.Vector3(15, 12, 15),
    isTransitioning: false,
    dampingFactor: 0.08,
  });

  // Lighting references for dynamic day/night transitions
  const lightsRef = useRef<{
    dirLight: THREE.DirectionalLight | null;
    hemiLight: THREE.HemisphereLight | null;
    ambientLight: THREE.AmbientLight | null;
    interiorLights: THREE.PointLight[];
  }>({
    dirLight: null,
    hemiLight: null,
    ambientLight: null,
    interiorLights: [],
  });

  // Materials dictionary for real-time swapping
  const floorMaterialsRef = useRef<{
    marble: THREE.MeshStandardMaterial;
    wood: THREE.MeshStandardMaterial;
    concrete: THREE.MeshStandardMaterial;
  } | null>(null);

  const floorMeshesRef = useRef<THREE.Mesh[]>([]);

  // Procedural canvas textures
  const createMarbleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Warm white carrara base
    ctx.fillStyle = '#F4F4F6';
    ctx.fillRect(0, 0, 512, 512);

    // Large marble tiles grid
    ctx.strokeStyle = '#D5D5DC';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 512, 512);

    // Subtle natural veins
    ctx.strokeStyle = '#B8B8C2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.bezierCurveTo(150, 180, 240, 120, 380, 320);
    ctx.bezierCurveTo(420, 380, 480, 450, 512, 490);
    ctx.stroke();

    ctx.strokeStyle = '#C9A84C'; // subtle gold fleck vein
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 50);
    ctx.bezierCurveTo(220, 160, 140, 280, 320, 512);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  };

  const createWoodTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Honey Oak background
    ctx.fillStyle = '#C8935A';
    ctx.fillRect(0, 0, 512, 512);

    // Wood planks horizontal
    const plankH = 512 / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#BF894F' : '#CB9760';
      ctx.fillRect(0, i * plankH, 512, plankH);

      // Plank grooves
      ctx.strokeStyle = '#7D5229';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, i * plankH);
      ctx.lineTo(512, i * plankH);
      ctx.stroke();

      // Wood grain
      ctx.strokeStyle = '#A6733E';
      ctx.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        const y = i * plankH + (g + 1) * (plankH / 5);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(170, y + 4, 340, y - 4, 512, y);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  };

  const createConcreteTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#2A2C34';
    ctx.fillRect(0, 0, 512, 512);

    // Slate tile borders
    ctx.strokeStyle = '#1E2026';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 512, 512);

    // Microcement trowel striae
    ctx.fillStyle = '#373A44';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        Math.random() * 512,
        Math.random() * 80 + 30,
        Math.random() * 40 + 10,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  };

  // Build architectural 3D dollhouse model
  const buildArchitecturalScene = useCallback((scene: THREE.Scene) => {
    // 1. Base Foundation Plinth
    const plinthGeo = new THREE.BoxGeometry(17, 0.6, 13);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.8,
      metalness: 0.2,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.set(0, -0.3, 0);
    plinthMesh.receiveShadow = true;
    scene.add(plinthMesh);

    // Gold accent trim line on bottom
    const trimGeo = new THREE.BoxGeometry(17.15, 0.08, 13.15);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      roughness: 0.3,
      metalness: 0.8,
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, 0.02, 0);
    scene.add(trimMesh);

    // 2. Flooring materials setup
    const marbleTex = createMarbleTexture();
    const woodTex = createWoodTexture();
    const concreteTex = createConcreteTexture();

    floorMaterialsRef.current = {
      marble: new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.15,
        metalness: 0.1,
      }),
      wood: new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.4,
        metalness: 0.05,
      }),
      concrete: new THREE.MeshStandardMaterial({
        map: concreteTex,
        roughness: 0.7,
        metalness: 0.1,
      }),
    };

    // Interior floor slab (living + dining + kitchen)
    const mainFloorGeo = new THREE.BoxGeometry(10.5, 0.15, 11.5);
    const mainFloor = new THREE.Mesh(mainFloorGeo, floorMaterialsRef.current.marble);
    mainFloor.position.set(-2.5, 0.1, 0);
    mainFloor.receiveShadow = true;
    scene.add(mainFloor);
    floorMeshesRef.current.push(mainFloor);

    // Bedroom floor slab (cozy wood by default)
    const bedFloorGeo = new THREE.BoxGeometry(5.2, 0.15, 6.8);
    const bedFloor = new THREE.Mesh(bedFloorGeo, floorMaterialsRef.current.wood);
    bedFloor.position.set(5.2, 0.1, -2.35);
    bedFloor.receiveShadow = true;
    scene.add(bedFloor);
    floorMeshesRef.current.push(bedFloor);

    // Terrace wood deck flooring
    const deckGeo = new THREE.BoxGeometry(5.2, 0.12, 4.4);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e26,
      roughness: 0.6,
      metalness: 0.1,
    });
    const deckFloor = new THREE.Mesh(deckGeo, deckMat);
    deckFloor.position.set(5.2, 0.08, 3.4);
    deckFloor.receiveShadow = true;
    scene.add(deckFloor);

    // 3. Walls (Cutaway architectural half-height style)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf0efe9,
      roughness: 0.9,
    });
    const accentWallMat = new THREE.MeshStandardMaterial({
      color: 0x222938, // deep navy accent wall
      roughness: 0.7,
    });

    const wallHeight = 1.6;

    // Helper to make a wall box
    const createWall = (
      w: number,
      d: number,
      x: number,
      z: number,
      mat: THREE.Material = wallMat
    ) => {
      const geo = new THREE.BoxGeometry(w, wallHeight, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, wallHeight / 2 + 0.15, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };

    // Back perimeter wall (North)
    createWall(16.5, 0.35, 0.1, -5.85);

    // West perimeter wall
    createWall(0.35, 12, -7.85, 0);

    // South perimeter wall (with entrance cutaway)
    createWall(9.5, 0.35, -3.1, 5.85);

    // East bedroom wall (half height + window opening)
    createWall(0.35, 7, 7.85, -2.4);

    // Interior divider wall between Living and Master Suite
    createWall(0.3, 7, 2.7, -2.4, accentWallMat);

    // Divider between bedroom & terrace
    createWall(5.4, 0.3, 5.25, 1.15);

    // 4. Panoramic Glass Balustrade & Windows
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xddefff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
    });

    // Terrace glass railing
    const terraceRailGeo = new THREE.BoxGeometry(5.2, 0.9, 0.08);
    const terraceRail = new THREE.Mesh(terraceRailGeo, glassMat);
    terraceRail.position.set(5.2, 0.6, 5.85);
    scene.add(terraceRail);

    const terraceSideRailGeo = new THREE.BoxGeometry(0.08, 0.9, 4.4);
    const terraceSideRail = new THREE.Mesh(terraceSideRailGeo, glassMat);
    terraceSideRail.position.set(7.85, 0.6, 3.4);
    scene.add(terraceSideRail);

    // 5. Furniture Elements
    // --- LIVING ROOM ---
    // Designer L-Sofa
    const sofaBaseGeo = new THREE.BoxGeometry(4.2, 0.45, 1.6);
    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0xe3dfd5, // warm linen
      roughness: 0.85,
    });
    const sofaMain = new THREE.Mesh(sofaBaseGeo, sofaMat);
    sofaMain.position.set(-3.5, 0.4, -3.8);
    sofaMain.castShadow = true;
    scene.add(sofaMain);

    const sofaLGeo = new THREE.BoxGeometry(1.6, 0.45, 2.6);
    const sofaL = new THREE.Mesh(sofaLGeo, sofaMat);
    sofaL.position.set(-5.6, 0.4, -2.3);
    sofaL.castShadow = true;
    scene.add(sofaL);

    // Pillows
    const pillowGeo = new THREE.BoxGeometry(0.6, 0.3, 0.25);
    const pillowMat1 = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.7 });
    const pillowMat2 = new THREE.MeshStandardMaterial({ color: 0x1a2130, roughness: 0.7 });

    const p1 = new THREE.Mesh(pillowGeo, pillowMat1);
    p1.position.set(-2.5, 0.7, -4.3);
    p1.rotation.x = 0.2;
    scene.add(p1);

    const p2 = new THREE.Mesh(pillowGeo, pillowMat2);
    p2.position.set(-4.2, 0.7, -4.3);
    p2.rotation.x = 0.2;
    scene.add(p2);

    // Marble Coffee Table
    const tableTopGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.08, 32);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0x22252a,
      metalness: 0.2,
      roughness: 0.2,
    });
    const table = new THREE.Mesh(tableTopGeo, tableTopMat);
    table.position.set(-3.4, 0.42, -1.8);
    table.castShadow = true;
    scene.add(table);

    // TV Media Wall & TV Screen
    const tvUnitGeo = new THREE.BoxGeometry(3.6, 0.4, 0.6);
    const tvUnitMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.4 });
    const tvUnit = new THREE.Mesh(tvUnitGeo, tvUnitMat);
    tvUnit.position.set(-3.4, 0.35, 0.2);
    tvUnit.castShadow = true;
    scene.add(tvUnit);

    const tvScreenGeo = new THREE.BoxGeometry(2.4, 1.2, 0.06);
    const tvScreenMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.1,
      metalness: 0.8,
    });
    const tvScreen = new THREE.Mesh(tvScreenGeo, tvScreenMat);
    tvScreen.position.set(-3.4, 1.3, 0.2);
    tvScreen.castShadow = true;
    scene.add(tvScreen);

    // Floor Rug (Living Room)
    const rugGeo = new THREE.BoxGeometry(4.8, 0.02, 3.8);
    const rugMat = new THREE.MeshStandardMaterial({
      color: 0xc8c3b7,
      roughness: 0.95,
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.position.set(-3.5, 0.18, -2.4);
    rug.receiveShadow = true;
    scene.add(rug);

    // --- KITCHEN & ISLAND ---
    // Kitchen Back Counter
    const kitchenBackGeo = new THREE.BoxGeometry(4.5, 0.9, 0.8);
    const kitchenBackMat = new THREE.MeshStandardMaterial({
      color: 0x262a34,
      roughness: 0.3,
    });
    const kitchenBack = new THREE.Mesh(kitchenBackGeo, kitchenBackMat);
    kitchenBack.position.set(-3.2, 0.6, 5.2);
    kitchenBack.castShadow = true;
    scene.add(kitchenBack);

    // Kitchen Island with waterfall marble counter
    const islandGeo = new THREE.BoxGeometry(3.2, 0.95, 1.2);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0xf8f8fa,
      roughness: 0.2,
      metalness: 0.1,
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(-3.2, 0.65, 3.2);
    island.castShadow = true;
    scene.add(island);

    // Bar Stools (3 stools)
    for (let s = 0; s < 3; s++) {
      const stoolGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16);
      const stoolMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 0.7 });
      const stool = new THREE.Mesh(stoolGeo, stoolMat);
      stool.position.set(-4.0 + s * 0.8, 0.45, 2.1);
      stool.castShadow = true;
      scene.add(stool);
    }

    // --- MASTER BEDROOM ---
    // King Bed Frame
    const bedFrameGeo = new THREE.BoxGeometry(2.8, 0.45, 3.4);
    const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.6 });
    const bedFrame = new THREE.Mesh(bedFrameGeo, bedFrameMat);
    bedFrame.position.set(5.2, 0.35, -3.8);
    bedFrame.castShadow = true;
    scene.add(bedFrame);

    // Mattress & Bedding
    const mattressGeo = new THREE.BoxGeometry(2.5, 0.35, 3.1);
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf0ede6, roughness: 0.9 });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.set(5.2, 0.6, -3.7);
    mattress.castShadow = true;
    scene.add(mattress);

    // Headboard
    const headboardGeo = new THREE.BoxGeometry(3.0, 1.2, 0.3);
    const headboardMat = new THREE.MeshStandardMaterial({
      color: 0x8a6d3b,
      roughness: 0.5,
    });
    const headboard = new THREE.Mesh(headboardGeo, headboardMat);
    headboard.position.set(5.2, 0.85, -5.5);
    headboard.castShadow = true;
    scene.add(headboard);

    // Bed Pillows
    for (let p = 0; p < 2; p++) {
      const bPillowGeo = new THREE.BoxGeometry(0.9, 0.2, 0.5);
      const bPillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      const bPillow = new THREE.Mesh(bPillowGeo, bPillowMat);
      bPillow.position.set(4.5 + p * 1.4, 0.82, -4.9);
      scene.add(bPillow);
    }

    // Floating Nightstands & Bedside Lamps
    for (let side of [-1, 1]) {
      const standGeo = new THREE.BoxGeometry(0.6, 0.35, 0.6);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x141822 });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(5.2 + side * 1.9, 0.32, -5.1);
      scene.add(stand);

      // Bedside lamp
      const lampGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.35, 16);
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0xfff0d0,
        emissive: 0xffd88a,
        emissiveIntensity: 0.6,
      });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(5.2 + side * 1.9, 0.65, -5.1);
      scene.add(lamp);
    }

    // --- TERRACE LOUNGE & PLANTS ---
    // Outdoor Lounge Chair
    const loungeGeo = new THREE.BoxGeometry(1.2, 0.3, 2.2);
    const loungeMat = new THREE.MeshStandardMaterial({ color: 0xd0cbc0, roughness: 0.8 });
    const lounge = new THREE.Mesh(loungeGeo, loungeMat);
    lounge.position.set(4.2, 0.3, 3.4);
    lounge.castShadow = true;
    scene.add(lounge);

    // Planter Pots with greenery
    const planterGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.7, 16);
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x22242a });
    const pot = new THREE.Mesh(planterGeo, planterMat);
    pot.position.set(7.0, 0.45, 5.0);
    scene.add(pot);

    const foliageGeo = new THREE.DodecahedronGeometry(0.5, 1);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 });
    const bush = new THREE.Mesh(foliageGeo, foliageMat);
    bush.position.set(7.0, 0.95, 5.0);
    scene.add(bush);
  }, []);

  // Set up Lighting for the Scene
  const setupLighting = useCallback((scene: THREE.Scene) => {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    lightsRef.current.ambientLight = ambient;

    // Hemisphere sky/ground light
    const hemi = new THREE.HemisphereLight(0xeef5ff, 0x33281a, 0.6);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);
    lightsRef.current.hemiLight = hemi;

    // Main Sun light
    const sun = new THREE.DirectionalLight(0xfff7e6, 1.4);
    sun.position.set(16, 22, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 60;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    lightsRef.current.dirLight = sun;

    // Interior Warm Spot/Point Lights
    const livingPoint = new THREE.PointLight(0xffd599, 1.2, 10, 1.5);
    livingPoint.position.set(-3.5, 2.2, -2.4);
    scene.add(livingPoint);

    const kitchenPoint = new THREE.PointLight(0xffecc2, 1.0, 8, 1.5);
    kitchenPoint.position.set(-3.2, 2.2, 3.2);
    scene.add(kitchenPoint);

    const bedPoint = new THREE.PointLight(0xffd18a, 1.1, 8, 1.5);
    bedPoint.position.set(5.2, 2.0, -3.8);
    scene.add(bedPoint);

    lightsRef.current.interiorLights = [livingPoint, kitchenPoint, bedPoint];
  }, []);

  // Update lighting mode (Day / Sunset / Night)
  useEffect(() => {
    if (!sceneRef.current) return;
    const { dirLight, hemiLight, ambientLight, interiorLights } = lightsRef.current;

    if (lightingMode === 'day') {
      sceneRef.current.background = new THREE.Color(0xf0f4f9);
      if (dirLight) {
        dirLight.color.setHex(0xfff6e6);
        dirLight.intensity = 1.4;
        dirLight.position.set(16, 22, 14);
      }
      if (hemiLight) {
        hemiLight.color.setHex(0xddeeff);
        hemiLight.groundColor.setHex(0x33281a);
        hemiLight.intensity = 0.7;
      }
      if (ambientLight) ambientLight.intensity = 0.5;
      interiorLights.forEach((l) => (l.intensity = 0.6));
    } else if (lightingMode === 'sunset') {
      sceneRef.current.background = new THREE.Color(0x2d1f2d);
      if (dirLight) {
        dirLight.color.setHex(0xff8c42);
        dirLight.intensity = 1.8;
        dirLight.position.set(22, 8, 18);
      }
      if (hemiLight) {
        hemiLight.color.setHex(0xffb570);
        hemiLight.groundColor.setHex(0x221318);
        hemiLight.intensity = 0.6;
      }
      if (ambientLight) ambientLight.intensity = 0.35;
      interiorLights.forEach((l) => (l.intensity = 1.5));
    } else {
      // Night
      sceneRef.current.background = new THREE.Color(0x0c101b);
      if (dirLight) {
        dirLight.color.setHex(0x334466);
        dirLight.intensity = 0.25;
        dirLight.position.set(-10, 15, -10);
      }
      if (hemiLight) {
        hemiLight.color.setHex(0x1a243a);
        hemiLight.groundColor.setHex(0x05070c);
        hemiLight.intensity = 0.2;
      }
      if (ambientLight) ambientLight.intensity = 0.15;
      interiorLights.forEach((l) => (l.intensity = 2.4));
    }
  }, [lightingMode]);

  // Update flooring material in real-time
  useEffect(() => {
    if (!floorMaterialsRef.current || floorMeshesRef.current.length === 0) return;
    const selectedMat = floorMaterialsRef.current[flooringMaterial];
    if (selectedMat) {
      floorMeshesRef.current.forEach((mesh) => {
        mesh.material = selectedMat;
        mesh.material.needsUpdate = true;
      });
    }
  }, [flooringMaterial]);

  // Initialize Three.js WebGL Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f9);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const initialPos = new THREE.Vector3(17, 14, 17);
    camera.position.copy(initialPos);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and tone mapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // 4. Build elements
    setupLighting(scene);
    buildArchitecturalScene(scene);
    setIsLoading(false);

    // 5. Render & Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Auto-rotation when idle
      if (autoRotate && !orbitState.current.isDragging && !orbitState.current.isTransitioning) {
        orbitState.current.spherical.theta += 0.25 * delta;
      }

      // Smooth camera interpolation
      if (orbitState.current.isTransitioning) {
        camera.position.lerp(orbitState.current.cameraTargetPos, 0.06);
        orbitState.current.target.lerp(orbitState.current.targetLookAt, 0.06);
        camera.lookAt(orbitState.current.target);

        if (camera.position.distanceTo(orbitState.current.cameraTargetPos) < 0.1) {
          orbitState.current.isTransitioning = false;
          // sync spherical coords back
          const offset = new THREE.Vector3().subVectors(camera.position, orbitState.current.target);
          orbitState.current.spherical.setFromVector3(offset);
        }
      } else {
        // Normal Orbit Controls Calculation
        orbitState.current.spherical.phi = Math.max(
          0.1,
          Math.min(Math.PI / 2 - 0.05, orbitState.current.spherical.phi)
        );
        orbitState.current.spherical.radius = Math.max(
          8,
          Math.min(35, orbitState.current.spherical.radius)
        );

        const newPos = new THREE.Vector3()
          .setFromSpherical(orbitState.current.spherical)
          .add(orbitState.current.target);

        camera.position.lerp(newPos, orbitState.current.dampingFactor);
        camera.lookAt(orbitState.current.target);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      renderer.forceContextLoss();
      scene.clear();
    };
  }, [buildArchitecturalScene, setupLighting, autoRotate]);

  // Touch & Mouse Orbit Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    orbitState.current.isDragging = true;
    orbitState.current.isPanning = e.button === 2; // Right click = pan
    orbitState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    orbitState.current.isTransitioning = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!orbitState.current.isDragging) return;

    const deltaX = e.clientX - orbitState.current.previousMousePosition.x;
    const deltaY = e.clientY - orbitState.current.previousMousePosition.y;

    if (orbitState.current.isPanning) {
      // Pan target
      orbitState.current.target.x -= deltaX * 0.02;
      orbitState.current.target.z += deltaY * 0.02;
    } else {
      // Rotate azimuth and polar angles
      orbitState.current.spherical.theta -= deltaX * 0.007;
      orbitState.current.spherical.phi -= deltaY * 0.007;
    }

    orbitState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    orbitState.current.isDragging = false;
    orbitState.current.isPanning = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    orbitState.current.isTransitioning = false;
    orbitState.current.spherical.radius += e.deltaY * 0.015;
  };

  // Touch support
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      orbitState.current.isDragging = true;
      orbitState.current.isTransitioning = false;
      orbitState.current.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.dist = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && orbitState.current.isDragging) {
      const deltaX = e.touches[0].clientX - orbitState.current.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - orbitState.current.previousMousePosition.y;

      orbitState.current.spherical.theta -= deltaX * 0.008;
      orbitState.current.spherical.phi -= deltaY * 0.008;

      orbitState.current.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const deltaDist = touchStartRef.current.dist - dist;
      orbitState.current.spherical.radius += deltaDist * 0.04;
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    orbitState.current.isDragging = false;
  };

  // Preset Camera Transitions (Smooth Fly-to)
  const flyToPreset = (preset: ViewPreset) => {
    setActiveViewPreset(preset);
    orbitState.current.isTransitioning = true;

    switch (preset) {
      case 'dollhouse':
        orbitState.current.cameraTargetPos.set(16, 13, 16);
        orbitState.current.targetLookAt.set(0, 0, 0);
        setSelectedHotspot(null);
        break;
      case 'topdown':
        orbitState.current.cameraTargetPos.set(0.1, 24, 0.1);
        orbitState.current.targetLookAt.set(0, 0, 0);
        setSelectedHotspot(null);
        break;
      case 'living':
        orbitState.current.cameraTargetPos.set(-3.5, 4.5, 4.2);
        orbitState.current.targetLookAt.set(-3.5, 0.6, -2.4);
        setSelectedHotspot('living');
        break;
      case 'kitchen':
        orbitState.current.cameraTargetPos.set(-3.2, 3.8, 0.2);
        orbitState.current.targetLookAt.set(-3.2, 0.8, 4.2);
        setSelectedHotspot('kitchen');
        break;
      case 'master':
        orbitState.current.cameraTargetPos.set(5.2, 4.2, 0.2);
        orbitState.current.targetLookAt.set(5.2, 0.7, -3.8);
        setSelectedHotspot('master');
        break;
      case 'terrace':
        orbitState.current.cameraTargetPos.set(4.2, 3.2, 0.8);
        orbitState.current.targetLookAt.set(5.2, 0.5, 4.4);
        setSelectedHotspot('terrace');
        break;
    }
  };

  // Reset View to Default
  const handleResetView = () => {
    flyToPreset('dollhouse');
  };

  // Room Hotspot Metadata
  const hotspots = [
    {
      id: 'living',
      title: 'سالن پذیرایی و نشیمن',
      area: Math.round(property.area * 0.45),
      desc: 'فضای فلت بدون ستون با پلان تفکیکی و نورگیری مستقیم جنوب',
      preset: 'living' as ViewPreset,
    },
    {
      id: 'kitchen',
      title: 'آشپزخانه و کانتر جزیره',
      area: Math.round(property.area * 0.18),
      desc: 'کابینت‌های انزو، کانتر سنگ اسلب کوارتز و یراق‌آلات بلوم اتریش',
      preset: 'kitchen' as ViewPreset,
    },
    {
      id: 'master',
      title: 'سوئیت خواب مستر کینگ',
      area: Math.round(property.area * 0.24),
      desc: 'مسترروم وسیع با واک‌این کلوزت و حمام اختصاصی شیشه‌ای',
      preset: 'master' as ViewPreset,
    },
    {
      id: 'terrace',
      title: 'تراس اختصاصی چیدمان',
      area: Math.round(property.area * 0.13),
      desc: 'کفپوش ترمووود و دید ابدی پانوراما بدون مشرف',
      preset: 'terrace' as ViewPreset,
    },
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-[#0D111A] border border-[#C9A84C]/30 shadow-2xl select-none font-['Vazirmatn',sans-serif] ${className} ${
        isFullscreen ? 'fixed inset-0 z-[100000] rounded-none' : 'h-[440px] sm:h-[540px]'
      }`}
      dir="rtl"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0D111A] flex flex-col items-center justify-center gap-3 z-30">
          <div className="w-12 h-12 rounded-full border-3 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
          <span className="text-xs font-bold text-[#E4C675]">
            در حال بارگذاری مدل سه‌بعدی و موتور رندرینگ Three.js...
          </span>
        </div>
      )}

      {/* Top Floating Header HUD */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Badge */}
          <div className="bg-[#121824]/90 backdrop-blur-md border border-[#C9A84C]/40 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-[#E4C675]">مدل سه‌بعدی تعاملی ۳۶۰°</span>
            <span className="text-[11px] text-white/60 hidden sm:inline">
              ({toPersianDigits(property.area)} مترمربع)
            </span>
          </div>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md ${
              autoRotate
                ? 'bg-[#C9A84C] text-[#1A1A2E] border-[#C9A84C]'
                : 'bg-[#121824]/80 text-white/70 border-white/10 hover:text-white'
            }`}
            title="چرخش خودکار ۳۶۰ درجه"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">چرخش ۳۶۰</span>
          </button>
        </div>

        {/* Right HUD: Lighting Mode & Fullscreen Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Lighting Mode Selector */}
          <div className="bg-[#121824]/90 backdrop-blur-md border border-white/10 p-1 rounded-xl flex items-center gap-1 shadow-lg">
            <button
              onClick={() => setLightingMode('day')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                lightingMode === 'day'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-white/50 hover:text-white'
              }`}
              title="نور روز آفتابی"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLightingMode('sunset')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                lightingMode === 'sunset'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'text-white/50 hover:text-white'
              }`}
              title="غروب آفتاب و عصر طلایی"
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                lightingMode === 'night'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-white/50 hover:text-white'
              }`}
              title="نورپردازی لوکس شب"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Camera Button */}
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl bg-[#121824]/90 hover:bg-[#1A2130] text-white/80 hover:text-[#C9A84C] border border-white/10 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
            title="بازنشانی زاویه دید دوربین"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Fullscreen Expand */}
          <button
            onClick={() => {
              if (onToggleExpand) {
                onToggleExpand();
              } else {
                setIsFullscreen(!isFullscreen);
              }
            }}
            className="p-2 rounded-xl bg-[#121824]/90 hover:bg-[#1A2130] text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
            title={isFullscreen ? 'خروج از تمام صفحه' : 'نمایش تمام صفحه ۳D'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close if in standalone modal */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Room Preset Navigation Tabs (Bottom HUD) */}
      <div className="absolute bottom-3 inset-x-3 flex flex-col sm:flex-row items-center justify-between gap-2 z-20 pointer-events-none">
        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-[#121824]/90 backdrop-blur-md border border-white/15 p-1.5 rounded-2xl shadow-xl overflow-x-auto max-w-full pointer-events-auto">
          <button
            onClick={() => flyToPreset('dollhouse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeViewPreset === 'dollhouse'
                ? 'bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>مدل سه‌بعدی</span>
          </button>

          <button
            onClick={() => flyToPreset('topdown')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeViewPreset === 'topdown'
                ? 'bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>پلان ایزومتریک</span>
          </button>

          <div className="w-px h-4 bg-white/15 mx-0.5" />

          {hotspots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => flyToPreset(spot.preset)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeViewPreset === spot.preset
                  ? 'bg-white/20 text-[#E4C675] border border-[#C9A84C]/50'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{spot.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Material & Flooring Swapper Pill */}
        <div className="flex items-center gap-2 bg-[#121824]/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl shadow-xl pointer-events-auto">
          <Palette className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-[11px] text-white/60 font-semibold hidden md:inline">کفپوش:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFlooringMaterial('marble')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                flooringMaterial === 'marble'
                  ? 'bg-[#C9A84C] text-[#1A1A2E]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              مرمر کارارا
            </button>
            <button
              onClick={() => setFlooringMaterial('wood')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                flooringMaterial === 'wood'
                  ? 'bg-[#C9A84C] text-[#1A1A2E]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              پارکت بلوط
            </button>
            <button
              onClick={() => setFlooringMaterial('concrete')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                flooringMaterial === 'concrete'
                  ? 'bg-[#C9A84C] text-[#1A1A2E]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              میکروسمنت
            </button>
          </div>
        </div>
      </div>

      {/* Selected Room Details Popup Card */}
      {selectedHotspot && (
        <div className="absolute top-16 right-4 max-w-xs bg-[#121824]/95 backdrop-blur-xl border border-[#C9A84C]/40 rounded-2xl p-4 shadow-2xl z-20 animate-fadeIn text-right text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#E4C675]">
                {selectedHotspot === 'living' && <Eye className="w-4 h-4" />}
                {selectedHotspot === 'kitchen' && <Coffee className="w-4 h-4" />}
                {selectedHotspot === 'master' && <Bed className="w-4 h-4" />}
                {selectedHotspot === 'terrace' && <Compass className="w-4 h-4" />}
              </div>
              <h4 className="text-xs font-black text-[#E4C675]">
                {hotspots.find((h) => h.id === selectedHotspot)?.title}
              </h4>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-white/50 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[11px] text-white/80 leading-relaxed">
            {hotspots.find((h) => h.id === selectedHotspot)?.desc}
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-white/50">متراژ تقریبی بخش:</span>
            <span className="font-mono font-bold text-[#E4C675]">
              {toPersianDigits(hotspots.find((h) => h.id === selectedHotspot)?.area || 0)} مترمربع
            </span>
          </div>
        </div>
      )}

      {/* Navigation Hint Overlay (Subtle) */}
      <div className="absolute bottom-16 left-4 bg-black/40 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-white/50 pointer-events-none hidden md:flex items-center gap-1.5">
        <span>چرخش: کلیک و درگ</span>
        <span>•</span>
        <span>بزرگ‌نمایی: اسکرول ماوس</span>
        <span>•</span>
        <span>جابجایی: کلیک راست</span>
      </div>
    </div>
  );
}
