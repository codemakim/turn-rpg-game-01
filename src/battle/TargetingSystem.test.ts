import { describe, it, expect, beforeEach } from 'vitest';
import { TargetingSystem } from '@/battle/TargetingSystem';
import { Character } from '@/characters/Character';
import { Skill } from './Skill';

describe('TargetingSystem', () => {
  let targetingSystem: TargetingSystem;
  let hero: Character;
  let enemy: Character;
  let singleTargetSkill: Skill;
  let allEnemiesSkill: Skill;

  beforeEach(() => {
    targetingSystem = new TargetingSystem();

    hero = new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 });
    enemy = new Character({ name: '슬라임', hp: 50, attack: 10, defense: 5, speed: 8 });

    // 단일 대상 스킬
    singleTargetSkill = new Skill({
      id: 'fireball',
      name: '파이어볼',
      description: '단일 적에게 화염 데미지',
      mpCost: 10,
      targetType: 'single-enemy',
      effects: [{ type: 'damage', value: 30 }]
    });

    // 전체 적 대상 스킬
    allEnemiesSkill = new Skill({
      id: 'meteor',
      name: '메테오',
      description: '모든 적에게 데미지',
      mpCost: 20,
      targetType: 'all-enemies',
      effects: [{ type: 'damage', value: 15 }]
    });
  });

  describe('타겟팅 상태 관리', () => {
    it('초기 상태는 IDLE이어야 한다', () => {
      expect(targetingSystem.getState()).toBe('IDLE');
    });

    it('타겟팅 모드 시작 시 SELECTING 상태가 되어야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      expect(targetingSystem.getState()).toBe('SELECTING');
    });

    it('대상 선택 시 CONFIRMED 상태가 되어야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      targetingSystem.selectTarget(enemy);
      expect(targetingSystem.getState()).toBe('CONFIRMED');
    });

    it('타겟팅 취소 시 IDLE 상태가 되어야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      targetingSystem.cancelTargeting();
      expect(targetingSystem.getState()).toBe('IDLE');
    });
  });

  describe('스킬별 타겟팅 규칙', () => {
    it('단일 대상 스킬은 하나의 대상만 선택 가능해야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);

      const validTargets = targetingSystem.getValidTargets();
      expect(validTargets).toHaveLength(1);
      expect(validTargets[0]).toBe(enemy);
    });

    it('전체 적 대상 스킬은 모든 적이 유효한 대상이어야 한다', () => {
      const enemy2 = new Character({ name: '고블린', hp: 40, attack: 12, defense: 6, speed: 10 });
      targetingSystem.startTargeting(allEnemiesSkill, [hero], [enemy, enemy2], hero);

      const validTargets = targetingSystem.getValidTargets();
      expect(validTargets).toHaveLength(2);
      expect(validTargets).toContain(enemy);
      expect(validTargets).toContain(enemy2);
    });

    it('죽은 캐릭터는 유효한 대상이 아니어야 한다', () => {
      enemy.takeDamage(100); // 죽음
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);

      const validTargets = targetingSystem.getValidTargets();
      expect(validTargets).toHaveLength(0);
    });
  });

  describe('대상 선택', () => {
    it('유효한 대상을 선택할 수 있어야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      const result = targetingSystem.selectTarget(enemy);

      expect(result.success).toBe(true);
      expect(targetingSystem.getSelectedTargets()).toContain(enemy);
    });

    it('유효하지 않은 대상을 선택하면 실패해야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      const result = targetingSystem.selectTarget(hero); // 아군은 적 대상 스킬에 유효하지 않음

      expect(result.success).toBe(false);
      expect(targetingSystem.getSelectedTargets()).toHaveLength(0);
    });

    it('전체 대상 스킬은 자동으로 모든 유효한 대상이 선택되어야 한다', () => {
      const enemy2 = new Character({ name: '고블린', hp: 40, attack: 12, defense: 6, speed: 10 });
      targetingSystem.startTargeting(allEnemiesSkill, [hero], [enemy, enemy2], hero);

      const result = targetingSystem.selectTarget(enemy); // 아무 대상이나 선택
      expect(result.success).toBe(true);
      expect(targetingSystem.getSelectedTargets()).toHaveLength(2);
      expect(targetingSystem.getSelectedTargets()).toContain(enemy);
      expect(targetingSystem.getSelectedTargets()).toContain(enemy2);
    });
  });

  describe('타겟팅 완료', () => {
    it('선택된 대상을 반환해야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      targetingSystem.selectTarget(enemy);

      const targets = targetingSystem.getSelectedTargets();
      expect(targets).toHaveLength(1);
      expect(targets[0]).toBe(enemy);
    });

    it('타겟팅 완료 후 상태가 IDLE로 돌아가야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      targetingSystem.selectTarget(enemy);
      targetingSystem.completeTargeting();

      expect(targetingSystem.getState()).toBe('IDLE');
      expect(targetingSystem.getSelectedTargets()).toHaveLength(0);
    });
  });

  describe('타겟팅 리셋', () => {
    it('리셋 시 모든 상태가 초기화되어야 한다', () => {
      targetingSystem.startTargeting(singleTargetSkill, [hero], [enemy], hero);
      targetingSystem.selectTarget(enemy);

      targetingSystem.reset();

      expect(targetingSystem.getState()).toBe('IDLE');
      expect(targetingSystem.getSelectedTargets()).toHaveLength(0);
      expect(targetingSystem.getValidTargets()).toHaveLength(0);
    });
  });
});
