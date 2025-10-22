import { Character } from '@/characters/Character';
import { TurnQueue } from './TurnQueue';
import { calculateDamage } from './DamageCalculator';
import { Skill } from './Skill';
import { EnemyAI } from './EnemyAI';

/**
 * 전투 이벤트 타입
 */
export type BattleEventType = 'turn-start' | 'attack' | 'skill' | 'damage' | 'heal' | 'turn-end' | 'battle-end';

/**
 * 전투 이벤트 데이터
 */
export interface BattleEvent {
  /** 이벤트 타입 */
  type: BattleEventType;
  /** 행동자 (선택) */
  actor?: Character;
  /** 대상 (선택) */
  target?: Character;
  /** 메시지 */
  message: string;
  /** 추가 데이터 (선택) */
  data?: any;
}

/**
 * 전투 로직을 관리하는 컨트롤러
 * 턴 관리, 공격/스킬 실행 등 전투의 핵심 로직을 담당합니다.
 */
export class BattleController {
  private turnQueue: TurnQueue;
  private heroes: Character[];
  private enemies: Character[];
  private eventCallbacks: ((event: BattleEvent) => void)[] = [];

  /**
   * BattleController를 생성합니다
   * @param heroes 플레이어 캐릭터 배열
   * @param enemies 적 캐릭터 배열
   */
  constructor(heroes: Character[], enemies: Character[]) {
    this.heroes = heroes;
    this.enemies = enemies;

    this.turnQueue = new TurnQueue();

    // 모든 캐릭터를 턴 큐에 추가
    [...this.heroes, ...this.enemies].forEach(character => {
      this.turnQueue.addCharacter(character);
    });
  }

