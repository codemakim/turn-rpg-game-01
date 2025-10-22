import { describe, it, expect, beforeEach } from 'vitest';
import { TargetingUI } from './TargetingUI';
import { Character } from '@/characters/Character';

describe('TargetingUI', () => {
  let targetingUI: TargetingUI;
  let mockScene: any;
  let hero: Character;
  let enemy: Character;

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
      }
    };

    hero = new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 });
    enemy = new Character({ name: '슬라임', hp: 50, attack: 10, defense: 5, speed: 8 });

    targetingUI = new TargetingUI(mockScene);
  });

  describe('타겟팅 화살표 생성', () => {
    it('단일 대상에 대한 빨간색 화살표를 생성해야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      expect(targetingUI.isArrowVisible()).toBe(true);
      expect(targetingUI.getArrowColor()).toBe(0xff4444); // 빨간색
    });

    it('화살표는 아군에서 적군으로 향해야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      const arrowPosition = targetingUI.getArrowPosition();
      expect(arrowPosition.from).toEqual({ x: 200, y: 300 }); // 아군 위치
      expect(arrowPosition.to).toEqual({ x: 600, y: 300 }); // 적군 위치
    });

    it('화살표 크기는 적절해야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      const arrowSize = targetingUI.getArrowSize();
      expect(arrowSize).toBe(10); // 기본 크기
    });
  });

  describe('타겟팅 화살표 숨김', () => {
    it('화살표를 숨길 수 있어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);
      targetingUI.hideTargetingArrow();

      expect(targetingUI.isArrowVisible()).toBe(false);
    });

    it('숨겨진 화살표는 위치 정보가 없어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);
      targetingUI.hideTargetingArrow();

      const arrowPosition = targetingUI.getArrowPosition();
      expect(arrowPosition.from).toBeNull();
      expect(arrowPosition.to).toBeNull();
    });
  });

  describe('다중 대상 타겟팅', () => {
    it('여러 대상에 대한 화살표를 생성할 수 있어야 한다', () => {
      const enemy2 = new Character({ name: '고블린', hp: 40, attack: 12, defense: 6, speed: 10 });

      targetingUI.showMultipleTargetingArrows(hero, [enemy, enemy2]);

      expect(targetingUI.getArrowCount()).toBe(2);
      expect(targetingUI.isArrowVisible()).toBe(true);
    });

    it('다중 화살표는 모두 빨간색이어야 한다', () => {
      const enemy2 = new Character({ name: '고블린', hp: 40, attack: 12, defense: 6, speed: 10 });

      targetingUI.showMultipleTargetingArrows(hero, [enemy, enemy2]);

      const arrows = targetingUI.getAllArrows();
      arrows.forEach(arrow => {
        expect(arrow.color).toBe(0xff4444);
      });
    });
  });

  describe('화살표 애니메이션', () => {
    it('화살표에 펄스 애니메이션이 적용되어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      expect(targetingUI.hasPulseAnimation()).toBe(true);
    });

    it('애니메이션은 투명도 변화여야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      const animation = targetingUI.getPulseAnimation();
      expect(animation.alpha).toBeDefined();
      expect(animation.duration).toBe(1000); // 1초
      expect(animation.repeat).toBe(-1); // 무한 반복
    });
  });

  describe('화살표 위치 업데이트', () => {
    it('캐릭터 위치 변경 시 화살표 위치도 업데이트되어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      // 캐릭터 위치 변경
      hero.position = { x: 250, y: 350 };
      enemy.position = { x: 650, y: 350 };

      targetingUI.updateArrowPositions();

      const arrowPosition = targetingUI.getArrowPosition();
      expect(arrowPosition.from).toEqual({ x: 250, y: 350 });
      expect(arrowPosition.to).toEqual({ x: 650, y: 350 });
    });
  });

  describe('화살표 스타일', () => {
    it('화살표는 역삼각형 모양이어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      const arrowShape = targetingUI.getArrowShape();
      expect(arrowShape.type).toBe('triangle');
      expect(arrowShape.direction).toBe('down'); // 아래쪽을 향한 역삼각형
    });

    it('화살표 테두리는 흰색이어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);

      const arrowStyle = targetingUI.getArrowStyle();
      expect(arrowStyle.borderColor).toBe(0xffffff);
      expect(arrowStyle.borderWidth).toBe(1);
    });
  });

  describe('타겟팅 UI 정리', () => {
    it('모든 화살표를 제거할 수 있어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);
      targetingUI.clearAllArrows();

      expect(targetingUI.getArrowCount()).toBe(0);
      expect(targetingUI.isArrowVisible()).toBe(false);
    });

    it('UI 파괴 시 모든 리소스가 정리되어야 한다', () => {
      targetingUI.showTargetingArrow(hero, enemy);
      targetingUI.destroy();

      expect(targetingUI.isDestroyed()).toBe(true);
    });
  });
});
