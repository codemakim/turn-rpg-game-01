import { Skill } from '@/battle/Skill';
import skillData from './skills/all-skills.json';
import type { SkillData, SkillDataCollection, SkillCategory, SkillRarity } from './types/SkillTypes';

/**
 * 스킬 중앙 관리 시스템
 * 모든 스킬 데이터를 통합 관리하고 조회 기능을 제공
 */
export class SkillRegistry {
  private static skills: Map<string, Skill> = new Map();
  private static initialized = false;
  private static skillDataCollection: SkillDataCollection = skillData as SkillDataCollection;

  /**
   * 스킬 데이터 초기화
   */
  private static initialize(): void {
    if (this.initialized) return;

    // JSON 데이터를 Skill 객체로 변환하여 저장
    Object.values(this.skillDataCollection.skills).forEach((skillData: SkillData) => {
      const skill = new Skill({
        id: skillData.id,
        name: skillData.name,
        description: skillData.description,
        mpCost: skillData.mpCost,
        targetType: skillData.targetType,
        effects: skillData.effects
      });
      this.skills.set(skillData.id, skill);
    });

    this.initialized = true;
  }

  /**
   * 모든 스킬을 반환합니다
   * @returns 모든 스킬 배열
   */
  public static getAllSkills(): Skill[] {
    this.initialize();
    return Array.from(this.skills.values());
  }

  /**
   * 스킬 ID로 스킬을 조회합니다
   * @param id 스킬 ID
   * @returns 스킬 객체 또는 null
   */
  public static getSkill(id: string): Skill | null {
    this.initialize();
    return this.skills.get(id) || null;
  }

  /**
   * 카테고리별 스킬을 조회합니다
   * @param category 스킬 카테고리
   * @returns 해당 카테고리의 스킬 배열
   */
  public static getSkillsByCategory(category: SkillCategory): Skill[] {
    this.initialize();
    return Array.from(this.skills.values()).filter(skill => {
      const skillDataItem = this.skillDataCollection.skills[skill.id];
      return skillDataItem && skillDataItem.category === category;
    });
  }

  /**
   * 희귀도별 스킬을 조회합니다
   * @param rarity 스킬 희귀도
   * @returns 해당 희귀도의 스킬 배열
   */
  public static getSkillsByRarity(rarity: SkillRarity): Skill[] {
    this.initialize();
    return Array.from(this.skills.values()).filter(skill => {
      const skillDataItem = this.skillDataCollection.skills[skill.id];
      return skillDataItem && skillDataItem.rarity === rarity;
    });
  }

  /**
   * 스킬이 존재하는지 확인합니다
   * @param id 스킬 ID
   * @returns 스킬 존재 여부
   */
  public static hasSkill(id: string): boolean {
    this.initialize();
    return this.skills.has(id);
  }

  /**
   * 스킬 개수를 반환합니다
   * @returns 스킬 총 개수
   */
  public static getSkillCount(): number {
    this.initialize();
    return this.skills.size;
  }
}
