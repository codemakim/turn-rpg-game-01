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
  private hero: Character;
  private enemy: Character;
  private eventCallbacks: ((event: BattleEvent) => void)[] = [];

  /**
   * BattleController를 생성합니다
   * @param hero 플레이어 캐릭터
   * @param enemy 적 캐릭터
   */
  constructor(hero: Character, enemy: Character) {
    this.hero = hero;
    this.enemy = enemy;

    this.turnQueue = new TurnQueue();
    this.turnQueue.addCharacter(hero);
    this.turnQueue.addCharacter(enemy);
  }

  /**
   * 전투 이벤트 리스너를 등록합니다
   * @param callback 이벤트 발생 시 호출될 콜백
   */
  on(callback: (event: BattleEvent) => void): void {
    this.eventCallbacks.push(callback);
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
    // 전투 종료 확인
    if (!this.hero.isAlive() || !this.enemy.isAlive()) {
      return null;
    }

    // 턴 게이지 업데이트
    this.turnQueue.updateGauges(deltaTime);

    // 다음 행동자 확인
    const nextActor = this.turnQueue.getNextActor();
    if (nextActor) {
      if (nextActor === this.hero) {
        // 플레이어 턴 시작
        this.emit({
          type: 'turn-start',
          actor: this.hero,
          message: `${this.hero.name}의 턴!`,
        });
        return this.hero;
      } else {
        // 적 턴 자동 실행
        this.executeEnemyTurn();
        return null;
      }
    }

    return null;
  }

  /**
   * 플레이어의 기본 공격을 실행합니다
   */
  executeAttack(): void {
    const damageResult = calculateDamage({
      attack: this.hero.attack,
      defense: this.enemy.defense,
      criticalRate: 0.2,
    });

    this.enemy.takeDamage(damageResult.damage);

    const critText = damageResult.isCritical ? ' [크리티컬!]' : '';
    this.emit({
      type: 'attack',
      actor: this.hero,
      target: this.enemy,
      message: `${this.hero.name}의 공격! ${damageResult.damage} 데미지!${critText}`,
      data: { damage: damageResult.damage, isCritical: damageResult.isCritical },
    });

    // 데미지 이벤트 (애니메이션용)
    this.emit({
      type: 'damage',
      target: this.enemy,
      message: '',
      data: { damage: damageResult.damage, isCritical: damageResult.isCritical },
    });

    this.turnQueue.consumeTurn(this.hero);

    this.emit({
      type: 'turn-end',
      actor: this.hero,
      message: '',
    });
  }

  /**
   * 플레이어의 스킬을 사용합니다
   * @param skill 사용할 스킬
   */
  executeSkill(skill: Skill): void {
    const target = skill.targetType === 'self' ? this.hero : this.enemy;
    const result = skill.use(this.hero, [target]);

    if (result.success) {
      this.emit({
        type: 'skill',
        actor: this.hero,
        target,
        message: result.message,
      });

      result.effects.forEach(effect => {
        this.emit({
          type: effect.type === 'damage' ? 'damage' : 'heal',
          target,
          message: effect.message,
          data: {
            damage: effect.type === 'damage' ? effect.value : undefined,
            amount: effect.type === 'heal' ? effect.value : undefined,
          },
        });
      });

      this.turnQueue.consumeTurn(this.hero);

      this.emit({
        type: 'turn-end',
        actor: this.hero,
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
   */
  private executeEnemyTurn(): void {
    const ai = new EnemyAI();
    const action = ai.decideAction(this.enemy, [this.hero]);

    if (action.type === 'skill' && action.skill) {
      // AI가 스킬 사용을 선택함
      const result = action.skill.use(this.enemy, [action.target]);

      if (result.success) {
        this.emit({
          type: 'skill',
          actor: this.enemy,
          target: action.target,
          message: result.message,
        });

        result.effects.forEach(effect => {
          this.emit({
            type: effect.type === 'damage' ? 'damage' : 'heal',
            target: action.target,
            message: effect.message,
            data: {
              damage: effect.type === 'damage' ? effect.value : undefined,
              amount: effect.type === 'heal' ? effect.value : undefined,
            },
          });
        });
      }
    } else {
      // 기본 공격
      const damageResult = calculateDamage({
        attack: this.enemy.attack,
        defense: this.hero.defense,
        criticalRate: 0.15,
      });

      this.hero.takeDamage(damageResult.damage);

      const critText = damageResult.isCritical ? ' [크리티컬!]' : '';
      this.emit({
        type: 'attack',
        actor: this.enemy,
        target: this.hero,
        message: `${this.enemy.name}의 공격! ${damageResult.damage} 데미지!${critText}`,
        data: { damage: damageResult.damage, isCritical: damageResult.isCritical },
      });

      // 데미지 이벤트 (애니메이션용)
      this.emit({
        type: 'damage',
        target: this.hero,
        message: '',
        data: { damage: damageResult.damage, isCritical: damageResult.isCritical },
      });
    }

    this.turnQueue.consumeTurn(this.enemy);
  }

  /**
   * 전투가 종료되었는지 확인합니다
   * @returns 전투 종료 여부
   */
  isBattleOver(): boolean {
    return !this.hero.isAlive() || !this.enemy.isAlive();
  }

  /**
   * 승리 여부를 확인합니다
   * @returns 플레이어가 승리하면 true
   */
  isVictory(): boolean {
    return this.hero.isAlive() && !this.enemy.isAlive();
  }

  /**
   * 패배 여부를 확인합니다
   * @returns 플레이어가 패배하면 true
   */
  isDefeat(): boolean {
    return !this.hero.isAlive();
  }

  /**
   * 플레이어 캐릭터를 가져옵니다
   * @returns 플레이어 캐릭터
   */
  getHero(): Character {
    return this.hero;
  }

  /**
   * 적 캐릭터를 가져옵니다
   * @returns 적 캐릭터
   */
  getEnemy(): Character {
    return this.enemy;
  }
}

