import Phaser from 'phaser';
import { eventBus } from '@/core/EventBus';

/**
 * 버튼 UI 컴포넌트 (순수 UI만 담당)
 * 이벤트 처리는 EventBus를 통해 분리
 */
export interface ButtonConfig {
  x: number;
  y: number;
  text: string;
  width?: number;
  height?: number;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  padding?: { x: number; y: number };
  buttonId: string; // 이벤트 식별용
}

export class Button {
  private buttonId: string;
  private textObject: Phaser.GameObjects.Text;
  private isEnabled: boolean = true;

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    this.scene = scene;
    this.buttonId = config.buttonId;

    // 버튼 텍스트 생성
    this.textObject = this.scene.add.text(config.x, config.y, config.text, {
      fontSize: config.fontSize || '18px',
      color: config.color || '#ffffff',
      backgroundColor: config.backgroundColor || '#2196F3',
      padding: config.padding || { x: 30, y: 15 },
      fontStyle: 'bold',
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5);

    // 기본 이벤트 리스너 등록
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.textObject
      .on('pointerdown', () => {
        if (this.isEnabled) {
          eventBus.emit('ui:button-click', { buttonId: this.buttonId });
        }
      })
      .on('pointerover', () => {
        if (this.isEnabled) {
          eventBus.emit('ui:button-hover', { buttonId: this.buttonId });
          this.playHoverAnimation();
        }
      })
      .on('pointerout', () => {
        if (this.isEnabled) {
          eventBus.emit('ui:button-out', { buttonId: this.buttonId });
          this.playOutAnimation();
        }
      });
  }

  /**
   * 호버 애니메이션 (순수 UI 애니메이션만)
   */
  private playHoverAnimation(): void {
    this.scene.tweens.add({
      targets: this.textObject,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power1',
    });
  }

  /**
   * 아웃 애니메이션 (순수 UI 애니메이션만)
   */
  private playOutAnimation(): void {
    this.scene.tweens.add({
      targets: this.textObject,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power1',
    });
  }

  /**
   * 버튼 활성화
   */
  public enable(): void {
    this.isEnabled = true;
    this.textObject.setAlpha(1).setInteractive();
  }

  /**
   * 버튼 비활성화
   */
  public disable(): void {
    this.isEnabled = false;
    this.textObject.setAlpha(0.5).disableInteractive();
  }

  /**
   * 버튼 텍스트 변경
   */
  public setText(text: string): void {
    this.textObject.setText(text);
  }

  /**
   * 텍스트 객체 반환 (외부 접근용)
   */
  public getTextObject(): Phaser.GameObjects.Text {
    return this.textObject;
  }

  /**
   * 버튼 색상 변경
   */
  public setColor(color: string, backgroundColor?: string): void {
    this.textObject.setStyle({
      color: color,
      backgroundColor: backgroundColor,
    });
  }

  /**
   * 버튼 위치 변경
   */
  public setPosition(x: number, y: number): void {
    this.textObject.setPosition(x, y);
  }

  /**
   * 버튼 표시/숨김
   */
  public setVisible(visible: boolean): void {
    this.textObject.setVisible(visible);
  }

  /**
   * 버튼 파괴
   */
  public destroy(): void {
    this.textObject.destroy();
  }

  /**
   * 버튼 ID 반환
   */
  public getButtonId(): string {
    return this.buttonId;
  }

  /**
   * 현재 활성화 상태 반환
   */
  public isButtonEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 버튼 위치 반환
   */
  public getPosition(): { x: number; y: number } {
    return {
      x: this.textObject.x,
      y: this.textObject.y,
    };
  }
}
