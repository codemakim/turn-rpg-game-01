import Phaser from 'phaser';

/**
 * HP/MP 바 UI 컴포넌트 (순수 UI만 담당)
 */
export interface StatusBarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  maxValue: number;
  currentValue: number;
  color: number;
  label: string;
}

export class StatusBar {
  public readonly graphics: Phaser.GameObjects.Graphics;
  private label: string;
  private maxValue: number;
  private currentValue: number;
  private color: number;
  private width: number;
  private height: number;
  private x: number;
  private y: number;

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: StatusBarConfig) {
    this.scene = scene;
    this.graphics = this.scene.add.graphics();
    this.label = config.label;
    this.maxValue = config.maxValue;
    this.currentValue = config.currentValue;
    this.color = config.color;
    this.width = config.width;
    this.height = config.height;
    this.x = config.x;
    this.y = config.y;

    this.render();
  }

  /**
   * 상태바 렌더링 (순수 UI 렌더링만)
   */
  private render(): void {
    this.graphics.clear();

    // 배경 (검은색)
    this.graphics.fillStyle(0x333333, 1);
    this.graphics.fillRect(this.x, this.y, this.width, this.height);

    // 현재 값 바
    const ratio = this.maxValue > 0 ? this.currentValue / this.maxValue : 0;
    const barWidth = this.width * ratio;

    this.graphics.fillStyle(this.color, 1);
    this.graphics.fillRect(this.x, this.y, barWidth, this.height);

    // 테두리
    this.graphics.lineStyle(1, 0xffffff, 1);
    this.graphics.strokeRect(this.x, this.y, this.width, this.height);
  }

  /**
   * 현재 값 업데이트
   */
  public updateValue(currentValue: number): void {
    this.currentValue = currentValue;
    this.render();
  }

  /**
   * 최대 값 업데이트
   */
  public updateMaxValue(maxValue: number): void {
    this.maxValue = maxValue;
    this.render();
  }

  /**
   * 값들 업데이트
   */
  public updateValues(currentValue: number, maxValue: number): void {
    this.currentValue = currentValue;
    this.maxValue = maxValue;
    this.render();
  }

  /**
   * 위치 변경
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.render();
  }

  /**
   * 크기 변경
   */
  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.render();
  }

  /**
   * 색상 변경
   */
  public setColor(color: number): void {
    this.color = color;
    this.render();
  }

  /**
   * 표시/숨김
   */
  public setVisible(visible: boolean): void {
    this.graphics.setVisible(visible);
  }

  /**
   * 알파값 설정
   */
  public setAlpha(alpha: number): void {
    this.graphics.setAlpha(alpha);
  }

  /**
   * 현재 값 반환
   */
  public getCurrentValue(): number {
    return this.currentValue;
  }

  /**
   * 최대 값 반환
   */
  public getMaxValue(): number {
    return this.maxValue;
  }

  /**
   * 비율 반환 (0-1)
   */
  public getRatio(): number {
    return this.maxValue > 0 ? this.currentValue / this.maxValue : 0;
  }

  /**
   * 라벨 반환
   */
  public getLabel(): string {
    return this.label;
  }

  /**
   * 상태바 파괴
   */
  public destroy(): void {
    this.graphics.destroy();
  }
}
