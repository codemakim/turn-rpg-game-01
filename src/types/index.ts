/**
 * 통합 타입 인덱스
 * 모든 타입 정의를 한 곳에서 관리
 */

// 스킬 관련 타입
export * from '../data/types/SkillTypes';

// 캐릭터 관련 타입
export * from './CharacterTypes';

// 전투 관련 타입
export * from './BattleTypes';

// UI 관련 타입
export * from './UITypes';

// 이벤트 타입들을 import
import type { BattleEventData, UIEventData, AnimationEventData } from './BattleTypes';

// 공통 타입들
export type GameEventType = keyof GameEvents;

/**
 * 모든 게임 이벤트 데이터 타입
 */
export interface GameEvents extends BattleEventData, UIEventData, AnimationEventData { }
