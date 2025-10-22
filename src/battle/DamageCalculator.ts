/**
 * 데미지 계산에 필요한 매개변수
 */
export interface DamageParams {
  /** 공격력 */
  attack: number;
  /** 방어력 */
  defense: number;
  /** 스킬 배율 (기본값: 1.0) */
  skillPower?: number;
  /** 크리티컬 확률 0~1 (선택) */
  criticalRate?: number;
  /** 크리티컬 강제 발동 여부 (테스트용, 선택) */
  isCritical?: boolean;
}

/**
 * 데미지 계산 결과
 */
export interface DamageResult {
  /** 최종 데미지 */
  damage: number;
  /** 크리티컬 발생 여부 */
  isCritical: boolean;
}

/**
 * 데미지를 계산합니다
 * 공식: (공격력 × 스킬배율) - 방어력
 * 크리티컬 발생 시 1.5배
 * 최소 데미지 1 보장
 * 
 * @param params 데미지 계산 매개변수
 * @returns 계산된 데미지와 크리티컬 여부
 */
export function calculateDamage(params: DamageParams): DamageResult {
  const skillPower = params.skillPower ?? 100; // 기본값 100 (100%)

  // 크리티컬 판정
  let isCritical = params.isCritical ?? false;
  if (!isCritical && params.criticalRate !== undefined) {
    isCritical = Math.random() < params.criticalRate;
  }

  // 기본 데미지 계산: (공격력 * 스킬배율 / 100) - 방어력
  let damage = Math.floor((params.attack * skillPower) / 100) - params.defense;

  // 크리티컬이면 150% (1.5배)
  if (isCritical) {
    damage = Math.floor((damage * 150) / 100);
  }

  // 최소 데미지 1 보장
  damage = Math.max(1, Math.floor(damage));

  return {
    damage,
    isCritical,
  };
}

