import { describe, it, expect } from 'vitest';
import { BattleLayoutManager } from './BattleLayoutManager';
import { Character } from '@/characters/Character';

describe('BattleLayoutManager', () => {
  describe('반응형 레이아웃 통합', () => {
    it('모바일 세로에서 레이아웃을 올바르게 계산해야 함', () => {
      const layoutManager = new BattleLayoutManager(360, 640);
      const heroes = [new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 })];
      const enemies = [new Character({ name: '슬라임', hp: 50, attack: 10, defense: 5, speed: 8 })];

      const layout = layoutManager.calculateLayout(heroes, enemies);

      // 아군과 적군이 화면에 배치되는지 확인
      expect(layout.heroPositions).toHaveLength(1);
      expect(layout.enemyPositions).toHaveLength(1);
      expect(layout.heroPositions[0].x).toBeLessThan(layout.enemyPositions[0].x);

      // 버튼 영역이 모바일에 맞게 조정되었는지 확인
      expect(layout.buttonArea.width).toBeLessThan(360);
    });

    it('데스크톱에서 레이아웃을 올바르게 계산해야 함', () => {
      const layoutManager = new BattleLayoutManager(1280, 720);
      const heroes = [new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 })];
      const enemies = [new Character({ name: '슬라임', hp: 50, attack: 10, defense: 5, speed: 8 })];

      const layout = layoutManager.calculateLayout(heroes, enemies);

      // 아군과 적군이 화면 양쪽에 배치되는지 확인
      expect(layout.heroPositions[0].x).toBeLessThan(640);
      expect(layout.enemyPositions[0].x).toBeGreaterThan(640);

      // 버튼 영역이 적절한 크기를 가지는지 확인
      expect(layout.buttonArea.width).toBeGreaterThan(500);
    });

    it('화면 크기 변경 시 레이아웃이 업데이트되어야 함', () => {
      const layoutManager = new BattleLayoutManager(1280, 720);
      const heroes = [new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 })];
      const enemies = [new Character({ name: '슬라임', hp: 50, attack: 10, defense: 5, speed: 8 })];

      const initialLayout = layoutManager.calculateLayout(heroes, enemies);

      // 화면 크기 변경
      layoutManager.updateScreenSize(360, 640);
      const updatedLayout = layoutManager.calculateLayout(heroes, enemies);

      // 레이아웃이 변경되었는지 확인
      expect(updatedLayout.heroPositions[0].x).not.toBe(initialLayout.heroPositions[0].x);
      expect(updatedLayout.buttonArea.width).not.toBe(initialLayout.buttonArea.width);
    });

    it('반응형 설정을 올바르게 반환해야 함', () => {
      const layoutManager = new BattleLayoutManager(360, 640);
      const config = layoutManager.getResponsiveConfig();

      expect(config.screenSize).toBe('mobile-portrait');
      expect(config.baseWidth).toBe(360);
      expect(config.baseHeight).toBe(640);
    });
  });

  describe('기존 호환성', () => {
    it('기존 인터페이스가 유지되어야 함', () => {
      const layoutManager = new BattleLayoutManager();
      const heroes = [new Character({ name: '용사', hp: 100, attack: 20, defense: 10, speed: 15 })];
      const enemies = [new Character({ name: '슬라임', hp: 50, attack: 10, defense: 5, speed: 8 })];

      const layout = layoutManager.calculateLayout(heroes, enemies);

      // 기존 인터페이스 구조 유지 확인
      expect(layout).toHaveProperty('heroPositions');
      expect(layout).toHaveProperty('enemyPositions');
      expect(layout).toHaveProperty('buttonArea');
      expect(Array.isArray(layout.heroPositions)).toBe(true);
      expect(Array.isArray(layout.enemyPositions)).toBe(true);
    });
  });
});
