import { describe, it, expect, beforeEach } from 'vitest';
import { Skill } from './Skill';
import { Character } from '@/characters/Character';

describe('Skill', () => {
  let user: Character;
  let enemy: Character;
  let ally: Character;

  beforeEach(() => {
    user = new Character({
      name: 'Hero',
      hp: 100,
      mp: 50,
      attack: 20,
      defense: 10,
      speed: 15,
    });

    enemy = new Character({
      name: 'Slime',
      hp: 80,
      mp: 20,
      attack: 15,
      defense: 5,
      speed: 10,
    });

    ally = new Character({
      name: 'Ally',
      hp: 50,
      maxHp: 100,
      mp: 30,
      attack: 18,
      defense: 8,
      speed: 12,
    });
  });

  describe('스킬 생성', () => {
    it('스킬 데이터로 스킬을 생성할 수 있어야 함', () => {
      const skill = new Skill({
        id: 'fireball',
        name: '파이어볼',
        description: '강력한 화염 공격',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 150 }], // 150% 공격력
      });

      expect(skill.id).toBe('fireball');
      expect(skill.name).toBe('파이어볼');
      expect(skill.mpCost).toBe(10);
      expect(skill.targetType).toBe('single-enemy');
    });
  });

  describe('스킬 사용 가능 여부', () => {
    it('MP가 충분하면 사용 가능해야 함', () => {
      const skill = new Skill({
        id: 'heal',
        name: '힐',
        description: 'HP 회복',
        mpCost: 15,
        targetType: 'self',
        effects: [{ type: 'heal', value: 30 }],
      });

      expect(skill.canUse(user)).toBe(true);
    });

    it('MP가 부족하면 사용 불가능해야 함', () => {
      const skill = new Skill({
        id: 'mega-spell',
        name: '메가 스펠',
        description: '강력한 마법',
        mpCost: 100,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 100 }], // 100% 공격력
      });

      expect(skill.canUse(user)).toBe(false);
    });

    it('죽은 캐릭터는 스킬을 사용할 수 없어야 함', () => {
      user.takeDamage(100);

      const skill = new Skill({
        id: 'heal',
        name: '힐',
        description: 'HP 회복',
        mpCost: 15,
        targetType: 'self',
        effects: [{ type: 'heal', value: 30 }],
      });

      expect(skill.canUse(user)).toBe(false);
    });
  });

  describe('데미지 스킬', () => {
    it('데미지 스킬을 사용하면 대상의 HP가 감소해야 함', () => {
      const skill = new Skill({
        id: 'power-attack',
        name: '강타',
        description: '강력한 일격',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 150 }], // 150% 공격력
      });

      const result = skill.use(user, [enemy]);

      expect(result.success).toBe(true);
      // DamageCalculator를 사용하므로 실제 계산된 데미지 확인
      expect(enemy.hp).toBeLessThan(80); // 데미지가 적용되어야 함
      expect(user.mp).toBe(40); // 50 - 10
    });

    it('MP를 소비해야 함', () => {
      const skill = new Skill({
        id: 'fireball',
        name: '파이어볼',
        description: '화염 공격',
        mpCost: 20,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 200 }], // 200% 공격력
      });

      skill.use(user, [enemy]);

      expect(user.mp).toBe(30); // 50 - 20
    });

    it('죽은 대상에게는 데미지를 줄 수 없어야 함', () => {
      enemy.takeDamage(80); // 죽음

      const skill = new Skill({
        id: 'attack',
        name: '공격',
        description: '일반 공격',
        mpCost: 5,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 100 }], // 100% 공격력
      });

      const result = skill.use(user, [enemy]);

      expect(result.success).toBe(true);
      expect(result.effects).toHaveLength(0); // 효과 없음
    });
  });

  describe('힐 스킬', () => {
    it('힐 스킬을 사용하면 대상의 HP가 회복되어야 함', () => {
      ally.takeDamage(30); // HP: 50 -> 20

      const skill = new Skill({
        id: 'heal',
        name: '힐',
        description: 'HP 회복',
        mpCost: 15,
        targetType: 'single-ally',
        effects: [{ type: 'heal', value: 30 }],
      });

      const result = skill.use(user, [ally]);

      expect(result.success).toBe(true);
      expect(ally.hp).toBe(50); // 20 + 30
      expect(user.mp).toBe(35); // 50 - 15
    });

    it('maxHp를 초과하여 회복할 수 없어야 함', () => {
      ally.takeDamage(10); // HP: 50 -> 40

      const skill = new Skill({
        id: 'mega-heal',
        name: '메가 힐',
        description: '강력한 회복',
        mpCost: 20,
        targetType: 'single-ally',
        effects: [{ type: 'heal', value: 100 }],
      });

      skill.use(user, [ally]);

      expect(ally.hp).toBe(100); // maxHp까지만
    });
  });

  describe('MP 부족', () => {
    it('MP가 부족하면 스킬 사용 실패해야 함', () => {
      user.mp = 5;

      const skill = new Skill({
        id: 'expensive',
        name: '고비용 스킬',
        description: 'MP 많이 사용',
        mpCost: 30,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 250 }], // 250% 공격력
      });

      const result = skill.use(user, [enemy]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('MP가 부족');
      expect(enemy.hp).toBe(80); // 변화 없음
    });
  });

  describe('복수 효과 스킬', () => {
    it('여러 효과를 동일 대상에게 적용할 수 있어야 함', () => {
      const skill = new Skill({
        id: 'double-strike',
        name: '이중 타격',
        description: '두 번 공격',
        mpCost: 15,
        targetType: 'single-enemy',
        effects: [
          { type: 'damage', value: 75 }, // 75% 공격력
          { type: 'damage', value: 75 }, // 75% 공격력
        ],
      });

      const result = skill.use(user, [enemy]);

      expect(result.success).toBe(true);
      // DamageCalculator를 사용하므로 실제 계산된 데미지 확인
      expect(enemy.hp).toBeLessThan(80); // 데미지가 적용되어야 함
      expect(user.mp).toBe(35); // 50 - 15
    });
  });

  describe('결과 메시지', () => {
    it('성공 시 적절한 메시지를 반환해야 함', () => {
      const skill = new Skill({
        id: 'attack',
        name: '공격',
        description: '일반 공격',
        mpCost: 5,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 100 }], // 100% 공격력
      });

      const result = skill.use(user, [enemy]);

      expect(result.message).toBe('Hero의 공격!');
      expect(result.effects[0].message).toContain('데미지');
    });
  });
});

