import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { CharacterUI } from '@/ui/components/CharacterUI';
import { Button } from '@/ui/components/Button';
import { type LayoutInfo } from './BattleLayoutManager';

/**
 * 전투 UI 관리자
 * UI 생성 및 관리 로직을 담당
 */
export class BattleUIManager {
  private scene: Phaser.Scene;
  private characterUIs: CharacterUI[] = [];
  private attackButton!: Button;
  private skillButtons: Button[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 배경을 생성합니다
   */
  public createBackground(): void {
    // 그라데이션 배경
    const graphics = this.scene.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    graphics.fillRect(0, 0, 1280, 720);

    // 제목 표시
    this.scene.add.text(640, 50, '턴제 RPG 전투', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
  }

  /**
   * 캐릭터 UI들을 생성합니다
   * @param heroes 아군 캐릭터 배열
   * @param enemies 적 캐릭터 배열
   * @param layout 레이아웃 정보
   */
  public createCharacterUIs(heroes: Character[], enemies: Character[], layout: LayoutInfo): void {
    // 기존 캐릭터 UI들 정리
    this.characterUIs.forEach(characterUI => characterUI.destroy());
    this.characterUIs = [];

    // 아군 캐릭터 UI 생성
    heroes.forEach((hero, index) => {
      const position = layout.heroPositions[index];
      const characterUI = new CharacterUI(this.scene, {
        x: position.x,
        y: position.y,
        character: hero,
        isHero: true,
      });
      this.characterUIs.push(characterUI);
    });

    // 적 캐릭터 UI 생성
    enemies.forEach((enemy, index) => {
      const position = layout.enemyPositions[index];
      const characterUI = new CharacterUI(this.scene, {
        x: position.x,
        y: position.y,
        character: enemy,
        isHero: false,
      });
      this.characterUIs.push(characterUI);
    });
  }

  /**
   * 버튼 UI를 생성합니다
   * @param layout 레이아웃 정보
   */
  public createButtonUI(layout: LayoutInfo): void {
    // 공격 버튼
    this.attackButton = new Button(this.scene, {
      x: layout.buttonArea.x,
      y: layout.buttonArea.y,
      text: '공격',
      buttonId: 'attack',
    });
    this.attackButton.disable();
  }

  /**
   * 버튼들을 활성화합니다
   * @param actor 현재 행동할 캐릭터
   */
  public enableButtons(actor: Character): void {
    this.attackButton.enable();

    // 기존 스킬 버튼들 제거
    this.skillButtons.forEach(btn => btn.destroy());
    this.skillButtons = [];

    // 스킬 버튼들 생성
    actor.skills.forEach((skill, index) => {
      const button = new Button(this.scene, {
        x: 300 + index * 170,
        y: 600,
        text: `${skill.name} (${skill.mpCost})`,
        buttonId: `skill-${skill.id}`,
        backgroundColor: skill.canUse(actor) ? '#2196F3' : '#666666',
      });

      if (!skill.canUse(actor)) {
        button.disable();
      }

      this.skillButtons.push(button);
    });
  }

  /**
   * 모든 버튼을 비활성화합니다
   */
  public disableAllButtons(): void {
    this.attackButton.disable();
    this.skillButtons.forEach(btn => btn.destroy());
    this.skillButtons = [];
  }

  /**
   * 턴 표시기를 업데이트합니다
   * @param activeCharacter 현재 활성 캐릭터
   */
  public updateTurnIndicators(activeCharacter: Character | null): void {
    this.characterUIs.forEach(characterUI => {
      const isActive = activeCharacter === characterUI.character;
      characterUI.setTurnIndicator(isActive);
    });
  }

  /**
   * 모든 캐릭터 UI를 업데이트합니다
   */
  public updateAllCharacterUIs(): void {
    this.characterUIs.forEach(characterUI => {
      characterUI.updateUI();
    });
  }

  /**
   * 캐릭터 UI 배열을 반환합니다
   * @returns 캐릭터 UI 배열
   */
  public getCharacterUIs(): CharacterUI[] {
    return this.characterUIs;
  }

  /**
   * 게임 오버 화면을 표시합니다
   * @param isVictory 승리 여부
   */
  public showGameOver(isVictory: boolean): void {
    const message = isVictory ? '승리!' : '패배!';
    const color = isVictory ? '#00ff00' : '#ff0000';

    this.scene.add.text(640, 360, message, {
      fontSize: '48px',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // 자동으로 타이틀로 돌아가기 (3초 후)
    this.scene.time.delayedCall(3000, () => {
      this.scene.scene.restart();
    });
  }

  /**
   * UI 관리자 파괴
   */
  public destroy(): void {
    // 모든 UI 컴포넌트 정리
    this.characterUIs.forEach(characterUI => characterUI.destroy());
    this.attackButton.destroy();
    this.skillButtons.forEach(btn => btn.destroy());
  }
}
