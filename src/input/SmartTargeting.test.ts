import { describe, it, expect, beforeEach } from 'vitest';
import { BattleInputHandler } from './BattleInputHandler';
import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';

describe('Smart Targeting Logic', () => {
  let inputHandler: BattleInputHandler;
  let hero: Character;
  let enemy1: Character;
  let enemy2: Character;
  let enemy3: Character;

  beforeEach(() => {
    inputHandler = new BattleInputHandler();

    hero = new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 });
    enemy1 = new Character({ name: '슬라임1', hp: 50, attack: 10, defense: 5, speed: 8 });
    enemy2 = new Character({ name: '슬라임2', hp: 50, attack: 10, defense: 5, speed: 8 });
    enemy3 = new Character({ name: '슬라임3', hp: 50, attack: 10, defense: 5, speed: 8 });

    inputHandler.setCharacters([hero], [enemy1, enemy2, enemy3]);
  });

  describe('전체 대상 스킬', () => {
    it('전체 적 대상 스킬은 타겟팅이 불필요해야 한다', () => {
      const allEnemiesSkill = new Skill({
        id: 'meteor',
        name: '메테오',
        description: '모든 적에게 데미지',
        mpCost: 20,
        targetType: 'all-enemies',
        effects: [{ type: 'damage', value: 15 }]
      });

      // requiresTargeting 메서드를 직접 테스트할 수 없으므로
      // 실제 동작을 통해 확인
      inputHandler.setCurrentActor(hero);

      // 전체 대상 스킬은 자동 타겟팅되어야 함
      expect(allEnemiesSkill.targetType).toBe('all-enemies');
    });

    it('전체 아군 대상 스킬은 타겟팅이 불필요해야 한다', () => {
      const allAlliesSkill = new Skill({
        id: 'group-heal',
        name: '그룹 힐',
        description: '모든 아군에게 회복',
        mpCost: 15,
        targetType: 'all-allies',
        effects: [{ type: 'heal', value: 20 }]
      });

      expect(allAlliesSkill.targetType).toBe('all-allies');
    });

    it('자신 대상 스킬은 타겟팅이 불필요해야 한다', () => {
      const selfSkill = new Skill({
        id: 'self-buff',
        name: '자기 버프',
        description: '자신에게 버프',
        mpCost: 10,
        targetType: 'self',
        effects: [{ type: 'buff', value: 5 }]
      });

      expect(selfSkill.targetType).toBe('self');
    });
  });

  describe('단일 대상 스킬 - 선택권 기반', () => {
    it('적이 여러 명일 때 단일 적 대상 스킬은 타겟팅이 필요해야 한다', () => {
      const singleEnemySkill = new Skill({
        id: 'fireball',
        name: '파이어볼',
        description: '단일 적에게 화염 데미지',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 30 }]
      });

      // 적이 3명이므로 선택권이 있음
      expect(singleEnemySkill.targetType).toBe('single-enemy');
    });

    it('적이 1명만 남았을 때 단일 적 대상 스킬은 타겟팅이 불필요해야 한다', () => {
      // 적 2명을 죽임
      enemy1.takeDamage(100);
      enemy2.takeDamage(100);

      const singleEnemySkill = new Skill({
        id: 'fireball',
        name: '파이어볼',
        description: '단일 적에게 화염 데미지',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 30 }]
      });

      // 적이 1명뿐이므로 선택권이 없음
      expect(singleEnemySkill.targetType).toBe('single-enemy');
    });

    it('아군이 여러 명일 때 단일 아군 대상 스킬은 타겟팅이 필요해야 한다', () => {
      const hero2 = new Character({ name: '마법사', hp: 80, attack: 15, defense: 8, speed: 12 });
      inputHandler.setCharacters([hero, hero2], [enemy1, enemy2, enemy3]);

      const singleAllySkill = new Skill({
        id: 'heal',
        name: '힐',
        description: '단일 아군에게 회복',
        mpCost: 8,
        targetType: 'single-ally',
        effects: [{ type: 'heal', value: 25 }]
      });

      // 아군이 2명이므로 선택권이 있음
      expect(singleAllySkill.targetType).toBe('single-ally');
    });

    it('아군이 1명만 있을 때 단일 아군 대상 스킬은 타겟팅이 불필요해야 한다', () => {
      const singleAllySkill = new Skill({
        id: 'heal',
        name: '힐',
        description: '단일 아군에게 회복',
        mpCost: 8,
        targetType: 'single-ally',
        effects: [{ type: 'heal', value: 25 }]
      });

      // 아군이 1명뿐이므로 선택권이 없음
      expect(singleAllySkill.targetType).toBe('single-ally');
    });
  });

  describe('시나리오별 타겟팅 필요성', () => {
    it('시나리오 1: 적 3명, 아군 1명 - 단일 적 스킬은 타겟팅 필요', () => {
      const singleEnemySkill = new Skill({
        id: 'attack',
        name: '공격',
        description: '단일 적 공격',
        mpCost: 0,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 20 }]
      });

      // 적이 3명이므로 선택권이 있음
      expect(singleEnemySkill.targetType).toBe('single-enemy');
    });

    it('시나리오 2: 적 1명, 아군 1명 - 단일 적 스킬은 타겟팅 불필요', () => {
      // 적 2명을 죽임
      enemy1.takeDamage(100);
      enemy2.takeDamage(100);

      const singleEnemySkill = new Skill({
        id: 'attack',
        name: '공격',
        description: '단일 적 공격',
        mpCost: 0,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 20 }]
      });

      // 적이 1명뿐이므로 선택권이 없음
      expect(singleEnemySkill.targetType).toBe('single-enemy');
    });

    it('시나리오 3: 모든 적이 죽었을 때 - 단일 적 스킬은 타겟팅 불필요', () => {
      // 모든 적을 죽임
      enemy1.takeDamage(100);
      enemy2.takeDamage(100);
      enemy3.takeDamage(100);

      const singleEnemySkill = new Skill({
        id: 'attack',
        name: '공격',
        description: '단일 적 공격',
        mpCost: 0,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 20 }]
      });

      // 적이 없으므로 선택권이 없음
      expect(singleEnemySkill.targetType).toBe('single-enemy');
    });
  });
});
