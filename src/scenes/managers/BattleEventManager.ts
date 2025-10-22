import { Character } from '@/characters/Character';
import { BattleController } from '@/battle/BattleController';
import { BattleInputHandler } from '@/input/BattleInputHandler';
import { BattleUIManager } from './BattleUIManager';
import { AnimationManager } from '@/animation/AnimationManager';
import { eventBus } from '@/core/EventBus';
import { Skill } from '@/battle/Skill';
import type { GameEvents } from '@/types';

/**
 * 전투 이벤트 관리자
 * 이벤트 처리 및 상태 관리를 담당
 */
export class BattleEventManager {
  private scene: Phaser.Scene;
  private controller: BattleController;
  private inputHandler: BattleInputHandler;
  private uiManager: BattleUIManager;
  private animationManager: AnimationManager;
  private enemies: Character[];
  private heroes: Character[];

  // 전투 상태 관리
  private currentActor: Character | null = null;
  private processingTurn = false;
  private battleEnded = false;

  constructor(
    scene: Phaser.Scene,
    controller: BattleController,
    inputHandler: BattleInputHandler,
    uiManager: BattleUIManager,
    animationManager: AnimationManager,
    heroes: Character[],
    enemies: Character[]
  ) {
    this.scene = scene;
    this.controller = controller;
    this.inputHandler = inputHandler;
    this.uiManager = uiManager;
    this.animationManager = animationManager;
    this.heroes = heroes;
    this.enemies = enemies;

    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너들을 설정합니다
   */
  private setupEventListeners(): void {
    this.setupBattleControllerEvents();
    this.setupInputHandlerEvents();
  }

  /**
   * BattleController 이벤트를 설정합니다
   */
  private setupBattleControllerEvents(): void {
    this.controller.on((event) => {
      if (event.message) {
        console.log(`[전투] ${event.message}`);
      }

      // 턴 시작 이벤트
      if (event.type === 'turn-start' && event.actor && this.enemies.includes(event.actor)) {
        this.processingTurn = true;
      }

      // 데미지/회복 이벤트 → 애니메이션 처리
      if (event.type === 'damage' && event.data?.damage && event.target) {
        this.handleDamageEvent(event.target, event.data.damage, event.data.isCritical);
      }

      if (event.type === 'heal' && event.data?.amount && event.target) {
        this.handleHealEvent(event.target, event.data.amount);
      }

      // 턴 종료 이벤트
      if (event.type === 'turn-end') {
        this.handleTurnEndEvent();
      }
    });
  }

  /**
   * BattleInputHandler 이벤트를 설정합니다
   */
  private setupInputHandlerEvents(): void {
    // 공격 이벤트 처리 (수동 타겟팅용)
    eventBus.on('battle:attack', (data: GameEvents['battle:attack']) => {
      if (this.currentActor && data.target) {
        this.controller.executeAttack(this.currentActor, data.target);
      }
    });

    // 스킬 이벤트 처리 (수동 타겟팅용)
    eventBus.on('battle:skill', (data: GameEvents['battle:skill']) => {
      if (this.currentActor && data.skill && data.targets) {
        this.controller.executeSkill(data.skill, this.currentActor, data.targets);
      }
    });

    // 턴 시작 이벤트 전달
    eventBus.on('battle:turn-start', (data: GameEvents['battle:turn-start']) => {
      if (data.actor) {
        this.currentActor = data.actor;
      }
    });

    // 타겟팅 시작 이벤트 처리
    eventBus.on('battle:start-targeting', (data: GameEvents['battle:start-targeting']) => {
      if (this.currentActor && data.skill) {
        this.startTargetingMode(data.skill);
      }
    });

    // 타겟팅 완료 이벤트 처리
    eventBus.on('battle:targeting-complete', (data: GameEvents['battle:targeting-complete']) => {
      if (this.currentActor && data.skill && data.targets) {
        this.controller.executeSkill(data.skill, this.currentActor, data.targets);
      }
    });

    // 타겟팅 취소 이벤트 처리
    eventBus.on('battle:targeting-cancel', () => {
      this.uiManager.cancelTargeting();
    });
  }

  /**
   * 데미지 이벤트를 처리합니다
   * @param target 대상 캐릭터
   * @param damage 데미지량
   * @param isCritical 크리티컬 여부
   */
  private handleDamageEvent(target: Character, damage: number, isCritical: boolean): void {
    const characterUIs = this.uiManager.getCharacterUIs();
    const characterUI = characterUIs.find(cui => cui.character === target);
    if (characterUI) {
      characterUI.shake();
      this.showDamageText(characterUI.position, damage, isCritical);
    }
  }

  /**
   * 회복 이벤트를 처리합니다
   * @param target 대상 캐릭터
   * @param amount 회복량
   */
  private handleHealEvent(target: Character, amount: number): void {
    const characterUIs = this.uiManager.getCharacterUIs();
    const characterUI = characterUIs.find(cui => cui.character === target);
    if (characterUI) {
      this.showHealText(characterUI.position, amount);
    }
  }

  /**
   * 턴 종료 이벤트를 처리합니다
   */
  private handleTurnEndEvent(): void {
    this.uiManager.disableAllButtons();
    this.currentActor = null;
    this.uiManager.updateTurnIndicators(null);

    // 턴 처리 완료 딜레이
    this.scene.time.delayedCall(300, () => {
      this.processingTurn = false;
    });
  }

  /**
   * 데미지 텍스트를 표시합니다
   * @param position 위치 정보
   * @param damage 데미지량
   * @param isCritical 크리티컬 여부
   */
  private showDamageText(position: { x: number; y: number }, damage: number, isCritical: boolean): void {
    this.animationManager.showDamageAnimation(position, damage, isCritical);
  }

  /**
   * 회복 텍스트를 표시합니다
   * @param position 위치 정보
   * @param amount 회복량
   */
  private showHealText(position: { x: number; y: number }, amount: number): void {
    this.animationManager.showHealAnimation(position, amount);
  }

  /**
   * 플레이어 턴을 시작합니다
   * @param actor 행동할 캐릭터
   */
  public startPlayerTurn(actor: Character): void {
    this.currentActor = actor;
    this.processingTurn = true;

    // 입력 핸들러에 현재 액터 설정
    this.inputHandler.setCurrentActor(actor);

    // UI 활성화
    this.uiManager.enableButtons(actor);
    this.uiManager.updateTurnIndicators(actor);
  }

  /**
   * 현재 액터를 반환합니다
   * @returns 현재 액터
   */
  public getCurrentActor(): Character | null {
    return this.currentActor;
  }

  /**
   * 턴 처리 중인지 확인합니다
   * @returns 턴 처리 중 여부
   */
  public isProcessingTurn(): boolean {
    return this.processingTurn;
  }

  /**
   * 전투 종료 상태를 설정합니다
   * @param ended 전투 종료 여부
   */
  public setBattleEnded(ended: boolean): void {
    this.battleEnded = ended;
  }

  /**
   * 전투 종료 상태를 확인합니다
   * @returns 전투 종료 여부
   */
  public isBattleEnded(): boolean {
    return this.battleEnded;
  }

  /**
   * 타겟팅 모드를 시작합니다
   * @param skill 사용할 스킬
   */
  private startTargetingMode(skill: Skill): void {
    if (!this.currentActor) return;

    // 타겟팅 모드 시작
    this.uiManager.startTargetingMode(skill, this.heroes, this.enemies, this.currentActor);

    // 타겟팅 UI 업데이트
    this.uiManager.updateTargetingUI();
  }

  /**
   * 이벤트 관리자 파괴
   */
  public destroy(): void {
    // 이벤트 리스너는 EventBus에서 자동으로 정리됨
    this.currentActor = null;
    this.processingTurn = false;
    this.battleEnded = false;
  }
}
