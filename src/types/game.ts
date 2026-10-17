/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CarModelType = 'sport' | 'bike' | 'sedan' | 'suv';
export type GameMode = 'solo' | 'team2' | 'team4';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type TeamId = 'red' | 'blue' | 'green' | 'yellow' | 'none';

export interface VehicleStats {
  id: CarModelType;
  name: string;
  nameEn: string;
  category: string;
  description: string;
  maxSpeed: number; // km/h
  acceleration: number;
  handling: number;
  driftPower: number;
  offroadGrip: number;
  weight: number;
}

export const VEHICLE_CONFIGS: Record<CarModelType, VehicleStats> = {
  sport: {
    id: 'sport',
    name: '스포츠카',
    nameEn: 'Sports Car',
    category: '고속 드리프트형',
    description: '최고 속도와 칼바람 드리프트가 특기인 머신',
    maxSpeed: 210,
    acceleration: 90,
    handling: 0.55,
    driftPower: 1.3,
    offroadGrip: 0.5,
    weight: 1.2,
  },
  bike: {
    id: 'bike',
    name: '오토바이',
    nameEn: 'Superbike',
    category: '날렵한 코너링',
    description: '좁은 코너를 파고드는 극상의 코너링 성능',
    maxSpeed: 195,
    acceleration: 105,
    handling: 0.80,
    driftPower: 1.4,
    offroadGrip: 0.45,
    weight: 0.7,
  },
  sedan: {
    id: 'sedan',
    name: '세단',
    nameEn: 'Sedan',
    category: '안정 주행형',
    description: '균형 잡힌 핸들링과 안정적인 승차감',
    maxSpeed: 180,
    acceleration: 85,
    handling: 0.65,
    driftPower: 1.15,
    offroadGrip: 0.65,
    weight: 1.0,
  },
  suv: {
    id: 'suv',
    name: 'SUV',
    nameEn: 'SUV',
    category: '묵직한 파워형',
    description: '충돌에 강하고 험지 주파력이 뛰어난 대형 차량',
    maxSpeed: 172,
    acceleration: 80,
    handling: 0.65,
    driftPower: 1.1,
    offroadGrip: 0.85,
    weight: 1.6,
  },
};

export interface CarCustomization {
  model: CarModelType;
  color: string;
  accentColor: string;
  neonColor: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  carModel: CarModelType;
  carColor: string;
  accentColor: string;
  neonColor: string;
  isHost: boolean;
  isReady: boolean;
  team: TeamId;
  lap: number;
  checkpoint: number;
  progress: number;
  finished: boolean;
  finishTime: number;
  place: number;
}

export type TrackId =
  | 'city-downtown'
  | 'sunset-desert'
  | 'frost-ice'
  | 'jungle-ruins'
  | 'future-cyber'
  | 'aurora-space';

export interface TrackMetadata {
  id: TrackId;
  name: string;
  subtitle: string;
  theme: string;
  difficulty: '★☆☆' | '★★☆' | '★★★' | '★★★★';
  length: string;
  themeColor: string;
  description: string;
  hazards: string;
}

export interface RoomState {
  id: string;
  name: string;
  hostId: string;
  trackId: TrackId;
  laps: number;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  aiBotsCount: number;
  state: 'lobby' | 'countdown' | 'racing' | 'finished';
  players: PlayerInfo[];
}

export interface RoomSummary {
  id: string;
  name: string;
  hostName: string;
  trackId: TrackId;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerCount: number;
  maxPlayers: number;
  state: 'lobby' | 'racing';
}

export type ItemType = 'nitro' | 'shield' | 'trap' | 'rocket' | 'timeWarp';

export interface PeerCarState {
  playerId: string;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  speed: number;
  steer: number;
  drifting: boolean;
  boosting: boolean;
  lap: number;
  progress: number;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  emoji?: string;
  timestamp: number;
}
