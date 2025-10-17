import Phaser from 'phaser';

/**
 * 턴 표시기 UI 컴포넌트 (순수 UI만 담당)
 */
export interface TurnIndicatorConfig {
  x: number;
  y: number;
  size?: number;
  color?: number;
  borderColor?: number;
}

export class TurnIndicator {
  public readonly graphics: Phaser.GameObjects.Graphics;
  private config: TurnIndicatorConfig;
  private isVisible: boolean = false;

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: TurnIndicatorConfig) {
    this.scene = scene;
    this.config = {
      size: 10,
      color: 0xffd700, // 노란색
      borderColor: 0xffffff, // 흰색
      ...config,
    };

    this.graphics = this.scene.add.graphics();
    this.render();
  }

  /**
   * 턴 표시기 렌더링 (순수 UI 렌더링만)
   */
  private render(): void {
    this.graphics.clear();

    if (!this.isVisible) {
      return;
    }

    const { x, y, size, color, borderColor } = this.config;

    // 역삼각형 그리기
    this.graphics.fillStyle(color!, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(x, y - size! * 1.5); // 위쪽 꼭짓점
    this.graphics.lineTo(x - size!, y - size! * 0.5); // 왼쪽 아래
    this.graphics.lineTo(x + size!, y - size! * 0.5); // 오른쪽 아래
    this.graphics.closePath();
    this.graphics.fillPath();

    // 테두리
    this.graphics.lineStyle(1, borderColor!, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(x, y - size! * 1.5);
    this.graphics.lineTo(x - size!, y - size! * 0.5);
    this.graphics.lineTo(x + size!, y - size! * 0.5);
    this.graphics.closePath();
    this.graphics.strokePath();
  }

  /**
   * 턴 표시기 표시
   */
  public show(): void {
    this.isVisible = true;
    this.render();
  }

  /**
   * 턴 표시기 숨김
   */
  public hide(): void {
    this.isVisible = false;
    this.render();
  }

  /**
   * 위치 변경
   */
  public setPosition(x: number, y: number): void {
    this.config.x = x;
    this.config.y = y;
    this.render();
  }

  /**
   * 크기 변경
   */
  public setSize(size: number): void {
    this.config.size = size;
    this.render();
  }

  /**
   * 색상 변경
   */
  public setColor(color: number): void {
    this.config.color = color;
    this.render();
  }

  /**
   * 테두리 색상 변경
   */
  public setBorderColor(borderColor: number): void {
    this.config.borderColor = borderColor;
    this.render();
  }

  /**
   * 알파값 설정
   */
  public setAlpha(alpha: number): void {
    this.graphics.setAlpha(alpha);
  }

  /**
   * 현재 표시 상태 반환
   */
  public isShown(): boolean {
    return this.isVisible;
  }

  /**
   * 현재 위치 반환
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.config.x, y: this.config.y };
  }

  /**
   * 턴 표시기 파괴
   */
  public destroy(): void {
    this.graphics.destroy();
  }
}
