import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { CharacterUI } from '@/ui/components/CharacterUI';
import { type LayoutInfo } from '@/scenes/managers/BattleLayoutManager';

/**
 * 캐릭터 UI 관리자
 * 캐릭터 UI 생성 및 관리만 담당 (단일 책임)
 */
export class CharacterUIManager {
  private scene: Phaser.Scene;
  private characterUIs: CharacterUI[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 캐릭터 UI들을 생성합니다
   * @param heroes 아군 캐릭터 배열
   * @param enemies 적 캐릭터 배열
   * @param layout 레이아웃 정보
   */
  public createCharacterUIs(heroes: Character[], enemies: Character[], layout: LayoutInfo): void {
    // 기존 캐릭터 UI들 정리
    this.clearCharacterUIs();

    // 아군 캐릭터 UI 생성
    heroes.forEach((hero, index) => {
      const position = layout.heroPositions[index];
      console.log(`아군 ${index} (${hero.name}) 위치:`, position);
      if (position) {
        const characterUI = new CharacterUI(this.scene, {
          x: position.x,
          y: position.y,
          character: hero,
          isHero: true,
        });
        this.characterUIs.push(characterUI);
        console.log(`아군 ${hero.name} 최종 포지션:`, hero.position);
      }
    });

    // 적군 캐릭터 UI 생성
    enemies.forEach((enemy, index) => {
      const position = layout.enemyPositions[index];
      if (position) {
        const characterUI = new CharacterUI(this.scene, {
          x: position.x,
          y: position.y,
          character: enemy,
          isHero: false,
        });
        this.characterUIs.push(characterUI);
      }
    });
  }

  /**
   * 캐릭터 UI들을 재배치합니다
   * @param layout 새로운 레이아웃 정보
   */
  public rearrangeLayout(layout: LayoutInfo): void {
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
  }

  /**
   * 캐릭터 UI들을 반환합니다
   */
  public getCharacterUIs(): CharacterUI[] {
    return this.characterUIs;
  }

  /**
   * 기존 캐릭터 UI들을 정리합니다
   */
  private clearCharacterUIs(): void {
    this.characterUIs.forEach(characterUI => characterUI.destroy());
    this.characterUIs = [];
  }

  /**
   * 캐릭터 UI 관리자 파괴
   */
  public destroy(): void {
    this.clearCharacterUIs();
  }
}
