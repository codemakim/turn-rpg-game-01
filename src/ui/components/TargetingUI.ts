import Phaser from 'phaser';
import { Character } from '@/characters/Character';

/**
 * 타겟팅 UI 설정
 */
export interface TargetingUIConfig {
  x: number;
  y: number;
  size?: number;
  color?: number;
  borderColor?: number;
}

/**
 * 타겟팅 화살표 정보
 */
export interface TargetingArrow {
  graphics: Phaser.GameObjects.Graphics;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: number;
  size: number;
  isVisible: boolean;
}

/**
 * 타겟팅 UI 컴포넌트
 * 빨간색 화살표로 타겟팅을 시각적으로 표시합니다.
 */
export class TargetingUI {
  private scene: Phaser.Scene;
  private arrows: TargetingArrow[] = [];
  private config: Required<TargetingUIConfig>;
  private destroyed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.config = {
      x: 0,
      y: 0,
      size: 10,
      color: 0xff4444, // 빨간색
      borderColor: 0xffffff, // 흰색 테두리
    };
  }

  /**
   * 단일 대상에 대한 타겟팅 화살표를 표시합니다.
   * @param from 아군 캐릭터
   * @param to 적군 캐릭터
   */
  public showTargetingArrow(from: Character, to: Character): void {
    this.clearAllArrows();

    const arrow = this.createArrow(
      from.position.x,
      from.position.y,
      to.position.x,
      to.position.y
    );

    this.arrows.push(arrow);
    this.startPulseAnimation(arrow);
  }

  /**
   * 여러 대상에 대한 타겟팅 화살표를 표시합니다.
   * @param from 아군 캐릭터
   * @param targets 대상 캐릭터들
   */
  public showMultipleTargetingArrows(from: Character, targets: Character[]): void {
    this.clearAllArrows();

    targets.forEach(target => {
      const arrow = this.createArrow(
        from.position.x,
        from.position.y,
        target.position.x,
        target.position.y
      );

      this.arrows.push(arrow);
      this.startPulseAnimation(arrow);
    });
  }

  /**
   * 타겟팅 화살표를 숨깁니다.
   */
  public hideTargetingArrow(): void {
    this.clearAllArrows();
  }

  /**
   * 화살표가 표시되어 있는지 확인합니다.
   */
  public isArrowVisible(): boolean {
    return this.arrows.some(arrow => arrow.isVisible);
  }

  /**
   * 화살표 개수를 반환합니다.
   */
  public getArrowCount(): number {
    return this.arrows.length;
  }

  /**
   * 화살표 색상을 반환합니다.
   */
  public getArrowColor(): number {
    return this.config.color;
  }

  /**
   * 화살표 크기를 반환합니다.
   */
  public getArrowSize(): number {
    return this.config.size;
  }

  /**
   * 화살표 위치를 반환합니다.
   */
  public getArrowPosition(): { from: { x: number; y: number } | null; to: { x: number; y: number } | null } {
    if (this.arrows.length === 0) {
      return { from: null, to: null };
    }

    const firstArrow = this.arrows[0];
    return {
      from: firstArrow.from,
      to: firstArrow.to
    };
  }

  /**
   * 모든 화살표 정보를 반환합니다.
   */
  public getAllArrows(): TargetingArrow[] {
    return [...this.arrows];
  }

  /**
   * 펄스 애니메이션이 적용되어 있는지 확인합니다.
   */
  public hasPulseAnimation(): boolean {
    return this.arrows.some(arrow => arrow.graphics.alpha !== 1);
  }

  /**
   * 펄스 애니메이션 정보를 반환합니다.
   */
  public getPulseAnimation(): { alpha: number; duration: number; repeat: number } {
    return {
      alpha: 0.3,
      duration: 1000,
      repeat: -1
    };
  }

  /**
   * 화살표 위치를 업데이트합니다.
   */
  public updateArrowPositions(): void {
    this.arrows.forEach(arrow => {
      this.renderArrow(arrow);
    });
  }

  /**
   * 화살표 모양을 반환합니다.
   */
  public getArrowShape(): { type: string; direction: string } {
    return {
      type: 'triangle',
      direction: 'down'
    };
  }

  /**
   * 화살표 스타일을 반환합니다.
   */
  public getArrowStyle(): { borderColor: number; borderWidth: number } {
    return {
      borderColor: this.config.borderColor,
      borderWidth: 1
    };
  }

  /**
   * 모든 화살표를 제거합니다.
   */
  public clearAllArrows(): void {
    this.arrows.forEach(arrow => {
      arrow.graphics.destroy();
    });
    this.arrows = [];
  }

  /**
   * UI가 파괴되었는지 확인합니다.
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * 화살표를 생성합니다.
   */
  private createArrow(fromX: number, fromY: number, toX: number, toY: number): TargetingArrow {
    const graphics = this.scene.add.graphics();

    const arrow: TargetingArrow = {
      graphics,
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
      color: this.config.color,
      size: this.config.size,
      isVisible: true
    };

    this.renderArrow(arrow);
    return arrow;
  }

  /**
   * 화살표를 렌더링합니다.
   */
  private renderArrow(arrow: TargetingArrow): void {
    arrow.graphics.clear();

    if (!arrow.isVisible) return;

    const { from, to, color, size } = arrow;

    // 화살표 방향 계산 (from에서 to로)
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 화살표 위치 (대상 근처)
    const arrowX = to.x - (dx / distance) * 30; // 대상으로부터 30픽셀 떨어진 위치
    const arrowY = to.y - (dy / distance) * 30;

    // 역삼각형 그리기 (아래쪽을 향한 화살표)
    arrow.graphics.fillStyle(color, 1);
    arrow.graphics.beginPath();
    arrow.graphics.moveTo(arrowX, arrowY - size * 1.5); // 위쪽 꼭짓점
    arrow.graphics.lineTo(arrowX - size, arrowY - size * 0.5); // 왼쪽 아래
    arrow.graphics.lineTo(arrowX + size, arrowY - size * 0.5); // 오른쪽 아래
    arrow.graphics.closePath();
    arrow.graphics.fillPath();

    // 테두리
    arrow.graphics.lineStyle(1, this.config.borderColor, 1);
    arrow.graphics.beginPath();
    arrow.graphics.moveTo(arrowX, arrowY - size * 1.5);
    arrow.graphics.lineTo(arrowX - size, arrowY - size * 0.5);
    arrow.graphics.lineTo(arrowX + size, arrowY - size * 0.5);
    arrow.graphics.closePath();
    arrow.graphics.strokePath();
  }

  /**
   * 펄스 애니메이션을 시작합니다.
   */
  private startPulseAnimation(arrow: TargetingArrow): void {
    this.scene.tweens.add({
      targets: arrow.graphics,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * UI를 파괴합니다.
   */
  public destroy(): void {
    this.clearAllArrows();
    this.destroyed = true;
  }
}
