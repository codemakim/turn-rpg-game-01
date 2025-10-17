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
    this.eventManager = new BattleEventManager(
      this,
      this.controller,
      this.inputHandler,
      this.uiManager,
      this.animationManager,
      this.enemies
    );
    this.createUI();
  }


  private initializeSystems(): void {
    this.animationManager = new AnimationManager(this);
    this.inputHandler = new BattleInputHandler();
    this.characterFactory = new BattleCharacterFactory();
    this.layoutManager = new BattleLayoutManager();
    this.uiManager = new BattleUIManager(this);
  }

  private calculateLayout(): LayoutInfo {
    return this.layoutManager.calculateLayout(this.heroes, this.enemies);
  }

  private createCharacters(): void {
    this.heroes = this.characterFactory.createHeroes();
    this.enemies = this.characterFactory.createEnemies();
    this.inputHandler.setCharacters(this.heroes, this.enemies);
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





  destroy(): void {
    this.eventManager.destroy();
    this.uiManager.destroy();
    this.animationManager.destroy();
    this.inputHandler.destroy();
  }
}
