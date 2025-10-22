/**
 * 반응형 레이아웃 시스템
 * 다양한 화면 크기와 비율에 대응하는 UI 레이아웃 관리
 */

/**
 * 화면 크기 분류
 */
export const ScreenSize = {
  MOBILE_PORTRAIT: 'mobile-portrait',
  MOBILE_LANDSCAPE: 'mobile-landscape', 
  TABLET_PORTRAIT: 'tablet-portrait',
  TABLET_LANDSCAPE: 'tablet-landscape',
  DESKTOP: 'desktop',
  ULTRAWIDE: 'ultrawide'
} as const;

export type ScreenSize = typeof ScreenSize[keyof typeof ScreenSize];

/**
 * 화면 비율 분류
 */
export const AspectRatio = {
  PORTRAIT: 'portrait',      // 9:16, 3:4
  LANDSCAPE: 'landscape',    // 16:9, 4:3
  SQUARE: 'square'           // 1:1
} as const;

export type AspectRatio = typeof AspectRatio[keyof typeof AspectRatio];

/**
 * 레이아웃 설정 인터페이스
 */
export interface LayoutConfig {
  screenSize: ScreenSize;
  aspectRatio: AspectRatio;
  baseWidth: number;
  baseHeight: number;
  scale: number;
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * 캐릭터 배치 정보
 */
export interface CharacterLayout {
  heroPositions: { x: number; y: number }[];
  enemyPositions: { x: number; y: number }[];
  characterSize: number;
  characterSpacing: number;
}

/**
 * UI 영역 정보
 */
export interface UILayout {
  buttonArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  statusArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };
}

/**
 * 반응형 레이아웃 매니저
 * 화면 크기 분류와 레이아웃 계산만 담당 (단일 책임)
 */
export class ResponsiveLayout {
  private config: LayoutConfig;
  private readonly BASE_WIDTH = 1280;
  private readonly BASE_HEIGHT = 720;

  constructor(width: number, height: number) {
    this.config = this.calculateConfig(width, height);
  }

  /**
   * 화면 크기와 비율에 따른 설정 계산
   */
  private calculateConfig(width: number, height: number): LayoutConfig {
    const aspectRatio = width / height;
    const screenSize = this.determineScreenSize(width, height);
    const aspectRatioType = this.determineAspectRatio(aspectRatio);
    
    // 기본 스케일 계산 (가로 기준)
    const scale = Math.min(width / this.BASE_WIDTH, height / this.BASE_HEIGHT);
    
    // 안전 영역 계산 (모바일에서 노치/홈 인디케이터 고려)
    const safeArea = this.calculateSafeArea(screenSize, width, height);

    return {
      screenSize,
      aspectRatio: aspectRatioType,
      baseWidth: width,
      baseHeight: height,
      scale,
      safeArea
    };
  }

  /**
   * 화면 크기 분류
   */
  private determineScreenSize(width: number, height: number): ScreenSize {
    const maxDimension = Math.max(width, height);
    const minDimension = Math.min(width, height);
    const aspectRatio = width / height;

    // 모바일: 최대 크기가 480 이하이거나, 가로/세로 중 하나가 480 이하
    if (maxDimension <= 480 || minDimension <= 480) {
      return aspectRatio > 1 ? ScreenSize.MOBILE_LANDSCAPE : ScreenSize.MOBILE_PORTRAIT;
    } 
    // 태블릿: 최대 크기가 1024 이하
    else if (maxDimension <= 1024) {
      return aspectRatio > 1 ? ScreenSize.TABLET_LANDSCAPE : ScreenSize.TABLET_PORTRAIT;
    } 
    // 울트라와이드: 비율이 2.0 이상
    else if (aspectRatio > 2.0) {
      return ScreenSize.ULTRAWIDE;
    } 
    // 데스크톱
    else {
      return ScreenSize.DESKTOP;
    }
  }

  /**
   * 화면 비율 분류
   */
  private determineAspectRatio(ratio: number): AspectRatio {
    if (ratio > 1.2) return AspectRatio.LANDSCAPE;
    if (ratio < 0.8) return AspectRatio.PORTRAIT;
    return AspectRatio.SQUARE;
  }

