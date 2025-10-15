import { Character } from '@/characters/Character';
import { Skill } from './Skill';

/**
 * AI 행동 타입
 */
export type AIActionType = 'attack' | 'skill' | 'defend';

/**
 * AI가 결정한 행동
 */
export interface AIAction {
  /** 행동 타입 */
  type: AIActionType;
  /** 사용할 스킬 (type이 'skill'일 때만) */
  skill?: Skill;
  /** 대상 캐릭터 */
  target: Character;
}

/**
 * 적 AI 클래스
 * 적의 행동을 상황에 맞게 결정합니다.
 */
export class EnemyAI {
  /**
   * 적의 다음 행동을 결정합니다
   * 
   * 판단 로직:
   * 1. HP < 30% && 힐 스킬 보유 → 힐 사용
   * 2. MP 충분 && 공격 스킬 보유 → 스킬 사용 (50% 확률)
   * 3. 그 외 → 기본 공격
   * 
   * @param enemy 적 캐릭터
   * @param targets 대상 캐릭터 목록 (보통 플레이어)
   * @returns 결정된 행동
   */
  decideAction(enemy: Character, targets: Character[]): AIAction {
    // HP가 낮고 힐 스킬이 있으면 회복
    const healSkill = enemy.skills.find(
      skill => skill.targetType === 'self' &&
        skill.effects.some(e => e.type === 'heal') &&
        skill.canUse(enemy)
    );

    if (healSkill && enemy.hp < enemy.maxHp * 0.3) {
      return {
        type: 'skill',
        skill: healSkill,
        target: enemy,
      };
    }

    // 공격 스킬 사용 시도 (50% 확률)
    const attackSkills = enemy.skills.filter(
      skill => skill.targetType === 'single-enemy' && skill.canUse(enemy)
    );

    if (attackSkills.length > 0 && Math.random() < 0.5) {
      // 랜덤 스킬 선택
      const randomSkill = attackSkills[Math.floor(Math.random() * attackSkills.length)];
      const target = this.selectTarget(targets);

      return {
        type: 'skill',
        skill: randomSkill,
        target,
      };
    }

    // 기본 공격
    return {
      type: 'attack',
      target: this.selectTarget(targets),
    };
  }

  /**
   * 대상을 선택합니다
   * 현재는 살아있는 캐릭터 중 HP가 가장 낮은 캐릭터를 선택
   * 
   * @param targets 대상 후보 목록
   * @returns 선택된 대상
   */
  private selectTarget(targets: Character[]): Character {
    const aliveTargets = targets.filter(t => t.isAlive());

    if (aliveTargets.length === 0) {
      return targets[0]; // fallback
    }

    // HP가 가장 낮은 대상 선택
    return aliveTargets.reduce((lowest, current) =>
      current.hp < lowest.hp ? current : lowest
    );
  }
}

