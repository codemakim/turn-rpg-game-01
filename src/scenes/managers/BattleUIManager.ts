import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { CharacterUI } from '@/ui/components/CharacterUI';
import { ButtonGroup } from '@/ui/components/ButtonGroup';
import { type LayoutInfo } from './BattleLayoutManager';

/**
 * 전투 UI 관리자
 * UI 생성 및 관리 로직을 담당
 */
export class BattleUIManager {
  private scene: Phaser.Scene;
  private characterUIs: CharacterUI[] = [];
  private buttonGroup!: ButtonGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 배경을 생성합니다 (반응형)
   */
  public createBackground(): void {
    // 반응형 화면 크기에 맞춰 배경 생성
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    // 그라데이션 배경
    const graphics = this.scene.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    graphics.fillRect(0, 0, screenWidth, screenHeight);

    // 제목 표시 (중앙 정렬)
    this.scene.add.text(screenWidth / 2, 50, '턴제 RPG 전투', {
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
   * 레이아웃 변경 시 UI 재배치
   * @param layout 새로운 레이아웃 정보
   */
  public rearrangeLayout(layout: LayoutInfo): void {
    // 캐릭터 UI 위치 업데이트
    this.characterUIs.forEach((characterUI) => {
      if (characterUI.isHero) {
        // 아군 캐릭터 위치 업데이트
        const heroIndex = this.characterUIs.filter(ui => ui.isHero).indexOf(characterUI);
        if (heroIndex >= 0 && layout.heroPositions[heroIndex]) {
          characterUI.setPosition(layout.heroPositions[heroIndex]);
        }
      } else {
        // 적군 캐릭터 위치 업데이트
        const enemyIndex = this.characterUIs.filter(ui => !ui.isHero).indexOf(characterUI);
        if (enemyIndex >= 0 && layout.enemyPositions[enemyIndex]) {
          characterUI.setPosition(layout.enemyPositions[enemyIndex]);
        }
      }
    });

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
   * UI 관리자 파괴
   */
  public destroy(): void {
    // 모든 UI 컴포넌트 정리
    this.characterUIs.forEach(characterUI => characterUI.destroy());
    this.buttonGroup.destroy();
  }
}
