import Phaser from 'phaser';
import { eventBus } from '@/core/EventBus';

/**
 * 애니메이션 관리자 (애니메이션만 담당)
 * EventBus를 통해 애니메이션 요청을 받아 처리
 */
export class AnimationManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 데미지 애니메이션 이벤트
    eventBus.on('animation:damage', (data) => {
      this.showDamageAnimation(data.target.position, data.damage, data.isCritical);
    });

    // 회복 애니메이션 이벤트
    eventBus.on('animation:heal', (data) => {
      this.showHealAnimation(data.target.position, data.amount);
    });

    // 캐릭터 흔들림 애니메이션 이벤트
    eventBus.on('animation:shake', (data) => {
      this.shakeCharacter(data.target);
    });
  }

  /**
   * 데미지 애니메이션 표시
   * @param position 위치 정보
   * @param damage 데미지량
   * @param isCritical 크리티컬 여부
   */
  public showDamageAnimation(position: { x: number; y: number }, damage: number, isCritical: boolean): void {
    const damageText = this.scene.add.text(position.x, position.y - 30, `-${damage}`, {
      fontSize: '24px',
      color: isCritical ? '#ff0000' : '#ffff00',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // 데미지 텍스트 애니메이션
    this.scene.tweens.add({
      targets: damageText,
      y: position.y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy(),
    });
  }

  /**
   * 회복 애니메이션 표시
   * @param position 위치 정보
   * @param amount 회복량
   */
  public showHealAnimation(position: { x: number; y: number }, amount: number): void {
    const healText = this.scene.add.text(position.x, position.y - 30, `+${amount}`, {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // 회복 텍스트 애니메이션
    this.scene.tweens.add({
      targets: healText,
      y: position.y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => healText.destroy(),
    });
  }

  /**
   * 캐릭터 흔들림 애니메이션
   * @param target 대상 캐릭터
   */
  private shakeCharacter(target: any): void {
    // 타겟의 컨테이너를 가져와야 함 (UI 컴포넌트에서 제공)
    // 현재는 임시 구현
    console.log('캐릭터 흔들림 애니메이션:', target.name);

    // 실제 구현은 CharacterUI 컴포넌트에서 제공할 예정
  }

  /**
   * 애니메이션 관리자 파괴
   */
  public destroy(): void {
    // 이벤트 리스너는 EventBus에서 자동으로 정리됨
  }
}
