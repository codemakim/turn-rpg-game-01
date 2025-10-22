import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';
import { SkillRegistry } from '@/data/SkillRegistry';

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
          SkillRegistry.getSkill('fireball')!,
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
          SkillRegistry.getSkill('goblin-attack')!,
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
      SkillRegistry.getSkill('strong-attack')!,
      SkillRegistry.getSkill('heal')!,
    ];
  }

  /**
   * 적용 스킬들을 생성합니다
   * @returns 생성된 적 스킬 배열
   */
  private createEnemySkills(): Skill[] {
    return [
      SkillRegistry.getSkill('slime-attack')!,
    ];
  }
}
