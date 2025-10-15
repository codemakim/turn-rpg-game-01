import { Character } from '@/characters/Character';

/**
 * 스킬의 대상 타입
 */
export type TargetType = 'single-enemy' | 'all-enemies' | 'single-ally' | 'all-allies' | 'self';

/**
 * 스킬 효과 타입
 */
export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff';

/**
 * 스킬 효과 정의
 */
export interface SkillEffect {
  /** 효과 타입 */
  type: EffectType;
  /** 효과 수치 (데미지량, 회복량 등) */
  value: number;
  /** 지속 시간 (턴 수, 선택, 향후 버프/디버프용) */
  duration?: number;
}

/**
 * 스킬 데이터 (JSON에서 로드되는 형식)
 */
export interface SkillData {
  /** 스킬 고유 ID */
  id: string;
  /** 스킬 이름 */
  name: string;
  /** 스킬 설명 */
  description: string;
  /** MP 소비량 */
  mpCost: number;
  /** 대상 타입 */
  targetType: TargetType;
  /** 효과 목록 */
  effects: SkillEffect[];
}

/**
 * 게임 스킬 클래스
 * MP를 소비하여 다양한 효과를 발동합니다.
 */
export class Skill {
  /** 스킬 고유 ID */
  public id: string;
  /** 스킬 이름 */
  public name: string;
  /** 스킬 설명 */
  public description: string;
  /** MP 소비량 */
  public mpCost: number;
  /** 대상 타입 */
  public targetType: TargetType;
  /** 효과 목록 */
  public effects: SkillEffect[];

  /**
   * 스킬을 생성합니다
   * @param data 스킬 데이터
   */
  constructor(data: SkillData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.mpCost = data.mpCost;
    this.targetType = data.targetType;
    this.effects = data.effects;
  }

  /**
   * 사용자가 이 스킬을 사용할 수 있는지 확인합니다
   * @param user 스킬을 사용할 캐릭터
   * @returns MP가 충분하고 살아있으면 true
   */
  canUse(user: Character): boolean {
    return user.mp >= this.mpCost && user.isAlive();
  }

  /**
   * 스킬을 사용합니다
   * @param user 스킬을 사용하는 캐릭터
   * @param targets 대상 캐릭터 배열
   * @returns 스킬 사용 결과 (성공 여부, 메시지, 효과 목록)
   */
  use(user: Character, targets: Character[]): SkillResult {
    if (!this.canUse(user)) {
      return {
        success: false,
        message: `${user.name}의 MP가 부족합니다!`,
        effects: [],
      };
    }

    // MP 소비
    user.mp = Math.max(0, user.mp - this.mpCost);

    const results: EffectResult[] = [];

    // 각 효과 적용
    this.effects.forEach(effect => {
      targets.forEach(target => {
        if (!target.isAlive() && effect.type !== 'heal') {
          return; // 죽은 대상은 힐 외 효과 무시
        }

        let effectResult: EffectResult;

        switch (effect.type) {
          case 'damage':
            target.takeDamage(effect.value);
            effectResult = {
              target: target.name,
              type: 'damage',
              value: effect.value,
              message: `${target.name}에게 ${effect.value} 데미지!`,
            };
            break;

          case 'heal':
            const healedAmount = Math.min(effect.value, target.maxHp - target.hp);
            target.heal(effect.value);
            effectResult = {
              target: target.name,
              type: 'heal',
              value: healedAmount,
              message: `${target.name}의 HP ${healedAmount} 회복!`,
            };
            break;

          default:
            effectResult = {
              target: target.name,
              type: effect.type,
              value: effect.value,
              message: `${target.name}에게 효과 적용!`,
            };
        }

        results.push(effectResult);
      });
    });

    return {
      success: true,
      message: `${user.name}의 ${this.name}!`,
      effects: results,
    };
  }
}

/**
 * 개별 효과의 적용 결과
 */
export interface EffectResult {
  /** 대상 이름 */
  target: string;
  /** 효과 타입 */
  type: EffectType;
  /** 효과 수치 */
  value: number;
  /** 결과 메시지 */
  message: string;
}

/**
 * 스킬 사용 결과
 */
export interface SkillResult {
  /** 스킬 사용 성공 여부 (MP 부족 시 false) */
  success: boolean;
  /** 결과 메시지 */
  message: string;
  /** 각 효과의 적용 결과 목록 */
  effects: EffectResult[];
}

