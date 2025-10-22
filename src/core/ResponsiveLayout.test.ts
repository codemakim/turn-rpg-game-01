import { describe, it, expect } from 'vitest';
import { ResponsiveLayout, ScreenSize, AspectRatio } from './ResponsiveLayout';

describe('ResponsiveLayout', () => {
  describe('화면 크기 분류', () => {
    it('모바일 세로 모드 (360x640)를 올바르게 분류해야 함', () => {
      const layout = new ResponsiveLayout(360, 640);
      const config = layout.getConfig();

      expect(config.screenSize).toBe(ScreenSize.MOBILE_PORTRAIT);
      expect(config.aspectRatio).toBe(AspectRatio.PORTRAIT);
    });

    it('모바일 가로 모드 (640x360)를 올바르게 분류해야 함', () => {
      const layout = new ResponsiveLayout(640, 360);
      const config = layout.getConfig();

      expect(config.screenSize).toBe(ScreenSize.MOBILE_LANDSCAPE);
      expect(config.aspectRatio).toBe(AspectRatio.LANDSCAPE);
    });

    it('태블릿 세로 모드 (768x1024)를 올바르게 분류해야 함', () => {
      const layout = new ResponsiveLayout(768, 1024);
      const config = layout.getConfig();

      expect(config.screenSize).toBe(ScreenSize.TABLET_PORTRAIT);
      expect(config.aspectRatio).toBe(AspectRatio.PORTRAIT);
    });

    it('데스크톱 모드 (1280x720)를 올바르게 분류해야 함', () => {
      const layout = new ResponsiveLayout(1280, 720);
      const config = layout.getConfig();

      expect(config.screenSize).toBe(ScreenSize.DESKTOP);
      expect(config.aspectRatio).toBe(AspectRatio.LANDSCAPE);
    });

    it('울트라와이드 모드 (2560x1080)를 올바르게 분류해야 함', () => {
      const layout = new ResponsiveLayout(2560, 1080);
      const config = layout.getConfig();

      expect(config.screenSize).toBe(ScreenSize.ULTRAWIDE);
      expect(config.aspectRatio).toBe(AspectRatio.LANDSCAPE);
    });
  });

  describe('캐릭터 레이아웃 계산', () => {
    it('모바일 세로에서 캐릭터 위치를 올바르게 계산해야 함', () => {
      const layout = new ResponsiveLayout(360, 640);
      const characterLayout = layout.calculateCharacterLayout(2, 2);

      // 아군 위치 확인
      expect(characterLayout.heroPositions).toHaveLength(2);
      expect(characterLayout.heroPositions[0].x).toBeGreaterThan(0);
      expect(characterLayout.heroPositions[0].y).toBeGreaterThan(0);

      // 적군 위치 확인
      expect(characterLayout.enemyPositions).toHaveLength(2);
      expect(characterLayout.enemyPositions[0].x).toBeGreaterThan(characterLayout.heroPositions[0].x);

      // 캐릭터 크기와 간격이 모바일에 맞게 조정되었는지 확인
      expect(characterLayout.characterSize).toBeLessThan(50); // 기본 크기보다 작아야 함
      expect(characterLayout.characterSpacing).toBeLessThan(120); // 기본 간격보다 작아야 함
    });

    it('데스크톱에서 캐릭터 위치를 올바르게 계산해야 함', () => {
      const layout = new ResponsiveLayout(1280, 720);
      const characterLayout = layout.calculateCharacterLayout(2, 2);

      // 아군과 적군이 화면 양쪽에 배치되는지 확인
      expect(characterLayout.heroPositions[0].x).toBeLessThan(640); // 화면 중앙보다 왼쪽
      expect(characterLayout.enemyPositions[0].x).toBeGreaterThan(640); // 화면 중앙보다 오른쪽
    });
  });

  describe('UI 레이아웃 계산', () => {
    it('모바일 세로에서 UI 영역을 올바르게 계산해야 함', () => {
      const layout = new ResponsiveLayout(360, 640);
      const uiLayout = layout.calculateUILayout();

      // 버튼 영역이 화면 하단에 위치하는지 확인
      expect(uiLayout.buttonArea.y).toBeGreaterThan(400);
      expect(uiLayout.buttonArea.width).toBeLessThan(360);

      // 폰트 크기가 모바일에 맞게 조정되었는지 확인
      expect(uiLayout.fontSize.medium).toBeLessThan(16);
    });

    it('데스크톱에서 UI 영역을 올바르게 계산해야 함', () => {
      const layout = new ResponsiveLayout(1280, 720);
      const uiLayout = layout.calculateUILayout();

      // 버튼 영역이 적절한 크기를 가지는지 확인
      expect(uiLayout.buttonArea.width).toBeGreaterThan(500);
      expect(uiLayout.buttonArea.height).toBeGreaterThan(50);

      // 폰트 크기가 적절한지 확인
      expect(uiLayout.fontSize.medium).toBeGreaterThan(12);
    });
  });

  describe('화면 크기 변경', () => {
    it('화면 크기 변경 시 레이아웃이 올바르게 업데이트되어야 함', () => {
      const layout = new ResponsiveLayout(1280, 720);
      const initialConfig = layout.getConfig();

      // 화면 크기 변경
      layout.updateLayout(360, 640);
      const updatedConfig = layout.getConfig();

      expect(updatedConfig.screenSize).toBe(ScreenSize.MOBILE_PORTRAIT);
      expect(updatedConfig.baseWidth).toBe(360);
      expect(updatedConfig.baseHeight).toBe(640);
      expect(updatedConfig.scale).not.toBe(initialConfig.scale);
    });
  });

  describe('안전 영역 계산', () => {
    it('모바일 세로에서 상단 안전 영역을 고려해야 함', () => {
      const layout = new ResponsiveLayout(360, 640);
      const config = layout.getConfig();

      expect(config.safeArea.top).toBeGreaterThan(0);
      expect(config.safeArea.bottom).toBeGreaterThan(0);
    });

    it('모바일 가로에서 좌우 안전 영역을 고려해야 함', () => {
      const layout = new ResponsiveLayout(640, 360);
      const config = layout.getConfig();

      expect(config.safeArea.left).toBeGreaterThan(0);
      expect(config.safeArea.right).toBeGreaterThan(0);
    });

    it('데스크톱에서는 안전 영역이 0이어야 함', () => {
      const layout = new ResponsiveLayout(1280, 720);
      const config = layout.getConfig();

      expect(config.safeArea.top).toBe(0);
      expect(config.safeArea.bottom).toBe(0);
      expect(config.safeArea.left).toBe(0);
      expect(config.safeArea.right).toBe(0);
    });
  });
});
