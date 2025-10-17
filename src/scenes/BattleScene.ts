import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';
import { BattleController } from '@/battle/BattleController';
// BattleLayoutManager는 삭제되었으므로 레이아웃 로직을 내부에서 처리
import { CharacterUI } from '@/ui/components/CharacterUI';
import { Button } from '@/ui/components/Button';
import { AnimationManager } from '@/animation/AnimationManager';
import { BattleInputHandler } from '@/input/BattleInputHandler';
import { eventBus } from '@/core/EventBus';

/**
 * 리팩토링된 전투 씬 (오케스트레이션만 담당)
 * 모든 세부 로직은 모듈화된 컴포넌트들에게 위임
 */
export class BattleScene extends Phaser.Scene {
  // 게임 데이터
  private heroes: Character[] = [];
  private enemies: Character[] = [];

  // 핵심 시스템들
  private controller!: BattleController;
  private animationManager!: AnimationManager;
  private inputHandler!: BattleInputHandler;

  // UI 컴포넌트들
  private characterUIs: CharacterUI[] = [];
  private attackButton!: Button;
  private skillButtons: Button[] = [];

  // 전투 상태
  private currentActor: Character | null = null;
  private processingTurn = false;
  private battleEnded = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  /**
   * Phaser create 메서드 - 씬 초기화
   */
  create(): void {
    console.log('🎮 리팩토링된 전투 씬 초기화...');

    // 배경 설정
    this.createBackground();

    // 시스템 초기화
    this.initializeSystems();

    // 캐릭터 생성
    this.createCharacters();

    // 전투 컨트롤러 초기화
    this.controller = new BattleController(this.heroes, this.enemies);

    // 이벤트 리스너 설정
    this.setupEventListeners();

    // UI 생성
    this.createUI();

    console.log('✅ 리팩토링된 전투 씬 초기화 완료!');
  }

  /**
   * 배경 생성 (순수 UI)
   */
  private createBackground(): void {
    // 그라데이션 배경
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    graphics.fillRect(0, 0, 1280, 720);

    // 제목 표시
    this.add.text(640, 50, '턴제 RPG 전투', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
  }

  /**
   * 시스템들 초기화
   */
  private initializeSystems(): void {
    // 애니메이션 매니저
    this.animationManager = new AnimationManager(this);

    // 입력 핸들러
    this.inputHandler = new BattleInputHandler();
  }

  /**
   * 레이아웃 계산 (간단한 레이아웃 로직)
   */
  private calculateLayout(): any {
    const heroPositions: { x: number; y: number }[] = [];
    const enemyPositions: { x: number; y: number }[] = [];

    // 아군 위치 계산 (왼쪽, 세로 배치)
    this.heroes.forEach((_, index) => {
      heroPositions.push({
        x: 200,
        y: 150 + index * 120,
      });
    });

    // 적 위치 계산 (오른쪽, 세로 배치)
    this.enemies.forEach((_, index) => {
      enemyPositions.push({
        x: 1080,
        y: 150 + index * 120,
      });
    });

    return {
      heroPositions,
      enemyPositions,
      buttonArea: {
        x: 100,
        y: 600,
        width: 1080,
        height: 80,
      },
    };
  }

  /**
   * 캐릭터 생성 (데이터만)
   */
  private createCharacters(): void {
    // 스킬 정의
    const heroSkills = [
      new Skill({
        id: 'strong-attack',
        name: '강타',
        description: '강력한 공격',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 50 }],
      }),
      new Skill({
        id: 'heal',
        name: '힐',
        description: '체력 회복',
        mpCost: 15,
        targetType: 'self',
        effects: [{ type: 'heal', value: 30 }],
      }),
    ];

