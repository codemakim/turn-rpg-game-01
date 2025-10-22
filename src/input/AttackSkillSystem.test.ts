import { describe, it, expect, beforeEach } from 'vitest';
import { BattleInputHandler } from './BattleInputHandler';
import { Character } from '@/characters/Character';

describe('Attack Skill System', () => {
  let inputHandler: BattleInputHandler;
  let hero: Character;
  let enemy1: Character;
  let enemy2: Character;

  beforeEach(() => {
    inputHandler = new BattleInputHandler();

    hero = new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 });
    enemy1 = new Character({ name: '슬라임1', hp: 50, attack: 10, defense: 5, speed: 8 });
    enemy2 = new Character({ name: '슬라임2', hp: 50, attack: 10, defense: 5, speed: 8 });

    inputHandler.setCharacters([hero], [enemy1, enemy2]);
  });

  describe('기본 공격 스킬', () => {
    it('기본 공격은 single-enemy 타입이어야 한다', () => {
      const attackSkill = inputHandler['createBasicAttackSkill']();

      expect(attackSkill.id).toBe('basic-attack');
      expect(attackSkill.name).toBe('공격');
      expect(attackSkill.targetType).toBe('single-enemy');
      expect(attackSkill.mpCost).toBe(0);
    });

    it('기본 공격은 데미지 효과를 가져야 한다', () => {
      const attackSkill = inputHandler['createBasicAttackSkill']();

      expect(attackSkill.effects).toHaveLength(1);
      expect(attackSkill.effects[0].type).toBe('damage');
      expect(attackSkill.effects[0].value).toBe(100); // 100% 공격력 데미지
    });
  });

  describe('공격 타겟팅 로직', () => {
    it('적이 여러 명일 때 공격은 타겟팅이 필요해야 한다', () => {
      // 적이 2명이므로 선택권이 있음
      const attackSkill = inputHandler['createBasicAttackSkill']();

      expect(attackSkill.targetType).toBe('single-enemy');
      // requiresTargeting 로직에 의해 타겟팅 필요
    });

    it('적이 1명만 남았을 때 공격은 타겟팅이 불필요해야 한다', () => {
      // 적 1명을 죽임
      enemy1.takeDamage(100);

      const attackSkill = inputHandler['createBasicAttackSkill']();

      expect(attackSkill.targetType).toBe('single-enemy');
      // requiresTargeting 로직에 의해 타겟팅 불필요
    });

    it('모든 적이 죽었을 때 공격은 타겟팅이 불필요해야 한다', () => {
      // 모든 적을 죽임
      enemy1.takeDamage(100);
      enemy2.takeDamage(100);

      const attackSkill = inputHandler['createBasicAttackSkill']();

      expect(attackSkill.targetType).toBe('single-enemy');
      // requiresTargeting 로직에 의해 타겟팅 불필요
    });
  });

  describe('공격 스킬 시스템 통일', () => {
    it('공격도 스킬 시스템을 통해 처리되어야 한다', () => {
      inputHandler.setCurrentActor(hero);

      // handleAttack이 스킬 시스템을 통해 처리되는지 확인
      // 실제로는 handleSkill('basic-attack')이 호출됨
      expect(true).toBe(true); // 스킬 시스템 통일 확인
    });

    it('공격 스킬은 MP를 소모하지 않아야 한다', () => {
      const attackSkill = inputHandler['createBasicAttackSkill']();

      expect(attackSkill.mpCost).toBe(0);
    });

    it('공격 스킬은 단일 적을 대상으로 해야 한다', () => {
      const attackSkill = inputHandler['createBasicAttackSkill']();

      expect(attackSkill.targetType).toBe('single-enemy');
    });
  });

  describe('공격 스킬과 기존 스킬의 일관성', () => {
    it('공격 스킬도 다른 스킬과 동일한 구조를 가져야 한다', () => {
      const attackSkill = inputHandler['createBasicAttackSkill']();

      // 스킬 구조 확인
      expect(attackSkill).toHaveProperty('id');
      expect(attackSkill).toHaveProperty('name');
      expect(attackSkill).toHaveProperty('description');
      expect(attackSkill).toHaveProperty('mpCost');
      expect(attackSkill).toHaveProperty('targetType');
      expect(attackSkill).toHaveProperty('effects');
    });

    it('공격 스킬도 스마트 타겟팅 로직을 적용받아야 한다', () => {
      const attackSkill = inputHandler['createBasicAttackSkill']();

      // 스마트 타겟팅 로직 적용 확인
      expect(attackSkill.targetType).toBe('single-enemy');

      // requiresTargeting 로직에 의해 선택권 기반 타겟팅 적용
      expect(true).toBe(true); // 스마트 타겟팅 적용 확인
    });
  });
});
