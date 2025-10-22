import { Character } from '@/characters/Character';
import { Skill } from './Skill';

/**
 * 타겟팅 상태
 */
export type TargetingState = 'IDLE' | 'SELECTING' | 'CONFIRMED' | 'CANCELLED';

/**
 * 타겟팅 결과
 */
export interface TargetingResult {
  success: boolean;
  message: string;
  targets?: Character[];
}

/**
 * 타겟팅 시스템
 * 스킬 사용 시 대상을 선택하는 로직을 관리합니다.
 */
export class TargetingSystem {
  private state: TargetingState = 'IDLE';
  private currentSkill: Skill | null = null;
  private heroes: Character[] = [];
  private enemies: Character[] = [];
  private selectedTargets: Character[] = [];
  private validTargets: Character[] = [];
  private caster: Character | null = null;

  /**
   * 현재 타겟팅 상태를 반환합니다.
   */
  public getState(): TargetingState {
    return this.state;
  }

  /**
   * 현재 스킬 사용자를 반환합니다.
   */
  public getCaster(): Character | null {
    return this.caster;
  }

  /**
   * 현재 스킬을 반환합니다.
   */
  public getCurrentSkill(): Skill | null {
    return this.currentSkill;
  }

  /**
   * 타겟팅을 시작합니다.
   * @param skill 사용할 스킬
   * @param heroes 아군 캐릭터들
   * @param enemies 적군 캐릭터들
   * @param caster 스킬 사용자
   */
  public startTargeting(skill: Skill, heroes: Character[], enemies: Character[], caster: Character): void {
    this.currentSkill = skill;
    this.heroes = heroes;
    this.enemies = enemies;
    this.caster = caster;
    this.selectedTargets = [];
    this.state = 'SELECTING';

    console.log(`타겟팅 시작: ${skill.name} (${skill.targetType})`);
    console.log(`아군: ${heroes.length}명`, heroes.map(h => h.name));
    console.log(`적군: ${enemies.length}명`, enemies.map(e => e.name));

    this.updateValidTargets();

    console.log(`유효한 대상: ${this.validTargets.length}명`, this.validTargets.map(t => t.name));
  }

  /**
   * 유효한 대상들을 반환합니다.
   */
  public getValidTargets(): Character[] {
    return this.validTargets;
  }

  /**
   * 선택된 대상들을 반환합니다.
   */
  public getSelectedTargets(): Character[] {
    return this.selectedTargets;
  }

  /**
   * 대상을 선택합니다.
   * @param target 선택할 대상
   * @returns 선택 결과
   */
  public selectTarget(target: Character): TargetingResult {
    if (this.state !== 'SELECTING') {
      return {
        success: false,
        message: '타겟팅 모드가 아닙니다.'
      };
    }

    if (!this.isValidTarget(target)) {
      return {
        success: false,
        message: '유효하지 않은 대상입니다.'
      };
    }

    // 스킬 타입에 따른 대상 선택 처리
    switch (this.currentSkill!.targetType) {
      case 'single-enemy':
      case 'single-ally':
        this.selectedTargets = [target];
        break;
      case 'all-enemies':
        this.selectedTargets = this.getAliveEnemies();
        break;
      case 'all-allies':
        this.selectedTargets = this.getAliveHeroes();
        break;
      case 'self':
        this.selectedTargets = [this.heroes[0]]; // 사용자 캐릭터
        break;
    }

    this.state = 'CONFIRMED';
    return {
      success: true,
      message: '대상이 선택되었습니다.',
      targets: this.selectedTargets
    };
  }

  /**
   * 타겟팅을 취소합니다.
   */
  public cancelTargeting(): void {
    this.state = 'IDLE';
    this.selectedTargets = [];
    this.currentSkill = null;
    this.validTargets = [];
  }

  /**
   * 타겟팅을 완료합니다.
   */
  public completeTargeting(): void {
    this.state = 'IDLE';
    this.selectedTargets = [];
    this.currentSkill = null;
    this.validTargets = [];
  }

  /**
   * 타겟팅 시스템을 리셋합니다.
   */
  public reset(): void {
    this.state = 'IDLE';
    this.currentSkill = null;
    this.heroes = [];
    this.enemies = [];
    this.selectedTargets = [];
    this.validTargets = [];
  }

  /**
   * 유효한 대상인지 확인합니다.
   * @param target 확인할 대상
   * @returns 유효한 대상인지 여부
   */
  private isValidTarget(target: Character): boolean {
    if (!this.currentSkill) return false;
    if (!target.isAlive()) return false;

    switch (this.currentSkill.targetType) {
      case 'single-enemy':
      case 'all-enemies':
        return this.enemies.includes(target);
      case 'single-ally':
      case 'all-allies':
        return this.heroes.includes(target);
      case 'self':
        return this.heroes.includes(target);
      default:
        return false;
    }
  }

  /**
   * 유효한 대상들을 업데이트합니다.
   */
  private updateValidTargets(): void {
    if (!this.currentSkill) {
      this.validTargets = [];
      return;
    }

    switch (this.currentSkill.targetType) {
      case 'single-enemy':
        this.validTargets = this.getAliveEnemies();
        break;
      case 'all-enemies':
        this.validTargets = this.getAliveEnemies();
        break;
      case 'single-ally':
        this.validTargets = this.getAliveHeroes();
        break;
      case 'all-allies':
        this.validTargets = this.getAliveHeroes();
        break;
      case 'self':
        this.validTargets = this.heroes.filter(hero => hero.isAlive());
        break;
      default:
        this.validTargets = [];
    }
  }

  /**
   * 살아있는 아군들을 반환합니다.
   */
  private getAliveHeroes(): Character[] {
    return this.heroes.filter(hero => hero.isAlive());
  }

  /**
   * 살아있는 적군들을 반환합니다.
   */
  private getAliveEnemies(): Character[] {
    return this.enemies.filter(enemy => enemy.isAlive());
  }
}
