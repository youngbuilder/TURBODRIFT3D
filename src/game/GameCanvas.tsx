/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sound } from './audio';
import { buildProceduralCar, updateCarVisuals, CarVisuals } from './carModel';
import { BotRacer, PhysicsEngine, VehicleInput, VehicleState } from './physics';
import { buildTrack } from './tracks';
import { AIDifficulty, CarCustomization, GameMode, PeerCarState, PlayerInfo, TrackId } from '../types/game';

interface GameCanvasProps {
  trackId: TrackId;
  totalLaps: number;
  aiBotsCount: number;
  aiDifficulty?: AIDifficulty;
  gameMode?: GameMode;
  playerInfo: PlayerInfo;
  peerPlayers: Map<string, PlayerInfo>;
  peerStatesRef: React.MutableRefObject<Map<string, PeerCarState>>;
  onStateUpdate: (state: VehicleState) => void;
  onSendCarUpdate: (update: any) => void;
  onFinishRace: (finishTime: number) => void;
  onItemUsed: (type: string, position: THREE.Vector3) => void;
  cameraMode: number;
  onCycleCamera: () => void;
  touchControls?: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    drift: boolean;
    item: boolean;
  };
  isRacing?: boolean;
  quality: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  trackId,
  totalLaps,
  aiBotsCount,
  aiDifficulty = 'medium',
  gameMode = 'solo',
  playerInfo,
  peerPlayers,
  peerStatesRef,
  onStateUpdate,
  onSendCarUpdate,
  onFinishRace,
  onItemUsed,
  cameraMode,
  onCycleCamera,
  touchControls,
  isRacing = true,
  quality,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const playerStateRef = useRef<VehicleState | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraModeRef = useRef<number>(cameraMode);
  cameraModeRef.current = cameraMode;
  const isRacingRef = useRef<boolean>(isRacing);
  isRacingRef.current = isRacing;

  const inputRef = useRef<VehicleInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    drift: false,
    useItem: false,
  });

  useEffect(() => {
    if (rendererRef.current) {
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2) * (quality / 100));
        rendererRef.current.shadowMap.enabled = quality > 50;
    }
  }, [quality]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      sound.resume();
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inputRef.current.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = true;
      if (e.key === ' ' || e.key === 'Shift') inputRef.current.drift = true;
      if (e.key === 'f' || e.key === 'F' || e.key === 'e' || e.key === 'E') inputRef.current.useItem = true;
      if (e.key === 'c' || e.key === 'C') onCycleCamera();
      if (e.key === 'r' || e.key === 'R') {
        if (playerStateRef.current) {
          playerStateRef.current.speedKmh = 0;
          playerStateRef.current.isSpinning = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inputRef.current.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = false;
      if (e.key === ' ' || e.key === 'Shift') inputRef.current.drift = false;
      if (e.key === 'f' || e.key === 'F' || e.key === 'e' || e.key === 'E') inputRef.current.useItem = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onCycleCamera]);

  useEffect(() => {
    if (touchControls) {
      inputRef.current.forward = touchControls.forward;
      inputRef.current.backward = touchControls.backward;
      inputRef.current.left = touchControls.left;
      inputRef.current.right = touchControls.right;
      inputRef.current.drift = touchControls.drift;
      if (touchControls.item) inputRef.current.useItem = true;
    }
  }, [touchControls]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth || window.innerWidth || 800, 320);
    const height = Math.max(container.clientHeight || window.innerHeight || 600, 240);

    const scene = new THREE.Scene();
    const track = buildTrack(trackId);
    scene.background = new THREE.Color(track.skyColor);
    scene.fog = new THREE.FogExp2(track.fogColor, 0.0018);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.2, 900);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * (quality / 100));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = quality > 50;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.HemisphereLight(track.sunColor, track.skyColor, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(track.sunColor, 2.4);
    sunLight.position.copy(track.sunPosition);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 650;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    scene.add(track.roadMesh);
    scene.add(track.curbsMesh);
    scene.add(track.railsMesh);
    scene.add(track.sceneryGroup);
    scene.add(track.groundMesh);

    const playerCustom: CarCustomization = {
      model: playerInfo.carModel,
      color: playerInfo.carColor,
      accentColor: playerInfo.accentColor,
      neonColor: playerInfo.neonColor,
    };
    const playerVisuals = buildProceduralCar(playerCustom);
    scene.add(playerVisuals.group);

    const playerState = PhysicsEngine.initPlayerState(
      track.startPosition,
      track.startDirection,
      0,
      playerInfo.carModel
    );
    playerStateRef.current = playerState;
    playerVisuals.group.position.copy(playerState.position);
    playerVisuals.group.quaternion.copy(playerState.quaternion);

    const peerVisualsMap = new Map<string, CarVisuals>();
    const bots = PhysicsEngine.initBots(aiBotsCount, track, aiDifficulty, gameMode);
    const botVisualsMap = new Map<string, CarVisuals>();

    bots.forEach((bot) => {
      const botCustom: CarCustomization = {
        model: bot.carModel,
        color: bot.carColor,
        accentColor: bot.accentColor,
        neonColor: bot.neonColor,
      };
      const bVis = buildProceduralCar(botCustom);
      bVis.group.position.copy(bot.position);
      bVis.group.quaternion.copy(bot.quaternion);
      scene.add(bVis.group);
      botVisualsMap.set(bot.id, bVis);
    });

    const activeTrapMeshes: THREE.Mesh[] = [];
    const cameraTarget = new THREE.Vector3();
    const cameraPos = new THREE.Vector3();
    let smoothedCamPos = track.startPosition.clone().add(new THREE.Vector3(0, 3, -6));
    let smoothedCamTarget = track.startPosition.clone();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || container.clientWidth || window.innerWidth;
        const h = entry.contentRect.height || container.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    ro.observe(container);

    let lastNetworkSync = 0;
    const clock = new THREE.Clock();
    renderer.compile(scene, camera);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(0.05, clock.getDelta());
      const now = performance.now();

      if (inputRef.current.useItem && playerState.currentItem) {
        inputRef.current.useItem = false;
        const used = PhysicsEngine.useItem(playerState);
        if (used) {
          onItemUsed(used.type, used.position);
          if (used.type === 'trap') {
            const trapMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(1.2, 1.2, 0.3, 16),
              new THREE.MeshStandardMaterial({
                color: 0xef4444,
                emissive: 0xef4444,
                emissiveIntensity: 1.5,
              })
            );
            trapMesh.position.copy(used.position).add(new THREE.Vector3(0, 0.15, 0));
            scene.add(trapMesh);
            activeTrapMeshes.push(trapMesh);
          }
        }
      }

      if (isRacingRef.current) {
        PhysicsEngine.updatePlayer(playerState, inputRef.current, delta, track, totalLaps);
      }

      activeTrapMeshes.forEach((trap, idx) => {
        if (playerState.position.distanceTo(trap.position) < 2.0 && !playerState.isSpinning) {
          PhysicsEngine.hitVehicle(playerState);
          scene.remove(trap);
          activeTrapMeshes.splice(idx, 1);
        }
      });

      if (playerState.isFinished && playerState.finishTime && !playerState.rank) {
        onFinishRace(playerState.finishTime);
      }

      playerVisuals.group.position.copy(playerState.position);
      playerVisuals.group.quaternion.copy(playerState.quaternion);
      updateCarVisuals(
        playerVisuals,
        playerState.steerAngle,
        playerState.wheelRotation,
        playerState.isBoosting,
        playerState.isDrifting
      );

      sound.updateEngine(Math.abs(playerState.speedKmh), inputRef.current.forward);
      sound.updateDrift(playerState.isDrifting, Math.abs(playerState.steerAngle));

      if (isRacingRef.current) {
        PhysicsEngine.updateBots(bots, delta, track, totalLaps);
      }

      bots.forEach((bot) => {
        const bVis = botVisualsMap.get(bot.id);
        if (bVis) {
          bVis.group.position.copy(bot.position);
          bVis.group.quaternion.copy(bot.quaternion);
          updateCarVisuals(bVis, 0, bot.wheelRotation, bot.isBoosting, false);
        }
      });

      peerPlayers.forEach((peer, peerId) => {
        let pVis = peerVisualsMap.get(peerId);
        if (!pVis) {
          const peerCustom: CarCustomization = {
            model: peer.carModel,
            color: peer.carColor,
            accentColor: peer.accentColor,
            neonColor: peer.neonColor,
          };
          pVis = buildProceduralCar(peerCustom);
          scene.add(pVis.group);
          peerVisualsMap.set(peerId, pVis);
        }
        const peerData = peerStatesRef.current.get(peerId);
        if (peerData) {
          const targetPos = new THREE.Vector3(peerData.x, peerData.y, peerData.z);
          pVis.group.position.lerp(targetPos, 0.35);
          const targetRot = new THREE.Euler(peerData.rotX, peerData.rotY, peerData.rotZ);
          const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
          pVis.group.quaternion.slerp(targetQuat, 0.35);
          updateCarVisuals(pVis, peerData.steer, 0, peerData.boosting, peerData.drifting);
        }
      });

      peerVisualsMap.forEach((vis, id) => {
        if (!peerPlayers.has(id)) {
          scene.remove(vis.group);
          peerVisualsMap.delete(id);
        }
      });

      const allRacers = [
        { id: playerInfo.id, progress: playerState.totalProgress },
        ...bots.map((b) => ({ id: b.id, progress: b.totalProgress })),
        ...Array.from(peerPlayers.values()).map((p) => ({ id: p.id, progress: p.progress })),
      ];
      allRacers.sort((a, b) => b.progress - a.progress);
      playerState.rank = allRacers.findIndex((r) => r.id === playerInfo.id) + 1;

      const currentCamMode = cameraModeRef.current;
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(playerState.quaternion);
      const up = new THREE.Vector3(0, 1, 0);

      if (playerState.isFinished && currentCamMode === 4) {
        cameraPos.copy(track.startPosition).add(new THREE.Vector3(0, 5, -12));
        cameraTarget.copy(track.startPosition).add(new THREE.Vector3(0, 1, 15));
      } else if (currentCamMode === 0) {
        const distBehind = playerState.isBoosting ? 8.2 : 7.2;
        const heightAbove = 3.2;
        cameraPos.copy(playerState.position).addScaledVector(forward, -distBehind).addScaledVector(up, heightAbove);
        cameraTarget.copy(playerState.position).addScaledVector(forward, 6.0).addScaledVector(up, 1.2);
        const targetFov = playerState.isBoosting ? 76 : 64;
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 6, delta);
        camera.updateProjectionMatrix();
      } else if (currentCamMode === 1) {
        cameraPos.copy(playerState.position).addScaledVector(forward, -4.8).addScaledVector(up, 2.0);
        cameraTarget.copy(playerState.position).addScaledVector(forward, 8.0).addScaledVector(up, 1.0);
      } else if (currentCamMode === 2) {
        cameraPos.copy(playerState.position).addScaledVector(forward, 0.4).addScaledVector(up, 0.85);
        cameraTarget.copy(playerState.position).addScaledVector(forward, 25.0).addScaledVector(up, 0.5);
      } else {
        cameraPos.copy(playerState.position).addScaledVector(forward, -12.0).addScaledVector(up, 18.0);
        cameraTarget.copy(playerState.position);
      }

      smoothedCamPos.lerp(cameraPos, 0.14);
      smoothedCamTarget.lerp(cameraTarget, 0.18);
      camera.position.copy(smoothedCamPos);
      camera.lookAt(smoothedCamTarget);

      if (now - lastNetworkSync > 35) {
        lastNetworkSync = now;
        const euler = new THREE.Euler().setFromQuaternion(playerState.quaternion);
        onSendCarUpdate({
          x: Number(playerState.position.x.toFixed(2)),
          y: Number(playerState.position.y.toFixed(2)),
          z: Number(playerState.position.z.toFixed(2)),
          rotX: Number(euler.x.toFixed(2)),
          rotY: Number(euler.y.toFixed(2)),
          rotZ: Number(euler.z.toFixed(2)),
          speed: Math.round(playerState.speedKmh),
          steer: Number(playerState.steerAngle.toFixed(2)),
          drifting: playerState.isDrifting,
          boosting: playerState.isBoosting,
          lap: playerState.currentLap,
          checkpoint: playerState.currentCheckpoint,
          progress: Number(playerState.totalProgress.toFixed(3)),
        });
      }

      onStateUpdate(playerState);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
      renderer.dispose();
      sound.updateEngine(0, false);
      sound.updateDrift(false);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [trackId, totalLaps, aiBotsCount, aiDifficulty, gameMode, playerInfo]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};
