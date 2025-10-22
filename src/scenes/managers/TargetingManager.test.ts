import { describe, it, expect, beforeEach } from 'vitest';
import { TargetingManager } from '@/scenes/managers/TargetingManager';
import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';

describe('TargetingManager', () => {
  let targetingManager: TargetingManager;
  let mockScene: any;
  let hero: Character;
  let enemy: Character;
  let singleTargetSkill: Skill;

  beforeEach(() => {
    // Mock Phaser Scene
    mockScene = {
      add: {
        graphics: () => ({
          clear: () => { },
          fillStyle: () => { },
          lineStyle: () => { },
          beginPath: () => { },
          moveTo: () => { },
          lineTo: () => { },
          closePath: () => { },
          fillPath: () => { },
          strokePath: () => { },
          setAlpha: () => { },
          setPosition: () => { },
          setVisible: () => { },
          destroy: () => { }
        }),
        tween: () => ({
          add: () => ({})
        })
      },
      input: {
        on: () => { },
        off: () => { }
      }
    };

    hero = new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 });
    enemy = new Character({ name: '슬라임', hp: 50, attack: 10, defense: 5, speed: 8 });

    singleTargetSkill = new Skill({
      id: 'fireball',
      name: '파이어볼',
      description: '단일 적에게 화염 데미지',
      mpCost: 10,
      targetType: 'single-enemy',
      effects: [{ type: 'damage', value: 30 }]
    });

    targetingManager = new TargetingManager(mockScene);
  });

  describe('타겟팅 모드 시작', () => {
    it('타겟팅 모드를 시작할 수 있어야 한다', () => {
      const result = targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);

      expect(result.success).toBe(true);
      expect(targetingManager.isTargetingMode()).toBe(true);
    });

    it('타겟팅 모드 시작 시 입력 이벤트가 등록되어야 한다', () => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);

      expect(targetingManager.hasInputListeners()).toBe(true);
    });

    it('타겟팅 모드 시작 시 유효한 대상들이 표시되어야 한다', () => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);

      const validTargets = targetingManager.getValidTargets();
      expect(validTargets).toHaveLength(1);
      expect(validTargets[0]).toBe(enemy);
    });
  });

  describe('대상 선택 처리', () => {
    beforeEach(() => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
    });

    it('유효한 대상을 선택할 수 있어야 한다', () => {
      const result = targetingManager.selectTarget(enemy);

      expect(result.success).toBe(true);
      expect(targetingManager.getSelectedTargets()).toContain(enemy);
    });

    it('유효하지 않은 대상을 선택하면 실패해야 한다', () => {
      const result = targetingManager.selectTarget(hero); // 아군은 적 대상 스킬에 유효하지 않음

      expect(result.success).toBe(false);
      expect(targetingManager.getSelectedTargets()).toHaveLength(0);
    });

    it('대상 선택 시 화살표가 표시되어야 한다', () => {
      targetingManager.selectTarget(enemy);

      expect(targetingManager.isTargetingArrowVisible()).toBe(true);
    });
  });

  describe('타겟팅 취소', () => {
    beforeEach(() => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
    });

    it('타겟팅을 취소할 수 있어야 한다', () => {
      targetingManager.cancelTargeting();

      expect(targetingManager.isTargetingMode()).toBe(false);
      expect(targetingManager.getSelectedTargets()).toHaveLength(0);
    });

    it('타겟팅 취소 시 화살표가 숨겨져야 한다', () => {
      targetingManager.selectTarget(enemy);
      targetingManager.cancelTargeting();

      expect(targetingManager.isTargetingArrowVisible()).toBe(false);
    });

    it('타겟팅 취소 시 입력 이벤트가 제거되어야 한다', () => {
      targetingManager.cancelTargeting();

      expect(targetingManager.hasInputListeners()).toBe(false);
    });
  });

  describe('타겟팅 완료', () => {
    beforeEach(() => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
      targetingManager.selectTarget(enemy);
    });

    it('타겟팅을 완료할 수 있어야 한다', () => {
      const result = targetingManager.completeTargeting();

      expect(result.success).toBe(true);
      expect(targetingManager.isTargetingMode()).toBe(false);
    });

    it('타겟팅 완료 시 선택된 대상을 반환해야 한다', () => {
      const result = targetingManager.completeTargeting();

      expect(result.targets).toBeDefined();
      expect(result.targets).toHaveLength(1);
      expect(result.targets![0]).toBe(enemy);
    });

    it('타겟팅 완료 시 화살표가 숨겨져야 한다', () => {
      targetingManager.completeTargeting();

      expect(targetingManager.isTargetingArrowVisible()).toBe(false);
    });
  });

  describe('입력 이벤트 처리', () => {
    beforeEach(() => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
    });

    it('마우스 클릭 이벤트를 처리할 수 있어야 한다', () => {
      const mockEvent = {
        x: 600,
        y: 300,
        target: enemy
      };

      const result = targetingManager.handleMouseClick(mockEvent);
      expect(result.success).toBe(true);
    });

    it('터치 이벤트를 처리할 수 있어야 한다', () => {
      const mockEvent = {
        x: 600,
        y: 300,
        target: enemy
      };

      const result = targetingManager.handleTouch(mockEvent);
      expect(result.success).toBe(true);
    });

    it('ESC 키로 타겟팅을 취소할 수 있어야 한다', () => {
      const result = targetingManager.handleKeyPress('Escape');

      expect(result.success).toBe(true);
      expect(targetingManager.isTargetingMode()).toBe(false);
    });
  });

  describe('타겟팅 상태 관리', () => {
    it('초기 상태는 비활성화여야 한다', () => {
      expect(targetingManager.isTargetingMode()).toBe(false);
      expect(targetingManager.getSelectedTargets()).toHaveLength(0);
    });

    it('타겟팅 상태를 확인할 수 있어야 한다', () => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);

      expect(targetingManager.getTargetingState()).toBe('SELECTING');
    });

    it('타겟팅 완료 후 상태가 초기화되어야 한다', () => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
      targetingManager.selectTarget(enemy);
      targetingManager.completeTargeting();

      expect(targetingManager.isTargetingMode()).toBe(false);
      expect(targetingManager.getSelectedTargets()).toHaveLength(0);
    });
  });

  describe('타겟팅 UI 업데이트', () => {
    it('캐릭터 위치 변경 시 화살표 위치를 업데이트해야 한다', () => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
      targetingManager.selectTarget(enemy);

      // 캐릭터 위치 변경
      hero.position = { x: 250, y: 350 };
      enemy.position = { x: 650, y: 350 };

      targetingManager.updateTargetingUI();

      expect(targetingManager.isTargetingArrowVisible()).toBe(true);
    });

    it('화면 크기 변경 시 타겟팅 UI를 재배치해야 한다', () => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
      targetingManager.selectTarget(enemy);

      targetingManager.onResize();

      expect(targetingManager.isTargetingArrowVisible()).toBe(true);
    });
  });

  describe('타겟팅 매니저 정리', () => {
    it('매니저 파괴 시 모든 리소스가 정리되어야 한다', () => {
      targetingManager.startTargetingMode(singleTargetSkill, [hero], [enemy], hero);
      targetingManager.selectTarget(enemy);

      targetingManager.destroy();

      expect(targetingManager.isTargetingMode()).toBe(false);
      expect(targetingManager.hasInputListeners()).toBe(false);
    });
  });
});
