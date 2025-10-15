import { Skill, SkillData } from '@/battle/Skill';

export class SkillLoader {
  private static skills: Map<string, Skill> = new Map();

  static async loadSkills(): Promise<void> {
    try {
      const response = await fetch('/data/skills.json');
      const skillsData: SkillData[] = await response.json();

      skillsData.forEach(data => {
        const skill = new Skill(data);
        this.skills.set(skill.id, skill);
      });
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  }

  static getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  static getSkillsByIds(ids: string[]): Skill[] {
    return ids
      .map(id => this.getSkill(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  static getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }
}

