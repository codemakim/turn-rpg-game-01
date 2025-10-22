import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { CharacterUIManager } from '@/ui/managers/CharacterUIManager';
import { ButtonUIManager } from '@/ui/managers/ButtonUIManager';
import { TargetingManager } from './TargetingManager';
import { type LayoutInfo } from './BattleLayoutManager';
import type { TargetingResult } from '@/types';
import { Skill } from '@/battle/Skill';

/**
 * 전투 UI 관리자
 * UI 관리자들을 조합하여 전체 UI를 관리 (조합 패턴)
 */
export class BattleUIManager {
  private scene: Phaser.Scene;
  private characterUIManager: CharacterUIManager;
  private buttonUIManager: ButtonUIManager;
  private targetingManager: TargetingManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.characterUIManager = new CharacterUIManager(scene);
    this.buttonUIManager = new ButtonUIManager(scene);
    this.targetingManager = new TargetingManager(scene);
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
    this.characterUIManager.createCharacterUIs(heroes, enemies, layout);
  }

  /**
   * 버튼 UI를 생성합니다
   * @param layout 레이아웃 정보
   */
  public createButtonUI(layout: LayoutInfo): void {
    this.buttonUIManager.createButtonUI(layout);
  }

  /**
   * 버튼들을 활성화합니다
   * @param actor 현재 행동할 캐릭터
   */
  public enableButtons(actor: Character): void {
    this.buttonUIManager.enableButtons(actor);
  }

  /**
   * 모든 버튼을 비활성화합니다
   */
  public disableAllButtons(): void {
    this.buttonUIManager.disableAllButtons();
  }

  /**
   * 턴 표시기를 업데이트합니다
   * @param activeCharacter 현재 활성 캐릭터
   */
  public updateTurnIndicators(activeCharacter: Character | null): void {
    this.characterUIManager.getCharacterUIs().forEach(characterUI => {
      const isActive = activeCharacter === characterUI.character;
      characterUI.setTurnIndicator(isActive);
    });
  }

  /**
   * 모든 캐릭터 UI를 업데이트합니다
   */
  public updateAllCharacterUIs(): void {
    this.characterUIManager.getCharacterUIs().forEach(characterUI => {
      characterUI.updateUI();
    });
  }

  /**
   * 캐릭터 UI 배열을 반환합니다
   * @returns 캐릭터 UI 배열
   */
  public getCharacterUIs() {
    return this.characterUIManager.getCharacterUIs();
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
    // 캐릭터 UI 재배치
    this.characterUIManager.rearrangeLayout(layout);

    // 버튼 UI 재배치
    this.buttonUIManager.rearrangeLayout(layout);
  }

  /**
   * 공격 버튼 반환 (테스트용)
   */
  public getAttackButton() {
    return this.buttonUIManager.getAttackButton();
  }

  /**
   * 스킬 버튼들 반환 (테스트용)
   */
  public getSkillButtons() {
    return this.buttonUIManager.getSkillButtons();
  }


  /**
   * 타겟팅 모드를 시작합니다
   * @param skill 사용할 스킬
   * @param heroes 아군 캐릭터들
   * @param enemies 적군 캐릭터들
   * @param caster 스킬 사용자
   */
  public startTargetingMode(skill: Skill, heroes: Character[], enemies: Character[], caster: Character): void {
    this.targetingManager.startTargetingMode(skill, heroes, enemies, caster);
  }

  /**
   * 타겟팅을 취소합니다
   */
  public cancelTargeting(): void {
    this.targetingManager.cancelTargeting();
  }

  /**
   * 타겟팅을 완료합니다
   */
  public completeTargeting(): TargetingResult {
    return this.targetingManager.completeTargeting();
  }

  /**
   * 타겟팅 모드인지 확인합니다
   */
  public isTargetingMode(): boolean {
    return this.targetingManager.isTargetingMode();
  }

  /**
   * 캐릭터 클릭 이벤트를 처리합니다
   * @param character 클릭된 캐릭터
   */
  public handleCharacterClick(character: Character): TargetingResult {
    if (this.isTargetingMode()) {
      return this.targetingManager.selectTarget(character);
    }
    return { success: false, message: '타겟팅 모드가 아닙니다.' };
  }

  /**
   * 마우스 클릭 이벤트를 처리합니다
   * @param x X 좌표
   * @param y Y 좌표
   */
  public handleMouseClick(x: number, y: number): TargetingResult {
    if (this.isTargetingMode()) {
      return this.targetingManager.handleMouseClick({ x, y });
    }
    return { success: false, message: '타겟팅 모드가 아닙니다.' };
  }

  /**
   * 키 입력을 처리합니다
   * @param keyCode 키 코드
   */
  public handleKeyPress(keyCode: string): TargetingResult {
    if (this.isTargetingMode()) {
      return this.targetingManager.handleKeyPress(keyCode);
    }
    return { success: false, message: '타겟팅 모드가 아닙니다.' };
  }

  /**
   * 타겟팅 UI를 업데이트합니다
   */
  public updateTargetingUI(): void {
    this.targetingManager.updateTargetingUI();
  }

  /**
   * 화면 크기 변경 시 호출됩니다
   */
  public onResize(): void {
    this.targetingManager.onResize();
  }

  /**
   * UI 관리자 파괴
   */
  public destroy(): void {
    // 모든 UI 관리자 파괴
    this.characterUIManager.destroy();
    this.buttonUIManager.destroy();
    this.targetingManager.destroy();
  }
}
