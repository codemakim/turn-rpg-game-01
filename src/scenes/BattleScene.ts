import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { BattleController } from '@/battle/BattleController';
import { AnimationManager } from '@/animation/AnimationManager';
import { BattleInputHandler } from '@/input/BattleInputHandler';
import { BattleCharacterFactory } from './managers/BattleCharacterFactory';
import { BattleLayoutManager, type LayoutInfo } from './managers/BattleLayoutManager';
import { BattleUIManager } from './managers/BattleUIManager';
import { BattleEventManager } from './managers/BattleEventManager';

/**
 * 전투 씬 - 오케스트레이션만 담당
 * 모든 세부 로직은 모듈화된 매니저들에게 위임
 */
export class BattleScene extends Phaser.Scene {
  // 게임 데이터
  private heroes: Character[] = [];
  private enemies: Character[] = [];

  // 매니저들
  private controller!: BattleController;
  private animationManager!: AnimationManager;
  private inputHandler!: BattleInputHandler;
  private characterFactory!: BattleCharacterFactory;
  private layoutManager!: BattleLayoutManager;
  private uiManager!: BattleUIManager;
  private eventManager!: BattleEventManager;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    this.initializeSystems();
    this.uiManager.createBackground();
    this.createCharacters();
    this.controller = new BattleController(this.heroes, this.enemies);
    this.inputHandler.setController(this.controller);
    this.eventManager = new BattleEventManager(
      this,
      this.controller,
      this.inputHandler,
      this.uiManager,
      this.animationManager,
      this.heroes,
      this.enemies
    );
    this.createUI();
  }


  private initializeSystems(): void {
    this.animationManager = new AnimationManager(this);
    this.inputHandler = new BattleInputHandler();
    this.characterFactory = new BattleCharacterFactory();
    // 화면 크기에 맞춰 레이아웃 매니저 초기화
    this.layoutManager = new BattleLayoutManager(this.scale.width, this.scale.height);
    this.uiManager = new BattleUIManager(this);

    // 화면 크기 변경 이벤트 리스너 등록
    this.scale.on('resize', this.onResize, this);
  }

  private calculateLayout(): LayoutInfo {
    return this.layoutManager.calculateLayout(this.heroes, this.enemies);
  }

  private createCharacters(): void {
    this.heroes = this.characterFactory.createHeroes();
    this.enemies = this.characterFactory.createEnemies();
  }

  private createUI(): void {
    const layout = this.calculateLayout();
    this.uiManager.createCharacterUIs(this.heroes, this.enemies, layout);
    this.uiManager.createButtonUI(layout);
  }


  update(_time: number, delta: number): void {
    const deltaTime = delta / 1000;

    if (this.controller.isBattleOver()) {
      if (!this.eventManager.isBattleEnded()) {
        this.eventManager.setBattleEnded(true);
        this.uiManager.showGameOver(this.controller.isVictory());
      }
      return;
    }

    if (!this.eventManager.getCurrentActor() && !this.eventManager.isProcessingTurn()) {
      const nextActor = this.controller.update(deltaTime);
      if (nextActor && this.heroes.includes(nextActor)) {
        this.eventManager.startPlayerTurn(nextActor);
      }
    }

    if (!this.eventManager.isBattleEnded()) {
      this.uiManager.updateAllCharacterUIs();
    }
  }





  /**
   * 화면 크기 변경 시 호출되는 핸들러
   */
  private onResize(gameSize: Phaser.Structs.Size): void {
    console.log(`🔄 화면 크기 변경: ${gameSize.width}x${gameSize.height}`);

    // 레이아웃 매니저 업데이트
    this.layoutManager.updateScreenSize(gameSize.width, gameSize.height);

    // UI 재배치
    this.rearrangeUI();
  }

  /**
   * UI 요소들을 새로운 레이아웃에 맞춰 재배치
   */
  private rearrangeUI(): void {
    if (!this.uiManager) return;

    const layout = this.calculateLayout();
    this.uiManager.rearrangeLayout(layout);
    this.uiManager.onResize();
  }

  destroy(): void {
    // 이벤트 리스너 제거
    this.scale.off('resize', this.onResize, this);

    this.eventManager.destroy();
    this.uiManager.destroy();
    this.animationManager.destroy();
    this.inputHandler.destroy();
  }
}
