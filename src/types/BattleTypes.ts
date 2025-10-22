/**
 * 전투 관련 타입 정의
 */

import type { Character } from '@/characters/Character';
import type { Skill } from '@/battle/Skill';

/**
 * 전투 상태
 */
export type BattleState = 'preparation' | 'in-progress' | 'victory' | 'defeat' | 'paused';

/**
 * 턴 상태
 */
export type TurnState = 'waiting' | 'player-turn' | 'enemy-turn' | 'processing';

/**
 * 전투 결과
 */
export interface BattleResult {
  /** 승리 여부 */
  victory: boolean;
  /** 전투 종료 이유 */
  reason: 'all-enemies-defeated' | 'all-heroes-defeated' | 'manual-exit';
  /** 전투 시간 (초) */
  duration: number;
  /** 경험치 획득 */
  experience: number;
  /** 골드 획득 */
  gold: number;
}

/**
 * 데미지 계산 파라미터
 */
export interface DamageParams {
  /** 공격자의 공격력 */
  attack: number;
  /** 방어자의 방어력 */
  defense: number;
  /** 스킬 배율 (기본값: 100) */
  skillPower?: number;
  /** 크리티컬 확률 (기본값: 0.1) */
  criticalRate?: number;
}

/**
 * 데미지 계산 결과
 */
export interface DamageResult {
  /** 최종 데미지 */
  damage: number;
  /** 크리티컬 여부 */
  isCritical: boolean;
}

/**
 * 스킬 사용 결과
 */
export interface SkillResult {
  /** 성공 여부 */
  success: boolean;
  /** 결과 메시지 */
  message: string;
  /** 효과 결과 배열 */
  effects?: SkillEffectResult[];
}

/**
 * 스킬 효과 결과
 */
export interface SkillEffectResult {
  /** 대상 캐릭터 이름 */
  target: string;
  /** 효과 타입 */
  type: 'damage' | 'heal' | 'buff' | 'debuff';
  /** 효과 값 */
  value: number;
  /** 결과 메시지 */
  message: string;
}

/**
 * 전투 이벤트 데이터 타입들
 */
export interface BattleEventData {
  'battle:turn-start': { actor: Character };
  'battle:turn-end': { actor: Character };
  'battle:damage': { target: Character; damage: number; isCritical: boolean };
  'battle:heal': { target: Character; amount: number };
  'battle:attack': { attacker: Character; target: Character; damage: number };
  'battle:skill': { caster: Character; skill: Skill; targets: Character[] };
  'battle:start-targeting': { caster: Character; skill: Skill };
  'battle:targeting-complete': { caster: Character; skill: Skill; targets: Character[] };
  'battle:targeting-cancel': {};
  'battle:battle-end': { result: BattleResult };
}

/**
 * UI 이벤트 데이터 타입들
 */
export interface UIEventData {
  'ui:button-click': { buttonId: string; data?: unknown };
  'ui:button-hover': { buttonId: string };
  'ui:button-out': { buttonId: string };
  'ui:character-hover': { character: Character };
  'ui:character-select': { character: Character };
  'ui:skill-select': { skill: Skill };
}

/**
 * 애니메이션 이벤트 데이터 타입들
 */
export interface AnimationEventData {
  'animation:damage': { target: Character; damage: number; isCritical: boolean };
  'animation:heal': { target: Character; amount: number };
  'animation:shake': { target: Character };
  'animation:flash': { target: Character; color: string };
}
