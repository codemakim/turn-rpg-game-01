import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';

/**
 * 전투용 캐릭터 및 스킬 생성 팩토리
 * 캐릭터 데이터 생성 로직을 담당
 */
export class BattleCharacterFactory {
  /**
   * 아군 캐릭터들을 생성합니다
   * @returns 생성된 아군 캐릭터 배열
   */
  public createHeroes(): Character[] {
    const heroSkills = this.createHeroSkills();

    return [
      new Character({
        name: '용사',
        hp: 120,
        mp: 60,
        attack: 35,
        defense: 12,
        speed: 18,
        skills: heroSkills,
      }),
      new Character({
        name: '마법사',
        hp: 80,
        mp: 100,
        attack: 25,
        defense: 8,
        speed: 15,
        skills: [
          new Skill({
            id: 'fireball',
            name: '파이어볼',
            description: '화염 구체 공격',
            mpCost: 20,
            targetType: 'single-enemy',
            effects: [{ type: 'damage', value: 200 }], // 200% 공격력
          }),
        ],
      }),
    ];
  }

  /**
   * 적 캐릭터들을 생성합니다
   * @returns 생성된 적 캐릭터 배열
   */
  public createEnemies(): Character[] {
    const enemySkills = this.createEnemySkills();

    return [
      new Character({
        name: '슬라임',
        hp: 80,
        mp: 20,
        attack: 20,
        defense: 8,
        speed: 12,
        skills: enemySkills,
      }),
      new Character({
        name: '고블린',
        hp: 60,
        mp: 15,
        attack: 25,
        defense: 6,
        speed: 16,
        skills: [
          new Skill({
            id: 'goblin-attack',
            name: '고블린 슬래시',
            description: '빠른 베기 공격',
            mpCost: 8,
            targetType: 'single-enemy',
            effects: [{ type: 'damage', value: 150 }], // 150% 공격력
          }),
        ],
      }),
    ];
  }

  /**
   * 아군용 스킬들을 생성합니다
   * @returns 생성된 아군 스킬 배열
   */
  private createHeroSkills(): Skill[] {
    return [
      new Skill({
        id: 'strong-attack',
        name: '강타',
        description: '강력한 공격',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 180 }], // 180% 공격력
      }),
      new Skill({
        id: 'heal',
        name: '힐',
        description: '체력 회복',
        mpCost: 15,
        targetType: 'self',
        effects: [{ type: 'heal', value: 30 }],
      }),
    ];
  }

  /**
   * 적용 스킬들을 생성합니다
   * @returns 생성된 적 스킬 배열
   */
  private createEnemySkills(): Skill[] {
    return [
      new Skill({
        id: 'slime-attack',
        name: '슬라임 독침',
        description: '독이 묻은 공격',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 160 }], // 160% 공격력
      }),
    ];
  }
}