    const enemySkills = [
      new Skill({
        id: 'slime-attack',
        name: '슬라임 독침',
        description: '독이 묻은 공격',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 35 }],
      }),
    ];

    // 다중 캐릭터 생성
    this.heroes = [
      new Character({
        name: '용사',
        hp: 120,
        mp: 60,
        attack: 35,
        defense: 12,
        speed: 18,
        skills: heroSkills,
      }),
      new Character({
        name: '마법사',
        hp: 80,
        mp: 100,
        attack: 25,
        defense: 8,
        speed: 15,
        skills: [
          new Skill({
            id: 'fireball',
            name: '파이어볼',
            description: '화염 구체 공격',
            mpCost: 20,
            targetType: 'single-enemy',
            effects: [{ type: 'damage', value: 45 }],
          }),
        ],
      }),
    ];

    this.enemies = [
      new Character({
        name: '슬라임',
        hp: 80,
        mp: 20,
        attack: 20,
        defense: 8,
        speed: 12,
        skills: enemySkills,
      }),
      new Character({
        name: '고블린',
        hp: 60,
        mp: 15,
        attack: 25,
        defense: 6,
        speed: 16,
        skills: [
          new Skill({
            id: 'goblin-attack',
            name: '고블린 슬래시',
            description: '빠른 베기 공격',
            mpCost: 8,
            targetType: 'single-enemy',
            effects: [{ type: 'damage', value: 30 }],
          }),
        ],
      }),
    ];

    // 입력 핸들러에 캐릭터 설정
    this.inputHandler.setCharacters(this.heroes, this.enemies);
  }

  /**
   * 이벤트 리스너 설정 (EventBus 기반)
   */
  private setupEventListeners(): void {
    // 전투 이벤트 처리
    this.controller.on((event) => {
      if (event.message) {
        console.log(`[전투] ${event.message}`);
      }

      // 턴 시작 이벤트
      if (event.type === 'turn-start' && event.actor && this.enemies.includes(event.actor)) {
        this.processingTurn = true;
      }

      // 데미지/회복 이벤트 → 애니메이션 매니저로 위임
      if (event.type === 'damage' && event.data?.damage && event.target) {
        // CharacterUI에서 직접 애니메이션 실행
        const characterUI = this.characterUIs.find(cui => cui.character === event.target);
        if (characterUI) {
          characterUI.shake();
          this.showDamageText(characterUI.position, event.data.damage, event.data.isCritical);
        }
      }

      if (event.type === 'heal' && event.data?.amount && event.target) {
        // CharacterUI에서 직접 애니메이션 실행
        const characterUI = this.characterUIs.find(cui => cui.character === event.target);
        if (characterUI) {
          this.showHealText(characterUI.position, event.data.amount);
        }
      }

      // 턴 종료 이벤트
      if (event.type === 'turn-end') {
        this.disableAllButtons();
        this.currentActor = null;
        this.updateTurnIndicators(null);

        // 턴 처리 완료 딜레이
        this.time.delayedCall(300, () => {
          this.processingTurn = false;
        });
      }
    });

    // BattleInputHandler 이벤트 처리
    this.setupInputHandlerEvents();
  }

  /**
   * BattleInputHandler 이벤트 설정
   */
  private setupInputHandlerEvents(): void {
    // 공격 이벤트 처리
    eventBus.on('battle:attack', (data: any) => {
      console.log('공격 이벤트 수신:', data);
      if (this.currentActor && data.target) {
        this.controller.executeAttack(this.currentActor, data.target);
        // processingTurn은 turn-end 이벤트에서 300ms 딜레이 후 false로 설정됨
      }
    });

    // 스킬 이벤트 처리
    eventBus.on('battle:skill', (data: any) => {
      console.log('스킬 이벤트 수신:', data);
      if (this.currentActor && data.skill && data.targets) {
        this.controller.executeSkill(data.skill, this.currentActor, data.targets);
        // processingTurn은 turn-end 이벤트에서 300ms 딜레이 후 false로 설정됨
      }
    });

    // 턴 시작 이벤트 전달
    eventBus.on('battle:turn-start', (data: any) => {
      if (data.actor) {
        this.currentActor = data.actor;
      }
    });
  }

  /**
   * UI 생성 (모듈화된 컴포넌트 사용)
   */
  private createUI(): void {
    const layout = this.calculateLayout();

    // 캐릭터 UI 생성
    this.createCharacterUIs(layout);

    // 버튼 UI 생성
    this.createButtonUI(layout);
  }

  /**
   * 캐릭터 UI 생성
   */
  private createCharacterUIs(layout: any): void {
    // 아군 캐릭터 UI
    this.heroes.forEach((hero, index) => {
      const position = layout.heroPositions[index];
      const characterUI = new CharacterUI(this, {
        x: position.x,
        y: position.y,
        character: hero,
        isHero: true,
      });
      this.characterUIs.push(characterUI);
    });

    // 적 캐릭터 UI
    this.enemies.forEach((enemy, index) => {
      const position = layout.enemyPositions[index];
      const characterUI = new CharacterUI(this, {
        x: position.x,
        y: position.y,
        character: enemy,
        isHero: false,
      });
      this.characterUIs.push(characterUI);
    });
  }

  /**
   * 버튼 UI 생성
   */
  private createButtonUI(layout: any): void {
    // 공격 버튼
    this.attackButton = new Button(this, {
      x: layout.buttonArea.x,
      y: layout.buttonArea.y,
      text: '공격',
      buttonId: 'attack',
    });
    this.attackButton.disable();
  }

  /**
   * Phaser update 메서드 - 매 프레임 호출
   */
  update(_time: number, delta: number): void {
    const deltaTime = delta / 1000;

    // 전투 종료 확인
    if (this.controller.isBattleOver()) {
      if (!this.battleEnded) {
        this.battleEnded = true;
        this.showGameOver();
      }
      return;
    }

    // 현재 턴이 진행 중이 아니고, 턴 처리 중이 아닐 때만 다음 턴 확인
    if (!this.currentActor && !this.processingTurn) {
      const nextActor = this.controller.update(deltaTime);

      if (nextActor && this.heroes.includes(nextActor)) {
        // 플레이어 턴 시작
        this.startPlayerTurn(nextActor);
      }
    }

    // UI 업데이트 (전투가 진행 중일 때만)
    if (!this.battleEnded) {
      this.updateAllCharacterUIs();
    }
  }

  /**
   * 플레이어 턴 시작
   */
  private startPlayerTurn(actor: Character): void {
    this.currentActor = actor;
    this.processingTurn = true;

    // 입력 핸들러에 현재 액터 설정
    this.inputHandler.setCurrentActor(actor);

    // UI 활성화
    this.enableButtons(actor);
    this.updateTurnIndicators(actor);
  }

  /**
   * 버튼들 활성화
   */
  private enableButtons(actor: Character): void {
    this.attackButton.enable();

    // 기존 스킬 버튼들 제거
    this.skillButtons.forEach(btn => btn.destroy());
    this.skillButtons = [];

    // 스킬 버튼들 생성
    actor.skills.forEach((skill, index) => {
      const button = new Button(this, {
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
   * 모든 버튼 비활성화
   */
  private disableAllButtons(): void {
    this.attackButton.disable();
    this.skillButtons.forEach(btn => btn.destroy());
    this.skillButtons = [];
  }

  /**
   * 모든 캐릭터 UI 업데이트
   */
  private updateAllCharacterUIs(): void {
    this.characterUIs.forEach(characterUI => {
      characterUI.updateUI();
    });
  }

  /**
   * 턴 표시기 업데이트
   */
  private updateTurnIndicators(activeCharacter: Character | null): void {
    this.characterUIs.forEach(characterUI => {
      const isActive = activeCharacter === characterUI.character;
      characterUI.setTurnIndicator(isActive);
    });
  }

  /**
   * 데미지 텍스트 표시
   */
  private showDamageText(position: { x: number; y: number }, damage: number, isCritical: boolean): void {
    const damageText = this.add.text(position.x, position.y - 30, `-${damage}`, {
      fontSize: '24px',
      color: isCritical ? '#ff0000' : '#ffff00',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // 데미지 텍스트 애니메이션
    this.tweens.add({
      targets: damageText,
      y: position.y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy(),
    });
  }

  /**
   * 회복 텍스트 표시
   */
  private showHealText(position: { x: number; y: number }, amount: number): void {
    const healText = this.add.text(position.x, position.y - 30, `+${amount}`, {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // 회복 텍스트 애니메이션
    this.tweens.add({
      targets: healText,
      y: position.y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => healText.destroy(),
    });
  }

  /**
   * 게임 오버 화면 표시
   */
  private showGameOver(): void {
    const isVictory = this.controller.isVictory();
    const message = isVictory ? '승리!' : '패배!';
    const color = isVictory ? '#00ff00' : '#ff0000';

    this.add.text(640, 360, message, {
      fontSize: '48px',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // 자동으로 타이틀로 돌아가기 (3초 후)
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  /**
   * 씬 파괴 시 정리
   */
  destroy(): void {
    // 모든 UI 컴포넌트 정리
    this.characterUIs.forEach(characterUI => characterUI.destroy());
    this.attackButton.destroy();
    this.skillButtons.forEach(btn => btn.destroy());

    // 시스템들 정리
    this.animationManager.destroy();
    this.inputHandler.destroy();

    // Phaser Scene의 destroy는 호출하지 않음 (Phaser가 자동 처리)
  }
}
