/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { TrackId, TrackMetadata } from '../types/game';

export interface Checkpoint {
  index: number;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
  t: number;
}

export interface SpeedPad {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  mesh: THREE.Mesh;
}

export interface ItemBox {
  id: string;
  position: THREE.Vector3;
  mesh: THREE.Group;
  active: boolean;
  respawnTime: number;
}

export interface TrackData {
  id: TrackId;
  name: string;
  theme: string;
  curve: THREE.CatmullRomCurve3;
  roadMesh: THREE.Mesh;
  curbsMesh: THREE.Mesh;
  railsMesh: THREE.Group;
  sceneryGroup: THREE.Group;
  checkpoints: Checkpoint[];
  speedPads: SpeedPad[];
  itemBoxes: ItemBox[];
  startPosition: THREE.Vector3;
  startDirection: THREE.Vector3;
  trackWidth: number;
  totalLength: number;
  skyColor: number;
  fogColor: number;
  ambientColor: number;
  sunColor: number;
  sunPosition: THREE.Vector3;
  groundMesh: THREE.Mesh;
  frictionMultiplier: number;
}

export const TRACK_METADATA: Record<TrackId, TrackMetadata> = {
  'city-downtown': {
    id: 'city-downtown',
    name: '네온 시티 다운타운',
    subtitle: '빌딩 없는 깔끔한 고속 서킷',
    theme: '도시 (City)',
    difficulty: '★☆☆',
    length: '1.2 km',
    themeColor: '#38bdf8',
    description: '장애물 없이 넓고 깔끔하게 펼쳐진 고속 도심 서킷',
    hazards: '없음',
  },
  'sunset-desert': {
    id: 'sunset-desert',
    name: '선셋 캐년',
    subtitle: '황혼의 탁 트인 사막 협곡',
    theme: '사막 (Desert)',
    difficulty: '★★☆',
    length: '1.7 km',
    themeColor: '#f97316',
    description: '장애물 없이 시원하게 트인 붉은 사막 코스',
    hazards: '모래 노면',
  },
  'frost-ice': {
    id: 'frost-ice',
    name: '프로스트 피크',
    subtitle: '얼어붙은 설원 빙판길',
    theme: '설원 (Snow & Ice)',
    difficulty: '★★★',
    length: '1.6 km',
    themeColor: '#67e8f9',
    description: '장애물 없는 광활한 설원 빙판 서킷',
    hazards: '미끄러운 노면',
  },
  'jungle-ruins': {
    id: 'jungle-ruins',
    name: '고대 정글 유적',
    subtitle: '탁 트인 정글 서킷',
    theme: '정글 (Jungle)',
    difficulty: '★★☆',
    length: '1.9 km',
    themeColor: '#22c55e',
    description: '장애물 없는 쾌적한 정글 유적 트랙',
    hazards: '연속 S자 커브',
  },
  'future-cyber': {
    id: 'future-cyber',
    name: '사이버 스페이스',
    subtitle: '홀로그램과 하이테크 미래 도시',
    theme: '사이버 (Cyber Future)',
    difficulty: '★★★★',
    length: '1.5 km',
    themeColor: '#06b6d4',
    description: '빛의 가속 패널이 가득한 미래형 광활한 트랙',
    hazards: '초고속 스피드 존',
  },
  'aurora-space': {
    id: 'aurora-space',
    name: '오로라 스타디움',
    subtitle: '우주 상공 오로라 궤도',
    theme: '우주 (Space)',
    difficulty: '★★★★',
    length: '2.0 km',
    themeColor: '#a855f7',
    description: '우주 공간에 장애물 없이 펼쳐진 오로라 서킷',
    hazards: '고속 코너링',
  },
};

function createRoadTexture(theme: TrackId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = theme === 'frost-ice' ? '#334e68' : theme === 'sunset-desert' ? '#45352c' : '#2d333b';
  ctx.fillRect(0, 0, 512, 1024);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, 0, 10, 1024);
  ctx.fillRect(478, 0, 10, 1024);
  ctx.fillStyle = '#fbbf24';
  for (let y = 0; y < 1024; y += 120) {
    ctx.fillRect(246, y, 6, 60);
    ctx.fillRect(260, y, 6, 60);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 45);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCurbTexture(theme: TrackId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = theme === 'frost-ice' ? '#0284c7' : '#ef4444';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 128, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 80);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function getTrackCurve(id: TrackId): THREE.CatmullRomCurve3 {
  let points: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(160, 0, -40),
    new THREE.Vector3(300, 0, 80),
    new THREE.Vector3(320, 0, 240),
    new THREE.Vector3(240, 0, 380),
    new THREE.Vector3(80, 0, 420),
    new THREE.Vector3(-100, 0, 400),
    new THREE.Vector3(-260, 0, 260),
    new THREE.Vector3(-290, 0, 100),
    new THREE.Vector3(-170, 0, -40),
  ];
  points.forEach((p) => (p.y = 0));
  return new THREE.CatmullRomCurve3(points, true, 'centripetal');
}

