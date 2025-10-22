import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { ButtonGroup } from '@/ui/components/ButtonGroup';
import { type LayoutInfo } from '@/scenes/managers/BattleLayoutManager';

/**
 * 버튼 UI 관리자
 * 버튼 UI 생성 및 관리만 담당 (단일 책임)
 */
export class ButtonUIManager {
  private scene: Phaser.Scene;
  private buttonGroup!: ButtonGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 버튼 UI를 생성합니다
   * @param layout 레이아웃 정보
   */
  public createButtonUI(layout: LayoutInfo): void {
    // 버튼 그룹 생성 (모든 버튼을 하나의 컨테이너로 관리)
    this.buttonGroup = new ButtonGroup(this.scene, {
      x: layout.buttonArea.x,
      y: layout.buttonArea.y,
      width: layout.buttonArea.width,
      height: layout.buttonArea.height,
    });

    // 공격 버튼 생성
    this.buttonGroup.createAttackButton();
  }

  /**
   * 버튼들을 활성화합니다
   * @param actor 현재 행동할 캐릭터
   */
  public enableButtons(actor: Character): void {
    // 버튼 그룹에서 모든 버튼 활성화
    this.buttonGroup.enableButtons(actor);
  }

  /**
   * 모든 버튼을 비활성화합니다
   */
  public disableAllButtons(): void {
    this.buttonGroup.disableAllButtons();
  }

  /**
   * 버튼 UI를 재배치합니다
   * @param layout 새로운 레이아웃 정보
   */
  public rearrangeLayout(layout: LayoutInfo): void {
    // 버튼 그룹 위치 업데이트 (하나의 컨테이너로 관리)
    this.buttonGroup.setPosition(layout.buttonArea.x, layout.buttonArea.y);
  }

  /**
   * 공격 버튼 반환 (테스트용)
   */
  public getAttackButton() {
    return this.buttonGroup.getAttackButton();
  }

  /**
   * 스킬 버튼들 반환 (테스트용)
   */
  public getSkillButtons() {
    return this.buttonGroup.getSkillButtons();
  }

  /**
   * 버튼 그룹 반환 (테스트용)
   */
  public getButtonGroup() {
    return this.buttonGroup;
  }

  /**
   * 버튼 UI 관리자 파괴
   */
  public destroy(): void {
    if (this.buttonGroup) {
      this.buttonGroup.destroy();
    }
  }
}
