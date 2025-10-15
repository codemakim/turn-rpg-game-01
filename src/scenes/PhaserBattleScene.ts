import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';
import { BattleController } from '@/battle/BattleController';

/**
 * Phaser 기반 전투 씬
 * BattleController(로직)는 재사용하고 UI만 Phaser로 전환
 */
export class PhaserBattleScene extends Phaser.Scene {
  private controller!: BattleController;
  private hero!: Character;
  private enemy!: Character;

  // UI 요소들
  private heroHPBar!: Phaser.GameObjects.Graphics;
  private heroMPBar!: Phaser.GameObjects.Graphics;
  private enemyHPBar!: Phaser.GameObjects.Graphics;
  private enemyMPBar!: Phaser.GameObjects.Graphics;
  private heroText!: Phaser.GameObjects.Text;
  private enemyText!: Phaser.GameObjects.Text;
  private battleLogText!: Phaser.GameObjects.Text;

  private attackButton!: Phaser.GameObjects.Text;
  private skillButtons: Phaser.GameObjects.Text[] = [];

  private battleLog: string[] = [];
  private currentActor: Character | null = null;

  // 캐릭터 위치 (애니메이션용)
  private readonly HERO_X = 150;
  private readonly HERO_Y = 150;
  private readonly ENEMY_X = 630;
  private readonly ENEMY_Y = 150;

  constructor() {
    super({ key: 'BattleScene' });
  }

  /**
   * Phaser create 메서드 - 씬 초기화
   */
  create(): void {
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x16213e);

