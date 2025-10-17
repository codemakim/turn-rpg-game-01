import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { StatusBar } from './StatusBar';
import { TurnIndicator } from './TurnIndicator';

/**
 * 캐릭터 UI 조합 컴포넌트 (UI 조합만 담당)
 * CharacterComponent를 대체하는 새로운 구조
 */
export interface CharacterUIConfig {
  x: number;
  y: number;
  character: Character;
  isHero: boolean;
}

export class CharacterUI {
  private container: Phaser.GameObjects.Container;
  private graphics: Phaser.GameObjects.Graphics;
  private statusText: Phaser.GameObjects.Text;
  private hpBar: StatusBar;
  private mpBar: StatusBar;
  private turnIndicator: TurnIndicator;

  public readonly character: Character;
  public readonly isHero: boolean;
  public readonly position: { x: number; y: number };

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: CharacterUIConfig) {
    this.scene = scene;
    this.character = config.character;
    this.isHero = config.isHero;
    this.position = { x: config.x, y: config.y };

    // 메인 컨테이너 생성
    this.container = this.scene.add.container(config.x, config.y);

    // 캐릭터 그래픽 생성
    this.graphics = this.scene.add.graphics();
    this.createCharacterGraphics();
    this.container.add(this.graphics);

    // 상태 텍스트 생성
    this.statusText = this.scene.add.text(0, -80, '', {
      fontSize: '12px',
      color: this.isHero ? '#4ecdc4' : '#ff6b6b',
      fontStyle: 'bold',
      align: 'center',
    });
    this.container.add(this.statusText);

    // HP/MP 바 생성
    this.hpBar = new StatusBar(this.scene, {
      x: -80,
      y: 40,
      width: 160,
      height: 15,
      maxValue: this.character.maxHp,
      currentValue: this.character.hp,
      color: 0xe94560,
      label: 'HP',
    });
    this.container.add(this.hpBar.graphics);

    this.mpBar = new StatusBar(this.scene, {
      x: -80,
      y: 60,
      width: 160,
      height: 12,
      maxValue: this.character.maxMp,
      currentValue: this.character.mp,
      color: 0x4ecdc4,
      label: 'MP',
    });
    this.container.add(this.mpBar.graphics);

    // 턴 표시기 생성
    this.turnIndicator = new TurnIndicator(this.scene, {
      x: 0,
      y: -60,
      size: 10,
    });
    this.container.add(this.turnIndicator.graphics);

    // 초기 UI 업데이트
    this.updateUI();
  }

  /**
   * 캐릭터 그래픽 생성 (크기 최적화)
   */
  private createCharacterGraphics(): void {
    const body = this.graphics;

    if (this.character.name === '용사') {
      // 용사 디자인 (파란 원 + 검)
      body.fillStyle(0x4ecdc4, 1);
      body.fillCircle(0, 0, 25);
      body.fillStyle(0xffd700, 1);
      body.fillRect(18, -3, 15, 6);
      body.fillStyle(0x000000, 1);
      body.fillCircle(-8, -5, 2);
      body.fillCircle(8, -5, 2);
      body.lineStyle(2, 0xffffff, 1);
      body.strokeCircle(0, 0, 25);
    } else if (this.character.name === '마법사') {
      // 마법사 디자인 (보라 원 + 지팡이)
      body.fillStyle(0x9c27b0, 1);
      body.fillCircle(0, 0, 25);
      body.fillStyle(0xffeb3b, 1);
      body.fillRect(18, -2, 3, 4);
      body.fillCircle(19, 0, 5);
      body.fillStyle(0x000000, 1);
      body.fillCircle(-8, -5, 2);
      body.fillCircle(8, -5, 2);
      body.lineStyle(2, 0xffffff, 1);
      body.strokeCircle(0, 0, 25);
    } else if (this.character.name === '슬라임') {
      // 슬라임 디자인 (초록 타원)
      body.fillStyle(0x46b946, 0.9);
      body.fillEllipse(0, 3, 45, 35);
      body.fillStyle(0x7dff7d, 0.4);
      body.fillEllipse(-6, -3, 18, 12);
      body.fillStyle(0x000000, 1);
      body.fillCircle(-9, 0, 4);
      body.fillCircle(9, 0, 4);
      body.fillStyle(0xffffff, 1);
      body.fillCircle(-8, -1, 2);
      body.fillCircle(10, -1, 2);
    } else if (this.character.name === '고블린') {
      // 고블린 디자인 (주황 원 + 칼)
      body.fillStyle(0xff9800, 1);
      body.fillCircle(0, 0, 22);
      body.fillStyle(0x666666, 1);
      body.fillRect(16, -2, 12, 4);
      body.fillStyle(0x000000, 1);
      body.fillCircle(-6, -4, 2);
      body.fillCircle(6, -4, 2);
      body.fillStyle(0xff0000, 1);
      body.fillCircle(-6, -4, 1);
      body.fillCircle(6, -4, 1);
      body.lineStyle(1, 0xffffff, 1);
      body.strokeCircle(0, 0, 22);
    }
  }

  /**
   * UI 업데이트 (HP/MP, 상태 텍스트, 생존 상태)
   */
  public updateUI(): void {
    // 상태 텍스트 업데이트 (안전성 검사 추가)
    if (this.statusText && this.statusText.active) {
      this.statusText.setText(`${this.character.name}\nHP: ${this.character.hp}/${this.character.maxHp}\nMP: ${this.character.mp}/${this.character.maxMp}`);
    }

    // HP/MP 바 업데이트 (안전성 검사 추가)
    if (this.hpBar && this.hpBar.graphics && this.hpBar.graphics.active) {
      this.hpBar.updateValues(this.character.hp, this.character.maxHp);
    }

    if (this.mpBar && this.mpBar.graphics && this.mpBar.graphics.active) {
      this.mpBar.updateValues(this.character.mp, this.character.maxMp);
    }

    // 생존 상태 반영 (죽으면 반투명)
    if (this.container && this.container.active) {
      this.container.alpha = this.character.isAlive() ? 1 : 0.3;
    }
  }

  /**
   * 턴 표시기 표시/숨김
   * @param show 표시 여부
   */
  public setTurnIndicator(show: boolean): void {
    if (show) {
      this.turnIndicator.show();
    } else {
      this.turnIndicator.hide();
    }
  }

  /**
   * 캐릭터 흔들림 애니메이션
   */
  public shake(): void {
    const originalX = this.container.x;

    this.scene.tweens.add({
      targets: this.container,
      x: originalX + 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.container.x = originalX;
      },
    });
  }

  /**
   * 위치 업데이트
   * @param position 새로운 위치
   */
  public setPosition(position: { x: number; y: number }): void {
    this.container.setPosition(position.x, position.y);
    this.hpBar.setPosition(position.x - 80, position.y + 40);
    this.mpBar.setPosition(position.x - 80, position.y + 60);
    this.turnIndicator.setPosition(position.x, position.y - 60);
  }

  /**
   * 컴포넌트 파괴
   */
  public destroy(): void {
    this.container.destroy();
    this.hpBar.destroy();
    this.mpBar.destroy();
    this.turnIndicator.destroy();
  }
}
