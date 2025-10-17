import { eventBus } from '@/core/EventBus';

/**
 * 전투 입력 처리 핸들러 (입력 처리만 담당)
 * EventBus를 통해 UI 이벤트를 전투 로직으로 변환
 */
export class BattleInputHandler {
  private currentActor: any = null;
  private heroes: any[] = [];
  private enemies: any[] = [];

  constructor() {
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // UI 버튼 클릭 이벤트 처리
    eventBus.on('ui:button-click', (data) => {
      console.log('버튼 클릭 이벤트 수신:', data);
      this.handleButtonClick(data.buttonId, data.data);
    });

    // 턴 종료 이벤트에서 현재 액터 초기화
    eventBus.on('battle:turn-end', () => {
      this.currentActor = null;
    });
  }

  /**
   * 현재 액터 설정 (BattleScene에서 호출)
   * @param actor 현재 행동할 캐릭터
   */
  public setCurrentActor(actor: any): void {
    this.currentActor = actor;
    console.log('현재 액터 설정:', actor?.name);
  }

  /**
   * 버튼 클릭 처리
   * @param buttonId 버튼 ID
   * @param data 추가 데이터
   */
  private handleButtonClick(buttonId: string, data?: any): void {
    if (!this.currentActor) {
      return;
    }

    switch (buttonId) {
      case 'attack':
        this.handleAttack();
        break;
      case 'skill-strong-attack':
        this.handleSkill('strong-attack');
        break;
      case 'skill-heal':
        this.handleSkill('heal');
        break;
      case 'skill-fireball':
        this.handleSkill('fireball');
        break;
      case 'skill-slime-attack':
        this.handleSkill('slime-attack');
        break;
      case 'skill-goblin-attack':
        this.handleSkill('goblin-attack');
        break;
      default:
        console.warn('알 수 없는 버튼:', buttonId);
    }
  }

  /**
   * 공격 처리
   */
  private handleAttack(): void {
    if (!this.currentActor) return;

    // 현재는 첫 번째 살아있는 적을 공격 (향후 타겟 선택 UI 추가 예정)
    const aliveEnemies = this.enemies.filter(enemy => enemy.isAlive());
    if (aliveEnemies.length > 0) {
      eventBus.emit('battle:attack', {
        attacker: this.currentActor,
        target: aliveEnemies[0],
        damage: 0, // DamageCalculator에서 계산됨
      });
    }
  }

  /**
   * 스킬 처리
   * @param skillId 스킬 ID
   */
  private handleSkill(skillId: string): void {
    if (!this.currentActor) return;

    // 현재 캐릭터의 스킬 찾기
    const skill = this.currentActor.skills.find((s: any) => s.id === skillId);
    if (!skill) {
      console.warn('스킬을 찾을 수 없음:', skillId);
      return;
    }

    // 스킬 타겟팅에 따라 대상 결정
    let targets: any[] = [];

    if (skill.targetType === 'self') {
      targets = [this.currentActor];
    } else if (skill.targetType === 'single-enemy') {
      const aliveEnemies = this.enemies.filter(enemy => enemy.isAlive());
      if (aliveEnemies.length > 0) {
        targets = [aliveEnemies[0]];
      }
    } else if (skill.targetType === 'all-enemies') {
      targets = this.enemies.filter(enemy => enemy.isAlive());
    } else if (skill.targetType === 'all-allies') {
      targets = this.heroes.filter(hero => hero.isAlive());
    }

    if (targets.length > 0) {
      eventBus.emit('battle:skill', {
        caster: this.currentActor,
        skill: skill,
        targets: targets,
      });
    }
  }

  /**
   * 캐릭터 목록 설정 (씬에서 초기화 시 호출)
   * @param heroes 아군 캐릭터 목록
   * @param enemies 적 캐릭터 목록
   */
  public setCharacters(heroes: any[], enemies: any[]): void {
    this.heroes = heroes;
    this.enemies = enemies;
  }

  /**
   * 입력 핸들러 파괴
   */
  public destroy(): void {
    // 이벤트 리스너는 EventBus에서 자동으로 정리됨
  }
}
