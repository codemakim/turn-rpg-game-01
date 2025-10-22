import Phaser from 'phaser';
import { Button } from './Button';
import { Character } from '@/characters/Character';

/**
 * 버튼 그룹 설정 인터페이스
 */
export interface ButtonGroupConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  buttonWidth?: number;
  buttonSpacing?: number;
}

/**
 * 버튼 그룹 컴포넌트
 * 공격 버튼과 스킬 버튼들을 하나의 컨테이너로 관리
 */
export class ButtonGroup {
  private container: Phaser.GameObjects.Container;
  private attackButton!: Button;
  private skillButtons: Button[] = [];
  private config: ButtonGroupConfig;

  public readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: ButtonGroupConfig) {
    this.scene = scene;
    this.config = {
      buttonWidth: 100,
      buttonSpacing: 10,
      ...config,
    };

    // 메인 컨테이너 생성
    this.container = this.scene.add.container(config.x, config.y);
  }

  /**
   * 공격 버튼 생성
   */
  public createAttackButton(): void {
    const buttonWidth = this.config.buttonWidth!;
    const buttonSpacing = this.config.buttonSpacing!;

    // 공격 버튼을 컨테이너 내 첫 번째 위치에 배치
    this.attackButton = new Button(this.scene, {
      x: buttonWidth / 2,
      y: this.config.height / 2,
      text: '공격',
      buttonId: 'attack',
    });

    this.container.add(this.attackButton.textObject);
    this.attackButton.disable();
  }

  /**
   * 스킬 버튼들 생성
   * @param actor 현재 행동할 캐릭터
   */
  public createSkillButtons(actor: Character): void {
    // 기존 스킬 버튼들 제거
    this.skillButtons.forEach(btn => btn.destroy());
    this.skillButtons = [];

    const buttonWidth = this.config.buttonWidth!;
    const buttonSpacing = this.config.buttonSpacing!;

    // 스킬 버튼들을 공격 버튼 다음부터 순차 배치
    actor.skills.forEach((skill, index) => {
      const x = buttonWidth / 2 + (buttonWidth + buttonSpacing) * (index + 1);
      const y = this.config.height / 2;

      const button = new Button(this.scene, {
        x,
        y,
        text: `${skill.name} (${skill.mpCost})`,
        buttonId: `skill-${skill.id}`,
        backgroundColor: skill.canUse(actor) ? '#2196F3' : '#666666',
      });

      if (!skill.canUse(actor)) {
        button.disable();
      }

      this.skillButtons.push(button);
      this.container.add(button.textObject);
    });
  }

  /**
   * 모든 버튼 활성화
   * @param actor 현재 행동할 캐릭터
   */
  public enableButtons(actor: Character): void {
    this.attackButton.enable();
    this.createSkillButtons(actor);
  }

  /**
   * 모든 버튼 비활성화
   */
  public disableAllButtons(): void {
    this.attackButton.disable();
    this.skillButtons.forEach(btn => btn.destroy());
    this.skillButtons = [];
  }

  /**
   * 버튼 그룹 위치 설정
   * @param x X 좌표
   * @param y Y 좌표
   */
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * 공격 버튼 반환
   */
  public getAttackButton(): Button {
    return this.attackButton;
  }

  /**
   * 스킬 버튼들 반환
   */
  public getSkillButtons(): Button[] {
    return this.skillButtons;
  }

  /**
   * 버튼 그룹 파괴
   */
  public destroy(): void {
    this.container.destroy();
    this.skillButtons.forEach(btn => btn.destroy());
  }
}
