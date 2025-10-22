/**
 * 스킬 관련 타입 정의
 */

/**
 * 스킬 효과 타입
 */
export type SkillEffectType = 'damage' | 'heal' | 'buff' | 'debuff';

/**
 * 스킬 효과 인터페이스
 */
export interface SkillEffect {
  /** 효과 타입 */
  type: SkillEffectType;
  /** 효과 값 */
  value: number;
}

/**
 * 스킬 타겟 타입
 */
export type SkillTargetType = 'single-enemy' | 'all-enemies' | 'single-ally' | 'all-allies' | 'self';

/**
 * 스킬 카테고리
 */
export type SkillCategory = 'physical' | 'magic' | 'poison' | 'healing' | 'buff' | 'debuff';

/**
 * 스킬 희귀도
 */
export type SkillRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * 스킬 데이터 인터페이스 (JSON에서 로드)
 */
export interface SkillData {
  /** 스킬 ID */
  id: string;
  /** 스킬 이름 */
  name: string;
  /** 스킬 설명 */
  description: string;
  /** MP 소모량 */
  mpCost: number;
  /** 타겟 타입 */
  targetType: SkillTargetType;
  /** 스킬 효과 배열 */
  effects: SkillEffect[];
  /** 스킬 카테고리 */
  category: SkillCategory;
  /** 스킬 희귀도 */
  rarity: SkillRarity;
}

/**
 * 스킬 데이터 컬렉션 인터페이스
 */
export interface SkillDataCollection {
  skills: Record<string, SkillData>;
}