export function buildTrack(id: TrackId): TrackData {
  const curve = getTrackCurve(id);
  const trackWidth = 32;
  const curbWidth = 1.8;
  const segments = 400;
  const totalLength = curve.getLength();

  const roadPositions: number[] = [];
  const roadNormals: number[] = [];
  const roadUvs: number[] = [];
  const roadIndices: number[] = [];

  const curbPositions: number[] = [];
  const curbNormals: number[] = [];
  const curbUvs: number[] = [];
  const curbIndices: number[] = [];

  const checkpoints: Checkpoint[] = [];
  const numCheckpoints = 24;

  const points = curve.getSpacedPoints(segments);
  const railsMesh = new THREE.Group();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const tangent = curve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    if (i % Math.floor(segments / numCheckpoints) === 0 && checkpoints.length < numCheckpoints) {
      checkpoints.push({
        index: checkpoints.length,
        position: points[i].clone(),
        tangent: tangent.clone(),
        normal: normal.clone(),
        binormal: binormal.clone(),
        t,
      });
    }

    const p = points[i];
    const halfW = trackWidth / 2;
    const leftPt = p.clone().addScaledVector(binormal, -halfW);
    const rightPt = p.clone().addScaledVector(binormal, halfW);

    roadPositions.push(leftPt.x, 0.01, leftPt.z);
    roadPositions.push(rightPt.x, 0.01, rightPt.z);
    roadNormals.push(0, 1, 0);
    roadNormals.push(0, 1, 0);

    const vCoord = (i / segments) * 55;
    roadUvs.push(0, vCoord);
    roadUvs.push(1, vCoord);

    const leftCurbOuter = leftPt.clone().addScaledVector(binormal, -curbWidth);
    const rightCurbOuter = rightPt.clone().addScaledVector(binormal, curbWidth);

    curbPositions.push(leftCurbOuter.x, 0.02, leftCurbOuter.z);
    curbPositions.push(leftPt.x, 0.02, leftPt.z);
    curbPositions.push(rightPt.x, 0.02, rightPt.z);
    curbPositions.push(rightCurbOuter.x, 0.02, rightCurbOuter.z);

    curbNormals.push(0, 1, 0);
    curbNormals.push(0, 1, 0);
    curbNormals.push(0, 1, 0);
    curbNormals.push(0, 1, 0);

    curbUvs.push(0, vCoord * 2);
    curbUvs.push(1, vCoord * 2);
    curbUvs.push(0, vCoord * 2);
    curbUvs.push(1, vCoord * 2);
  }

  for (let i = 0; i < segments; i++) {
    const nextI = (i + 1) % (segments + 1);
    const i0 = i * 2;
    const i1 = i * 2 + 1;
    const i2 = nextI * 2;
    const i3 = nextI * 2 + 1;

    roadIndices.push(i0, i1, i2);
    roadIndices.push(i1, i3, i2);

    const c0 = i * 4;
    const c1 = i * 4 + 1;
    const c2 = i * 4 + 2;
    const c3 = i * 4 + 3;
    const nc0 = nextI * 4;
    const nc1 = nextI * 4 + 1;
    const nc2 = nextI * 4 + 2;
    const nc3 = nextI * 4 + 3;

    curbIndices.push(c0, c1, nc0);
    curbIndices.push(c1, nc1, nc0);
    curbIndices.push(c2, c3, nc2);
    curbIndices.push(c3, nc3, nc2);
  }

  const roadGeom = new THREE.BufferGeometry();
  roadGeom.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
  roadGeom.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
  roadGeom.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
  roadGeom.setIndex(roadIndices);

  const roadTex = createRoadTexture(id);
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.6,
    metalness: 0.2,
  });
  const roadMesh = new THREE.Mesh(roadGeom, roadMat);
  roadMesh.receiveShadow = true;

  const curbGeom = new THREE.BufferGeometry();
  curbGeom.setAttribute('position', new THREE.Float32BufferAttribute(curbPositions, 3));
  curbGeom.setAttribute('normal', new THREE.Float32BufferAttribute(curbNormals, 3));
  curbGeom.setAttribute('uv', new THREE.Float32BufferAttribute(curbUvs, 2));
  curbGeom.setIndex(curbIndices);

  const curbTex = createCurbTexture(id);
  const curbMat = new THREE.MeshStandardMaterial({
    map: curbTex,
    roughness: 0.5,
  });
  const curbsMesh = new THREE.Mesh(curbGeom, curbMat);
  curbsMesh.receiveShadow = true;

  const startP = curve.getPointAt(0);
  const startT = curve.getTangentAt(0);
  const startB = new THREE.Vector3(0, 1, 0).cross(startT).normalize();

  const startLineCanvas = document.createElement('canvas');
  startLineCanvas.width = 256;
  startLineCanvas.height = 64;
  const sCtx = startLineCanvas.getContext('2d')!;
  for (let x = 0; x < 256; x += 32) {
    for (let y = 0; y < 64; y += 32) {
      sCtx.fillStyle = (x / 32 + y / 32) % 2 === 0 ? '#ffffff' : '#111827';
      sCtx.fillRect(x, y, 32, 32);
    }
  }
  const startLineTex = new THREE.CanvasTexture(startLineCanvas);
  startLineTex.colorSpace = THREE.SRGBColorSpace;
  const startLineMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(trackWidth, 3.5),
    new THREE.MeshStandardMaterial({ map: startLineTex, polygonOffset: true, polygonOffsetFactor: -1 })
  );
  startLineMesh.position.copy(startP).add(new THREE.Vector3(0, 0.04, 0));
  startLineMesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), startB);
  startLineMesh.rotateX(-Math.PI / 2);

  railsMesh.add(startLineMesh);

  const speedPads: SpeedPad[] = [];
  const speedPadCanvas = document.createElement('canvas');
  speedPadCanvas.width = 256;
  speedPadCanvas.height = 256;
  const spCtx = speedPadCanvas.getContext('2d')!;
  spCtx.fillStyle = '#0f172a';
  spCtx.fillRect(0, 0, 256, 256);
  spCtx.strokeStyle = '#06b6d4';
  spCtx.lineWidth = 26;
  for (let i = 0; i < 3; i++) {
    const y = 80 + i * 55;
    spCtx.beginPath();
    spCtx.moveTo(60, y + 25);
    spCtx.lineTo(128, y - 25);
    spCtx.lineTo(196, y + 25);
    spCtx.stroke();
  }
  const speedPadTex = new THREE.CanvasTexture(speedPadCanvas);
  speedPadTex.colorSpace = THREE.SRGBColorSpace;
  const speedPadMat = new THREE.MeshBasicMaterial({ map: speedPadTex, transparent: true, opacity: 0.95 });

  [0.15, 0.42, 0.68, 0.88].forEach((t) => {
    const pt = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const padMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 8.0), speedPadMat);
    padMesh.position.copy(pt).add(new THREE.Vector3(0, 0.05, 0));
    padMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
    padMesh.rotateX(-Math.PI / 2);
    speedPads.push({ position: pt.clone(), rotation: padMesh.rotation.clone(), mesh: padMesh });
    railsMesh.add(padMesh);
  });

  const itemBoxes: ItemBox[] = [];
  [0.08, 0.28, 0.55, 0.78].forEach((t, i) => {
    const pt = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const bin = new THREE.Vector3(0, 1, 0).cross(tan).normalize();
    [-8, 0, 8].forEach((offset, idx) => {
      const boxPos = pt.clone().addScaledVector(bin, offset).add(new THREE.Vector3(0, 1.4, 0));
      const boxGroup = new THREE.Group();
      boxGroup.position.copy(boxPos);

      const outerMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
        transmission: 0.6,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const outerCube = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), outerMat);
      const innerCube = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.9),
        new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true })
      );
      boxGroup.add(outerCube, innerCube);
      railsMesh.add(boxGroup);

      itemBoxes.push({
        id: `box_${i}_${idx}`,
        position: boxPos,
        mesh: boxGroup,
        active: true,
        respawnTime: 0,
      });
    });
  });

  const sceneryGroup = new THREE.Group();
  let skyColor = 0x1e293b;
  let groundColor = 0x1e293b;

  if (id === 'sunset-desert') {
    skyColor = 0xfdba74;
    groundColor = 0xc2410c;
  } else if (id === 'frost-ice') {
    skyColor = 0x93c5fd;
    groundColor = 0xf8fafc;
  } else if (id === 'jungle-ruins') {
    skyColor = 0x4ade80;
    groundColor = 0x15803d;
  } else if (id === 'aurora-space') {
    skyColor = 0x1e1b4b;
    groundColor = 0x0f172a;
  } else if (id === 'future-cyber') {
    skyColor = 0x0f172a;
    groundColor = 0x0f172a;
  }

  const groundGeom = new THREE.PlaneGeometry(2000, 2000, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: groundColor,
    roughness: 0.95,
  });
  const groundMesh = new THREE.Mesh(groundGeom, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, -0.05, 160);
  groundMesh.receiveShadow = true;

  const startPosition = curve.getPointAt(0).add(new THREE.Vector3(0, 0.4, 0));
  const startDirection = curve.getTangentAt(0).normalize();

  return {
    id,
    name: TRACK_METADATA[id].name,
    theme: TRACK_METADATA[id].theme,
    curve,
    roadMesh,
    curbsMesh,
    railsMesh,
    sceneryGroup,
    checkpoints,
    speedPads,
    itemBoxes,
    startPosition,
    startDirection,
    trackWidth,
    totalLength,
    skyColor,
    fogColor: skyColor,
    ambientColor: skyColor,
    sunColor: 0xffffff,
    sunPosition: new THREE.Vector3(150, 220, 100),
    groundMesh,
    frictionMultiplier: 1.0,
  };
}