    // 제목
    this.add.text(400, 30, '턴제 RPG 전투', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 스킬 생성
    const heroSkills = [
      new Skill({
        id: 'power-attack',
        name: '강타',
        description: '강력한 일격',
        mpCost: 10,
        targetType: 'single-enemy',
        effects: [{ type: 'damage', value: 50 }],
      }),
      new Skill({
        id: 'heal',
        name: '힐',
        description: 'HP 회복',
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

    // 캐릭터 생성
    this.hero = new Character({
      name: '용사',
      hp: 120,
      mp: 60,
      attack: 35,
      defense: 12,
      speed: 18,
      skills: heroSkills,
    });

    this.enemy = new Character({
      name: '슬라임',
      hp: 80,
      mp: 20,
      attack: 20,
      defense: 8,
      speed: 12,
      skills: enemySkills,
    });

    // 컨트롤러 생성 (로직 재사용!)
    this.controller = new BattleController(this.hero, this.enemy);

    // 이벤트 리스너 (로그 추가 + 애니메이션)
    this.controller.on((event) => {
      if (event.message) {
        this.addLog(event.message);
      }

      // 데미지 애니메이션
      if (event.type === 'damage' && event.data?.damage) {
        const isHeroTarget = event.target === this.hero;
        const x = isHeroTarget ? this.HERO_X : this.ENEMY_X;
        const y = isHeroTarget ? this.HERO_Y : this.ENEMY_Y;

        this.showDamageAnimation(x, y, event.data.damage, event.data.isCritical);

        // 흔들림 효과
        this.shakeCharacter(isHeroTarget ? this.heroText : this.enemyText);
      }

      // 회복 애니메이션
      if (event.type === 'heal' && event.data?.amount) {
        const isHeroTarget = event.target === this.hero;
        const x = isHeroTarget ? this.HERO_X : this.ENEMY_X;
        const y = isHeroTarget ? this.HERO_Y : this.ENEMY_Y;

        this.showHealAnimation(x, y, event.data.amount);
      }

      if (event.type === 'turn-end') {
        this.disableButtons();
        this.currentActor = null;
      }
    });

    // UI 생성
    this.createUI();

    this.addLog('전투 시작!');
  }

  /**
   * UI 요소들을 생성합니다
   */
  private createUI(): void {
    // 용사 정보
    this.heroText = this.add.text(50, 50, '', {
      fontSize: '20px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    });

    // 슬라임 정보
    this.enemyText = this.add.text(530, 50, '', {
      fontSize: '20px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    });

    // HP/MP 바 (Graphics 객체)
    this.heroHPBar = this.add.graphics();
    this.heroMPBar = this.add.graphics();
    this.enemyHPBar = this.add.graphics();
    this.enemyMPBar = this.add.graphics();

    // 전투 로그
    this.battleLogText = this.add.text(50, 200, '', {
      fontSize: '16px',
      color: '#ffffff',
      lineSpacing: 5,
    });

    // 공격 버튼
    this.attackButton = this.add.text(125, 475, '공격', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#2196F3',
      padding: { x: 50, y: 15 },
      fontStyle: 'bold',
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.handleAttack())
      .on('pointerover', () => this.onButtonHover(this.attackButton))
      .on('pointerout', () => this.onButtonOut(this.attackButton))
      .setAlpha(0.5); // 비활성화 상태

    // 스킬 버튼들
    this.hero.skills.forEach((skill, index) => {
      const btn = this.add.text(
        295 + index * 170,
        475,
        `${skill.name} (${skill.mpCost})`,
        {
          fontSize: '18px',
          color: '#ffffff',
          backgroundColor: '#2196F3',
          padding: { x: 30, y: 15 },
          fontStyle: 'bold',
        }
      )
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.handleSkill(skill))
        .on('pointerover', () => this.onButtonHover(btn))
        .on('pointerout', () => this.onButtonOut(btn))
        .setAlpha(0.5);

      this.skillButtons.push(btn);
    });
  }

  /**
   * Phaser update 메서드 - 매 프레임 호출
   * @param time 게임 시작 후 경과 시간
   * @param delta 이전 프레임과의 시간 차이 (밀리초)
   */
  update(time: number, delta: number): void {
    const deltaTime = delta / 1000; // 초 단위로 변환

    // 전투 종료 시
    if (this.controller.isBattleOver()) {
      this.showGameOver();
      return;
    }

    // 현재 턴이 진행 중이 아닐 때만 다음 턴 확인
    if (!this.currentActor) {
      const nextActor = this.controller.update(deltaTime);

      if (nextActor === this.hero) {
        this.currentActor = nextActor;
        this.enableButtons();
      }
    }

    // UI 업데이트
    this.updateUI();
  }

  /**
   * UI를 업데이트합니다 (캐릭터 정보, HP/MP 바)
   */
  private updateUI(): void {
    // 용사 텍스트
    this.heroText.setText(`${this.hero.name}\n공격: ${this.hero.attack} | 방어: ${this.hero.defense} | 속도: ${this.hero.speed}`);

    // 슬라임 텍스트
    this.enemyText.setText(`${this.enemy.name}\n공격: ${this.enemy.attack} | 방어: ${this.enemy.defense} | 속도: ${this.enemy.speed}`);

    // HP/MP 바 그리기
    this.drawStatusBar(this.heroHPBar, 50, 100, 200, 20, this.hero.hp, this.hero.maxHp, 0xe94560, 'HP');
    this.drawStatusBar(this.heroMPBar, 50, 130, 200, 16, this.hero.mp, this.hero.maxMp, 0x3d84a8, 'MP');
    this.drawStatusBar(this.enemyHPBar, 530, 100, 200, 20, this.enemy.hp, this.enemy.maxHp, 0xe94560, 'HP');
    this.drawStatusBar(this.enemyMPBar, 530, 130, 200, 16, this.enemy.mp, this.enemy.maxMp, 0x3d84a8, 'MP');

    // 전투 로그
    const recentLogs = this.battleLog.slice(-8);
    this.battleLogText.setText(recentLogs.join('\n'));
  }

  /**
   * HP/MP 바를 그립니다
   */
  private drawStatusBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    current: number,
    max: number,
    color: number,
    label: string
  ): void {
    graphics.clear();

    const percentage = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const fillWidth = width * percentage;

    // 배경
    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, width, height);

    // 현재값
    graphics.fillStyle(color);
    graphics.fillRect(x, y, fillWidth, height);

    // 테두리
    graphics.lineStyle(2, 0x666666);
    graphics.strokeRect(x, y, width, height);

    // 라벨 (Text 객체 사용)
    const labelText = `${label}: ${Math.floor(current)}/${max}`;
    if (!graphics.getData('labelText')) {
      const text = this.add.text(x + 5, y + height / 2, labelText, {
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0, 0.5);
      graphics.setData('labelText', text);
    } else {
      graphics.getData('labelText').setText(labelText);
    }
  }

  /**
   * 버튼들을 활성화합니다
   */
  private enableButtons(): void {
    this.attackButton.setAlpha(1).setInteractive();

    this.hero.skills.forEach((skill, index) => {
      const btn = this.skillButtons[index];
      if (skill.canUse(this.hero)) {
        btn.setAlpha(1).setInteractive();
      } else {
        btn.setAlpha(0.5).disableInteractive();
      }
    });
  }

  /**
   * 버튼들을 비활성화합니다
   */
  private disableButtons(): void {
    this.attackButton.setAlpha(0.5).disableInteractive();
    this.skillButtons.forEach(btn => btn.setAlpha(0.5).disableInteractive());
  }

  /**
   * 공격 버튼 클릭 핸들러
   */
  private handleAttack(): void {
    this.controller.executeAttack();
    this.currentActor = null;
  }

  /**
   * 스킬 버튼 클릭 핸들러
   */
  private handleSkill(skill: Skill): void {
    this.controller.executeSkill(skill);
    this.currentActor = null;
  }

  /**
   * 전투 로그에 메시지 추가
   */
  private addLog(message: string): void {
    this.battleLog.push(message);
  }

  /**
   * 데미지 숫자 애니메이션을 표시합니다
   * @param x X 좌표
   * @param y Y 좌표
   * @param damage 데미지량
   * @param isCritical 크리티컬 여부
   */
  private showDamageAnimation(x: number, y: number, damage: number, isCritical?: boolean): void {
    const color = isCritical ? '#ff4444' : '#ffffff';
    const fontSize = isCritical ? '32px' : '24px';

    const damageText = this.add.text(x, y, `-${damage}`, {
      fontSize,
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 튀어오르며 사라지는 애니메이션
    this.tweens.add({
      targets: damageText,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy(),
    });
  }

  /**
   * 회복 숫자 애니메이션을 표시합니다
   * @param x X 좌표
   * @param y Y 좌표
   * @param amount 회복량
   */
  private showHealAnimation(x: number, y: number, amount: number): void {
    const healText = this.add.text(x, y, `+${amount}`, {
      fontSize: '24px',
      color: '#44ff44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 튀어오르며 사라지는 애니메이션
    this.tweens.add({
      targets: healText,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => healText.destroy(),
    });
  }

  /**
   * 캐릭터 흔들림 애니메이션
   * @param target 흔들릴 대상
   */
  private shakeCharacter(target: Phaser.GameObjects.Text): void {
    const originalX = target.x;

    this.tweens.add({
      targets: target,
      x: originalX + 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        target.x = originalX; // 원래 위치로 복귀
      },
    });
  }

  /**
   * 버튼 호버 시 애니메이션
   * @param button 버튼 객체
   */
  private onButtonHover(button: Phaser.GameObjects.Text): void {
    if (button.alpha === 1) { // 활성화된 버튼만
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Power1',
      });
    }
  }

  /**
   * 버튼에서 마우스가 나갈 때 애니메이션
   * @param button 버튼 객체
   */
  private onButtonOut(button: Phaser.GameObjects.Text): void {
    this.tweens.add({
      targets: button,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power1',
    });
  }

  /**
   * 게임 오버 화면 표시
   */
  private showGameOver(): void {
    if (this.controller.isVictory()) {
      this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
      this.add.text(400, 300, '승리!', {
        fontSize: '64px',
        color: '#44ff44',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    } else {
      this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
      this.add.text(400, 300, '패배...', {
        fontSize: '64px',
        color: '#ff4444',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
  }
}

