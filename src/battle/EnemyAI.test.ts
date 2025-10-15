import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyAI } from './EnemyAI';
import { Character } from '@/characters/Character';
import { Skill } from './Skill';

describe('EnemyAI', () => {
  let ai: EnemyAI;
  let enemy: Character;
  let hero: Character;
  let healSkill: Skill;
  let attackSkill: Skill;

  beforeEach(() => {
    ai = new EnemyAI();

    healSkill = new Skill({
      id: 'heal',
      name: '힐',
      description: 'HP 회복',
      mpCost: 15,
      targetType: 'self',
      effects: [{ type: 'heal', value: 30 }],
    });

    attackSkill = new Skill({
      id: 'fireball',
      name: '파이어볼',
      description: '화염 공격',
      mpCost: 20,
      targetType: 'single-enemy',
      effects: [{ type: 'damage', value: 40 }],
    });

    enemy = new Character({
      name: 'Slime',
      hp: 100,
      mp: 50,
      attack: 20,
      defense: 10,
      speed: 10,
    });

    hero = new Character({
      name: 'Hero',
      hp: 100,
      mp: 50,
      attack: 25,
      defense: 12,
      speed: 15,
    });
  });

  describe('기본 공격', () => {
    it('스킬이 없으면 기본 공격을 선택해야 함', () => {
      const action = ai.decideAction(enemy, [hero]);

      expect(action.type).toBe('attack');
      expect(action.target).toBe(hero);
      expect(action.skill).toBeUndefined();
    });

    it('MP가 부족하면 기본 공격을 선택해야 함', () => {
      enemy.skills = [attackSkill];
      enemy.mp = 10; // attackSkill은 20 필요

      const action = ai.decideAction(enemy, [hero]);

      expect(action.type).toBe('attack');
    });
  });

  describe('힐 스킬 사용', () => {
    it('HP가 30% 미만이고 힐 스킬이 있으면 힐을 선택해야 함', () => {
      enemy.skills = [healSkill, attackSkill];
      enemy.takeDamage(75); // HP: 25 (25%)

      const action = ai.decideAction(enemy, [hero]);

      expect(action.type).toBe('skill');
      expect(action.skill).toBe(healSkill);
      expect(action.target).toBe(enemy);
    });

    it('HP가 30% 이상이면 힐을 선택하지 않아야 함', () => {
      enemy.skills = [healSkill, attackSkill];
      enemy.takeDamage(30); // HP: 70 (70%)

      const action = ai.decideAction(enemy, [hero]);

      // 힐이 아닌 다른 행동 (공격 or 스킬)
      expect(action.skill).not.toBe(healSkill);
    });

    it('힐 스킬의 MP가 부족하면 다른 행동을 선택해야 함', () => {
      enemy.skills = [healSkill];
      enemy.mp = 5; // healSkill은 15 필요
      enemy.takeDamage(80); // HP: 20 (20%)

      const action = ai.decideAction(enemy, [hero]);

      expect(action.type).toBe('attack'); // MP 부족으로 기본 공격
    });
  });

  describe('공격 스킬 사용', () => {
    it('공격 스킬을 보유하고 있으면 사용할 수 있어야 함', () => {
      enemy.skills = [attackSkill];

      // 여러 번 시도 (50% 확률이므로)
      let skillUsed = false;
      for (let i = 0; i < 20; i++) {
        const action = ai.decideAction(enemy, [hero]);
        if (action.type === 'skill' && action.skill === attackSkill) {
          skillUsed = true;
          break;
        }
      }

      expect(skillUsed).toBe(true);
    });

    it('공격 스킬 사용 시 올바른 대상을 선택해야 함', () => {
      enemy.skills = [attackSkill];

      // 스킬이 사용될 때까지 시도
      for (let i = 0; i < 20; i++) {
        const action = ai.decideAction(enemy, [hero]);
        if (action.type === 'skill') {
          expect(action.target).toBe(hero);
          expect(action.skill).toBe(attackSkill);
          break;
        }
      }
    });
  });

  describe('대상 선택', () => {
    it('살아있는 대상 중 HP가 가장 낮은 대상을 선택해야 함', () => {
      const weakHero = new Character({
        name: 'Weak',
        hp: 30,
        attack: 20,
        defense: 10,
        speed: 10,
      });

      const strongHero = new Character({
        name: 'Strong',
        hp: 90,
        attack: 20,
        defense: 10,
        speed: 10,
      });

      const action = ai.decideAction(enemy, [strongHero, weakHero]);

      expect(action.target).toBe(weakHero);
    });

    it('죽은 대상은 선택하지 않아야 함', () => {
      const deadHero = new Character({
        name: 'Dead',
        hp: 100,
        attack: 20,
        defense: 10,
        speed: 10,
      });
      deadHero.takeDamage(100); // 죽음

      const action = ai.decideAction(enemy, [hero, deadHero]);

      expect(action.target).toBe(hero);
      expect(action.target.isAlive()).toBe(true);
    });
  });

  describe('우선순위', () => {
    it('HP가 낮으면 힐이 공격 스킬보다 우선되어야 함', () => {
      enemy.skills = [healSkill, attackSkill];
      enemy.takeDamage(75); // HP: 25 (25%)

      const action = ai.decideAction(enemy, [hero]);

      expect(action.type).toBe('skill');
      expect(action.skill).toBe(healSkill);
    });
  });
});

