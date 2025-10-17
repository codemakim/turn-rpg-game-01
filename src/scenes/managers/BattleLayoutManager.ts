import { Character } from '@/characters/Character';

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
  private readonly SCREEN_WIDTH = 1280;
  private readonly SCREEN_HEIGHT = 720;
  private readonly HERO_START_X = 200;
  private readonly ENEMY_START_X = 1080;
  private readonly CHARACTER_START_Y = 150;
  private readonly CHARACTER_SPACING = 120;
  private readonly BUTTON_AREA_X = 100;
  private readonly BUTTON_AREA_Y = 600;
  private readonly BUTTON_AREA_WIDTH = 1080;
  private readonly BUTTON_AREA_HEIGHT = 80;

  /**
   * 전체 레이아웃을 계산합니다
   * @param heroes 아군 캐릭터 배열
   * @param enemies 적 캐릭터 배열
   * @returns 레이아웃 정보
   */
  public calculateLayout(heroes: Character[], enemies: Character[]): LayoutInfo {
    return {
      heroPositions: this.calculateHeroPositions(heroes),
      enemyPositions: this.calculateEnemyPositions(enemies),
      buttonArea: this.calculateButtonArea(),
    };
  }

  /**
   * 아군 캐릭터들의 위치를 계산합니다
   * @param heroes 아군 캐릭터 배열
   * @returns 아군 위치 배열
   */
  public calculateHeroPositions(heroes: Character[]): { x: number; y: number }[] {
    return heroes.map((_, index) => ({
      x: this.HERO_START_X,
      y: this.CHARACTER_START_Y + index * this.CHARACTER_SPACING,
    }));
  }

  /**
   * 적 캐릭터들의 위치를 계산합니다
   * @param enemies 적 캐릭터 배열
   * @returns 적 위치 배열
   */
  public calculateEnemyPositions(enemies: Character[]): { x: number; y: number }[] {
    return enemies.map((_, index) => ({
      x: this.ENEMY_START_X,
      y: this.CHARACTER_START_Y + index * this.CHARACTER_SPACING,
    }));
  }

  /**
   * 버튼 영역 정보를 계산합니다
   * @returns 버튼 영역 정보
   */
  public calculateButtonArea(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: this.BUTTON_AREA_X,
      y: this.BUTTON_AREA_Y,
      width: this.BUTTON_AREA_WIDTH,
      height: this.BUTTON_AREA_HEIGHT,
    };
  }

  /**
   * 화면 크기 정보를 반환합니다
   * @returns 화면 크기 정보
   */
  public getScreenSize(): { width: number; height: number } {
    return {
      width: this.SCREEN_WIDTH,
      height: this.SCREEN_HEIGHT,
    };
  }
}
