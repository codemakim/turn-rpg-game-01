import Phaser from 'phaser';
import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';
import { TargetingSystem } from '@/battle/TargetingSystem';
import { TargetingUI } from '@/ui/components/TargetingUI';
import { eventBus } from '@/core/EventBus';

/**
 * 타겟팅 결과
 */
export interface TargetingResult {
  success: boolean;
  message: string;
  targets?: Character[];
}

/**
 * 타겟팅 매니저
 * 타겟팅 시스템과 UI를 통합하여 관리합니다.
 */
export class TargetingManager {
  private scene: Phaser.Scene;
  private targetingSystem: TargetingSystem;
  private targetingUI: TargetingUI;
  private targetingMode: boolean = false;
  private inputListeners: Array<{ event: string; callback: Function }> = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.targetingSystem = new TargetingSystem();
    this.targetingUI = new TargetingUI(scene);
  }

  /**
   * 타겟팅 모드를 시작합니다.
   * @param skill 사용할 스킬
   * @param heroes 아군 캐릭터들
   * @param enemies 적군 캐릭터들
   * @param caster 스킬 사용자
   * @returns 타겟팅 시작 결과
   */
  public startTargetingMode(skill: Skill, heroes: Character[], enemies: Character[], caster: Character): TargetingResult {
    try {
      this.targetingSystem.startTargeting(skill, heroes, enemies, caster);
      this.targetingMode = true;
      this.setupInputListeners();

      return {
        success: true,
        message: '타겟팅 모드가 시작되었습니다.'
      };
    } catch (error) {
      return {
        success: false,
        message: '타겟팅 모드 시작에 실패했습니다.'
      };
    }
  }

  /**
   * 대상을 선택합니다.
   * @param target 선택할 대상
   * @returns 선택 결과
   */
  public selectTarget(target: Character): TargetingResult {
    if (!this.targetingMode) {
      return {
        success: false,
        message: '타겟팅 모드가 아닙니다.'
      };
    }

    const result = this.targetingSystem.selectTarget(target);

    if (result.success && result.targets) {
      // 화살표 표시
      const caster = this.targetingSystem.getCaster();
      if (caster) {
        if (result.targets.length === 1) {
          this.targetingUI.showTargetingArrow(caster, result.targets[0]);
        } else {
          this.targetingUI.showMultipleTargetingArrows(caster, result.targets);
        }
      }

      // 타겟팅 완료 후 자동으로 스킬 실행
      this.completeTargetingAndExecuteSkill();
    }

    return result;
  }

  /**
   * 타겟팅을 취소합니다.
   */
  public cancelTargeting(): void {
    this.targetingSystem.cancelTargeting();
    this.targetingUI.hideTargetingArrow();
    this.targetingMode = false;
    this.removeInputListeners();
  }

  /**
   * 타겟팅을 완료합니다.
   * @returns 완료 결과
   */
  public completeTargeting(): TargetingResult {
    const selectedTargets = this.targetingSystem.getSelectedTargets();

    this.targetingSystem.completeTargeting();
    this.targetingUI.hideTargetingArrow();
    this.targetingMode = false;
    this.removeInputListeners();

    return {
      success: true,
      message: '타겟팅이 완료되었습니다.',
      targets: selectedTargets
    };
  }

  /**
   * 타겟팅을 완료하고 스킬을 실행합니다.
   */
  private completeTargetingAndExecuteSkill(): void {
    const selectedTargets = this.targetingSystem.getSelectedTargets();
    const caster = this.targetingSystem.getCaster();
    const skill = this.targetingSystem.getCurrentSkill();

    if (caster && skill && selectedTargets.length > 0) {
      // 타겟팅 완료 이벤트 발생
      eventBus.emit('battle:targeting-complete', {
        caster: caster,
        skill: skill,
        targets: selectedTargets
      });
    }

    // 타겟팅 모드 종료
    this.targetingSystem.completeTargeting();
    this.targetingUI.hideTargetingArrow();
    this.targetingMode = false;
    this.removeInputListeners();
  }

  /**
   * 마우스 클릭 이벤트를 처리합니다.
   * @param event 마우스 이벤트
   * @returns 처리 결과
   */
  public handleMouseClick(event: any): TargetingResult {
    if (!this.targetingMode) {
      return { success: false, message: '타겟팅 모드가 아닙니다.' };
    }

    // 클릭된 위치에서 캐릭터 찾기 (실제 구현에서는 더 정교한 로직 필요)
    const clickedCharacter = this.findCharacterAtPosition(event.x, event.y);

    if (clickedCharacter) {
      return this.selectTarget(clickedCharacter);
    }

    return { success: false, message: '유효한 대상을 찾을 수 없습니다.' };
  }

  /**
   * 터치 이벤트를 처리합니다.
   * @param event 터치 이벤트
   * @returns 처리 결과
   */
  public handleTouch(event: any): TargetingResult {
    return this.handleMouseClick(event);
  }

  /**
   * 키 입력을 처리합니다.
   * @param keyCode 키 코드
   * @returns 처리 결과
   */
  public handleKeyPress(keyCode: string): TargetingResult {
    if (keyCode === 'Escape') {
      this.cancelTargeting();
      return { success: true, message: '타겟팅이 취소되었습니다.' };
    }

    return { success: false, message: '지원하지 않는 키입니다.' };
  }

  /**
   * 타겟팅 모드인지 확인합니다.
   */
  public isTargetingMode(): boolean {
    return this.targetingMode;
  }

  /**
   * 유효한 대상들을 반환합니다.
   */
  public getValidTargets(): Character[] {
    return this.targetingSystem.getValidTargets();
  }

  /**
   * 선택된 대상들을 반환합니다.
   */
  public getSelectedTargets(): Character[] {
    return this.targetingSystem.getSelectedTargets();
  }

  /**
   * 타겟팅 상태를 반환합니다.
   */
  public getTargetingState(): string {
    return this.targetingSystem.getState();
  }

  /**
   * 타겟팅 화살표가 표시되어 있는지 확인합니다.
   */
  public isTargetingArrowVisible(): boolean {
    return this.targetingUI.isArrowVisible();
  }

  /**
   * 입력 리스너가 등록되어 있는지 확인합니다.
   */
  public hasInputListeners(): boolean {
    return this.inputListeners.length > 0;
  }

  /**
   * 타겟팅 UI를 업데이트합니다.
   */
  public updateTargetingUI(): void {
    if (this.targetingMode) {
      this.targetingUI.updateArrowPositions();
    }
  }

  /**
   * 화면 크기 변경 시 호출됩니다.
   */
  public onResize(): void {
    this.updateTargetingUI();
  }

  /**
   * 입력 리스너를 설정합니다.
   */
  private setupInputListeners(): void {
    // 마우스 클릭 리스너
    const mouseClickCallback = (pointer: Phaser.Input.Pointer) => {
      this.handleMouseClick(pointer);
    };

    this.scene.input.on('pointerdown', mouseClickCallback);
    this.inputListeners.push({ event: 'pointerdown', callback: mouseClickCallback });

    // 키보드 리스너
    const keyCallback = (event: KeyboardEvent) => {
      this.handleKeyPress(event.code);
    };

    this.scene.input.keyboard?.on('keydown', keyCallback);
    this.inputListeners.push({ event: 'keydown', callback: keyCallback });
  }

  /**
   * 입력 리스너를 제거합니다.
   */
  private removeInputListeners(): void {
    this.inputListeners.forEach(({ event, callback }) => {
      this.scene.input.off(event, callback);
    });
    this.inputListeners = [];
  }

  /**
   * 특정 위치에서 캐릭터를 찾습니다.
   * @param x X 좌표
   * @param y Y 좌표
   * @returns 찾은 캐릭터 또는 null
   */
  private findCharacterAtPosition(x: number, y: number): Character | null {
    const validTargets = this.getValidTargets();

    // 간단한 거리 기반 검색 (실제 구현에서는 더 정교한 로직 필요)
    for (const target of validTargets) {
      const distance = Math.sqrt(
        Math.pow(x - target.position.x, 2) + Math.pow(y - target.position.y, 2)
      );

      if (distance < 50) { // 50픽셀 반경 내
        return target;
      }
    }

    return null;
  }

  /**
   * 매니저를 파괴합니다.
   */
  public destroy(): void {
    this.cancelTargeting();
    this.targetingUI.destroy();
    this.targetingMode = false;
  }
}
