/**
 * 캐릭터 관련 타입 정의
 */

/**
 * 캐릭터 기본 스탯 인터페이스
 */
export interface CharacterStats {
  /** 캐릭터 이름 */
  name: string;
  /** 현재 체력 */
  hp: number;
  /** 최대 체력 (선택, 기본값: hp) */
  maxHp?: number;
  /** 현재 마나 */
  mp: number;
  /** 최대 마나 (선택, 기본값: mp) */
  maxMp?: number;
  /** 공격력 */
  attack: number;
  /** 방어력 */
  defense: number;
  /** 속도 */
  speed: number;
  /** 스킬 목록 */
  skills: any[]; // Skill[]로 나중에 수정
}

/**
 * 캐릭터 위치 정보
 */
export interface CharacterPosition {
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
}

/**
 * 캐릭터 상태
 */
export type CharacterStatus = 'alive' | 'dead' | 'stunned' | 'poisoned' | 'buffed' | 'debuffed';

/**
 * 캐릭터 타입
 */
export type CharacterType = 'hero' | 'enemy' | 'neutral';

/**
 * 캐릭터 팀
 */
export type CharacterTeam = 'heroes' | 'enemies';
