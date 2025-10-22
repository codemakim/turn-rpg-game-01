import { Character } from '@/characters/Character';
import { ResponsiveLayout, type CharacterLayout, type UILayout } from '@/core/ResponsiveLayout';

/**
 * 레이아웃 정보 인터페이스
 */
export interface LayoutInfo {
  heroPositions: { x: number; y: number }[];
  enemyPositions: { x: number; y: number }[];
  buttonArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * 전투 화면 레이아웃 관리자
 * 캐릭터 위치 및 UI 요소 배치를 담당
 */
export class BattleLayoutManager {
  private responsiveLayout: ResponsiveLayout;
  private currentWidth: number;
  private currentHeight: number;

  constructor(width: number = 1280, height: number = 720) {
    this.currentWidth = width;
    this.currentHeight = height;
    this.responsiveLayout = new ResponsiveLayout(width, height);
  }

  /**
   * 전체 레이아웃을 계산합니다 (반응형)
   * @param heroes 아군 캐릭터 배열
   * @param enemies 적 캐릭터 배열
   * @returns 레이아웃 정보
   */
  public calculateLayout(heroes: Character[], enemies: Character[]): LayoutInfo {
    const characterLayout = this.responsiveLayout.calculateCharacterLayout(heroes.length, enemies.length);
    const uiLayout = this.responsiveLayout.calculateUILayout();

    return {
      heroPositions: characterLayout.heroPositions,
      enemyPositions: characterLayout.enemyPositions,
      buttonArea: uiLayout.buttonArea,
    };
  }

  /**
   * 아군 캐릭터들의 위치를 계산합니다 (반응형)
   * @param heroes 아군 캐릭터 배열
   * @returns 아군 위치 배열
   */
  public calculateHeroPositions(heroes: Character[]): { x: number; y: number }[] {
    const characterLayout = this.responsiveLayout.calculateCharacterLayout(heroes.length, 0);
    return characterLayout.heroPositions;
  }

  /**
   * 적 캐릭터들의 위치를 계산합니다 (반응형)
   * @param enemies 적 캐릭터 배열
   * @returns 적 위치 배열
   */
  public calculateEnemyPositions(enemies: Character[]): { x: number; y: number }[] {
    const characterLayout = this.responsiveLayout.calculateCharacterLayout(0, enemies.length);
    return characterLayout.enemyPositions;
  }

  /**
   * 버튼 영역 정보를 계산합니다 (반응형)
   * @returns 버튼 영역 정보
   */
  public calculateButtonArea(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const uiLayout = this.responsiveLayout.calculateUILayout();
    return uiLayout.buttonArea;
  }

  /**
   * 화면 크기 정보를 반환합니다
   * @returns 화면 크기 정보
   */
  public getScreenSize(): { width: number; height: number } {
    return {
      width: this.currentWidth,
      height: this.currentHeight,
    };
  }

  /**
   * 화면 크기 변경 시 레이아웃 업데이트
   * @param width 새로운 화면 너비
   * @param height 새로운 화면 높이
   */
  public updateScreenSize(width: number, height: number): void {
    this.currentWidth = width;
    this.currentHeight = height;
    this.responsiveLayout.updateLayout(width, height);
  }

  /**
   * 현재 반응형 레이아웃 설정 반환
   */
  public getResponsiveConfig() {
    return this.responsiveLayout.getConfig();
  }

  /**
   * 캐릭터 레이아웃 정보 반환
   */
  public getCharacterLayout(heroCount: number, enemyCount: number): CharacterLayout {
    return this.responsiveLayout.calculateCharacterLayout(heroCount, enemyCount);
  }

  /**
   * UI 레이아웃 정보 반환
   */
  public getUILayout(): UILayout {
    return this.responsiveLayout.calculateUILayout();
  }
}
