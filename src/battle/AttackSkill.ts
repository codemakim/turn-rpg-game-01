import { Skill } from './Skill';

/**
 * 기본 공격 스킬 생성 유틸리티
 */
export class AttackSkill {
  /**
   * 기본 공격 스킬을 생성합니다
   * @returns 기본 공격 스킬
   */
  public static createBasicAttack(): Skill {
    return new Skill({
      id: 'basic-attack',
      name: '공격',
      description: '기본 공격',
      mpCost: 0,
      targetType: 'single-enemy',
      effects: [{ type: 'damage', value: 0 }] // DamageCalculator에서 실제 데미지 계산
    });
  }

  /**
   * 강화된 공격 스킬을 생성합니다
   * @returns 강화된 공격 스킬
   */
  public static createStrongAttack(): Skill {
    return new Skill({
      id: 'strong-attack',
      name: '강화 공격',
      description: '강화된 공격',
      mpCost: 5,
      targetType: 'single-enemy',
      effects: [{ type: 'damage', value: 0 }] // DamageCalculator에서 실제 데미지 계산
    });
  }
}