  /**
   * 안전 영역 계산
   */
  private calculateSafeArea(screenSize: ScreenSize, width: number, height: number): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } {
    const baseSafeArea = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };

    // 모바일 세로 모드에서 상단 안전 영역
    if (screenSize === ScreenSize.MOBILE_PORTRAIT) {
      baseSafeArea.top = Math.min(50, height * 0.08);
      baseSafeArea.bottom = Math.min(30, height * 0.05);
    }
    
    // 모바일 가로 모드에서 좌우 안전 영역
    if (screenSize === ScreenSize.MOBILE_LANDSCAPE) {
      baseSafeArea.left = Math.min(20, width * 0.03);
      baseSafeArea.right = Math.min(20, width * 0.03);
    }

    return baseSafeArea;
  }

  /**
   * 캐릭터 레이아웃 계산
   */
  public calculateCharacterLayout(heroCount: number, enemyCount: number): CharacterLayout {
    const { screenSize, aspectRatio, baseWidth, baseHeight, scale, safeArea } = this.config;
    
    // 기본 캐릭터 크기와 간격
    let characterSize = 50 * scale;
    let characterSpacing = 120 * scale;
    
    // 화면 크기별 조정
    switch (screenSize) {
      case ScreenSize.MOBILE_PORTRAIT:
        characterSize = 40 * scale;
        characterSpacing = 80 * scale;
        break;
      case ScreenSize.MOBILE_LANDSCAPE:
        characterSize = 35 * scale;
        characterSpacing = 100 * scale;
        break;
      case ScreenSize.TABLET_PORTRAIT:
        characterSize = 45 * scale;
        characterSpacing = 100 * scale;
        break;
    }

    // 세로 모드에서 간격 조정
    if (aspectRatio === AspectRatio.PORTRAIT) {
      characterSpacing *= 0.8;
    }

    // 아군 위치 계산
    const heroStartX = safeArea.left + (baseWidth * 0.15);
    const heroStartY = safeArea.top + (baseHeight * 0.2);
    const heroPositions = Array.from({ length: heroCount }, (_, index) => ({
      x: heroStartX,
      y: heroStartY + index * characterSpacing
    }));

    // 적군 위치 계산
    const enemyStartX = baseWidth - safeArea.right - (baseWidth * 0.15);
    const enemyStartY = safeArea.top + (baseHeight * 0.2);
    const enemyPositions = Array.from({ length: enemyCount }, (_, index) => ({
      x: enemyStartX,
      y: enemyStartY + index * characterSpacing
    }));

    return {
      heroPositions,
      enemyPositions,
      characterSize,
      characterSpacing
    };
  }

  /**
   * UI 레이아웃 계산
   */
  public calculateUILayout(): UILayout {
    const { screenSize, baseWidth, baseHeight, scale, safeArea } = this.config;
    
    // 버튼 영역 계산
    const buttonArea = {
      x: safeArea.left + (baseWidth * 0.05),
      y: baseHeight - safeArea.bottom - (baseHeight * 0.15),
      width: baseWidth - safeArea.left - safeArea.right - (baseWidth * 0.1),
      height: baseHeight * 0.1
    };

    // 상태 영역 계산 (모바일에서는 상단, 데스크톱에서는 하단)
    const statusArea = screenSize === ScreenSize.MOBILE_PORTRAIT 
      ? {
          x: safeArea.left + (baseWidth * 0.05),
          y: safeArea.top + (baseHeight * 0.05),
          width: baseWidth - safeArea.left - safeArea.right - (baseWidth * 0.1),
          height: baseHeight * 0.15
        }
      : {
          x: safeArea.left + (baseWidth * 0.05),
          y: baseHeight - safeArea.bottom - (baseHeight * 0.3),
          width: baseWidth - safeArea.left - safeArea.right - (baseWidth * 0.1),
          height: baseHeight * 0.2
        };

    // 폰트 크기 계산
    const baseFontSize = 16 * scale;
    const fontSize = {
      small: baseFontSize * 0.75,
      medium: baseFontSize,
      large: baseFontSize * 1.25
    };

    return {
      buttonArea,
      statusArea,
      fontSize
    };
  }

  /**
   * 현재 설정 반환
   */
  public getConfig(): LayoutConfig {
    return this.config;
  }

  /**
   * 화면 크기 변경 시 레이아웃 재계산
   */
  public updateLayout(width: number, height: number): void {
    this.config = this.calculateConfig(width, height);
  }
}