  /**
   * 전투 이벤트 리스너를 등록합니다
   * @param callback 이벤트 발생 시 호출될 콜백
   */
  on(callback: (event: BattleEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * 스킬 사용을 처리합니다 (타겟팅 포함)
   * @param caster 스킬 사용자
   * @param skill 사용할 스킬
   * @returns 타겟팅이 필요한지 여부
   */
  public handleSkillUse(caster: Character, skill: Skill): boolean {
    // 타겟팅이 필요한지 확인
    if (this.requiresTargeting(skill)) {
      return true; // 타겟팅 필요
    }

    // 자동 타겟팅
    const autoTargets = this.getAutoTargets(caster, skill);
    if (autoTargets.length > 0) {
      this.executeSkill(skill, caster, autoTargets);
    }

    return false; // 타겟팅 불필요
  }

  /**
   * 타겟팅 완료 후 스킬 실행
   * @param caster 스킬 사용자
   * @param skill 사용할 스킬
   * @param targets 선택된 대상들
   */
  public executeTargetedSkill(caster: Character, skill: Skill, targets: Character[]): void {
    this.executeSkill(skill, caster, targets);
  }

  /**
   * 스킬이 타겟팅을 필요로 하는지 확인
   * @param skill 스킬 객체
   * @returns 타겟팅 필요 여부
   */
  private requiresTargeting(skill: Skill): boolean {
    // 전체 대상 스킬은 타겟팅 불필요
    if (skill.targetType === 'all-enemies' || skill.targetType === 'all-allies' || skill.targetType === 'self') {
      return false;
    }

    // 단일 대상 스킬인 경우 유효한 대상 수 확인
    if (skill.targetType === 'single-enemy' || skill.targetType === 'single-ally') {
      const validTargets = this.getValidTargetsForSkill(skill);
      return validTargets.length > 1; // 대상이 여러 명이면 타겟팅 필요
    }

    return false;
  }

  /**
   * 자동 타겟팅 대상들을 반환
   * @param caster 스킬 사용자
   * @param skill 스킬 객체
   * @returns 자동 타겟팅 대상들
   */
  private getAutoTargets(caster: Character, skill: Skill): Character[] {
    switch (skill.targetType) {
      case 'self':
        return [caster];
      case 'single-enemy':
        const aliveEnemies = this.enemies.filter(enemy => enemy.isAlive());
        return aliveEnemies.length > 0 ? [aliveEnemies[0]] : [];
      case 'all-enemies':
        return this.enemies.filter(enemy => enemy.isAlive());
      case 'single-ally':
        const aliveHeroes = this.heroes.filter(hero => hero.isAlive());
        return aliveHeroes.length > 0 ? [aliveHeroes[0]] : [];
      case 'all-allies':
        return this.heroes.filter(hero => hero.isAlive());
      default:
        return [];
    }
  }

  /**
   * 스킬에 대한 유효한 대상을 반환
   * @param skill 스킬 객체
   * @returns 유효한 대상 배열
   */
  private getValidTargetsForSkill(skill: Skill): Character[] {
    switch (skill.targetType) {
      case 'single-enemy':
      case 'all-enemies':
        return this.enemies.filter(enemy => enemy.isAlive());
      case 'single-ally':
      case 'all-allies':
        return this.heroes.filter(hero => hero.isAlive());
      case 'self':
        return this.heroes.filter(hero => hero.isAlive());
      default:
        return [];
    }
  }

  /**
   * 전투 이벤트를 발생시킵니다
   * @param event 전투 이벤트
   */
  private emit(event: BattleEvent): void {
    this.eventCallbacks.forEach(callback => callback(event));
  }

  /**
   * 전투 상태를 업데이트합니다
   * @param deltaTime 이전 프레임과의 시간 차이
   * @returns 다음 행동자 (플레이어 턴이면 hero, 적 턴이면 자동 실행 후 null)
   */
  update(deltaTime: number): Character | null {
    // 전투 종료 확인 (팀 승리 조건)
    if (this.isBattleOver()) {
      return null;
    }

    // 턴 게이지 업데이트
    this.turnQueue.updateGauges(deltaTime);

    // 다음 행동자 확인
    const nextActor = this.turnQueue.getNextActor();
    if (nextActor) {
      if (this.heroes.includes(nextActor)) {
        // 플레이어 턴 시작
        this.emit({
          type: 'turn-start',
          actor: nextActor,
          message: `${nextActor.name}의 턴!`,
        });
        return nextActor;
      } else {
        // 적 턴 자동 실행
        this.emit({
          type: 'turn-start',
          actor: nextActor,
          message: `${nextActor.name}의 턴!`,
        });
        this.executeEnemyTurn(nextActor);
        return null;
      }
    }

    return null;
  }

  /**
   * 플레이어의 기본 공격을 실행합니다
   * @param attacker 공격하는 캐릭터
   * @param target 공격 대상 캐릭터
   */
  executeAttack(attacker: Character, target: Character): void {
    const damageResult = calculateDamage({
      attack: attacker.attack,
      defense: target.defense,
      criticalRate: 0.2,
    });

    target.takeDamage(damageResult.damage);

    const critText = damageResult.isCritical ? ' [크리티컬!]' : '';
    this.emit({
      type: 'attack',
      actor: attacker,
      target: target,
      message: `${attacker.name}의 공격! ${damageResult.damage} 데미지!${critText}`,
      data: { damage: damageResult.damage, isCritical: damageResult.isCritical },
    });

    // 데미지 이벤트 (애니메이션용)
    this.emit({
      type: 'damage',
      target: target,
      message: '',
      data: { damage: damageResult.damage, isCritical: damageResult.isCritical },
    });

    this.turnQueue.consumeTurn(attacker);

    this.emit({
      type: 'turn-end',
      actor: attacker,
      message: '',
    });
  }

  /**
   * 플레이어의 스킬을 사용합니다
   * @param skill 사용할 스킬
   * @param caster 스킬을 사용하는 캐릭터
   * @param targets 스킬 대상 캐릭터 배열
   */
  executeSkill(skill: Skill, caster: Character, targets: Character[]): void {
    const result = skill.use(caster, targets);

    if (result.success) {
      this.emit({
        type: 'skill',
        actor: caster,
        message: result.message,
      });

      result.effects.forEach(effect => {
        // 대상 캐릭터 찾기 (이름으로 매칭)
        const targetChar = [...this.heroes, ...this.enemies].find(c => c.name === effect.target);
        if (targetChar) {
          this.emit({
            type: effect.type === 'damage' ? 'damage' : 'heal',
            target: targetChar,
            message: effect.message,
            data: {
              damage: effect.type === 'damage' ? effect.value : undefined,
              amount: effect.type === 'heal' ? effect.value : undefined,
            },
          });
        }
      });

      this.turnQueue.consumeTurn(caster);

      this.emit({
        type: 'turn-end',
        actor: caster,
        message: '',
      });
    } else {
      this.emit({
        type: 'skill',
        message: result.message,
      });
    }
  }

  /**
   * 적의 턴을 자동으로 실행합니다
   * AI가 상황에 맞는 행동을 결정합니다
   * @param enemy 행동하는 적 캐릭터
   */
  private executeEnemyTurn(enemy: Character): void {
    const ai = new EnemyAI();
    const action = ai.decideAction(enemy, this.heroes);

    if (action.type === 'skill' && action.skill) {
      // AI가 스킬 사용을 선택함
      this.executeSkill(action.skill, enemy, [action.target]);
    } else {
      // 기본 공격
      this.executeAttack(enemy, action.target);
    }
  }

  /**
   * 전투가 종료되었는지 확인합니다 (팀 승리 조건)
   * @returns 전투 종료 여부
   */
  isBattleOver(): boolean {
    const heroesAlive = this.heroes.some(hero => hero.isAlive());
    const enemiesAlive = this.enemies.some(enemy => enemy.isAlive());
    return !heroesAlive || !enemiesAlive;
  }

  /**
   * 승리 여부를 확인합니다
   * @returns 플레이어가 승리하면 true
   */
  isVictory(): boolean {
    const heroesAlive = this.heroes.some(hero => hero.isAlive());
    const enemiesAlive = this.enemies.some(enemy => enemy.isAlive());
    return heroesAlive && !enemiesAlive;
  }

  /**
   * 패배 여부를 확인합니다
   * @returns 플레이어가 패배하면 true
   */
  isDefeat(): boolean {
    const heroesAlive = this.heroes.some(hero => hero.isAlive());
    return !heroesAlive;
  }

  /**
   * 플레이어 캐릭터들을 가져옵니다
   * @returns 플레이어 캐릭터 배열
   */
  getHeroes(): Character[] {
    return this.heroes;
  }

  /**
   * 적 캐릭터들을 가져옵니다
   * @returns 적 캐릭터 배열
   */
  getEnemies(): Character[] {
    return this.enemies;
  }
}

