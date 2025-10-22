import { eventBus } from '@/core/EventBus';
import { Skill } from '@/battle/Skill';

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
      this.handleButtonClick(data.buttonId);
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
   */
  private handleButtonClick(buttonId: string): void {
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
   * 공격 처리 (스킬 시스템으로 통일)
   */
  private handleAttack(): void {
    if (!this.currentActor) return;

    // 기본 공격 스킬 생성
    const attackSkill = this.createBasicAttackSkill();

    // 스킬 시스템을 통해 처리
    this.handleSkill(attackSkill.id);
  }

  /**
   * 기본 공격 스킬을 생성합니다
   * @returns 기본 공격 스킬
   */
  private createBasicAttackSkill(): Skill {
    return new Skill({
      id: 'basic-attack',
      name: '공격',
      description: '기본 공격',
      mpCost: 0,
      targetType: 'single-enemy',
      effects: [{ type: 'damage', value: 100 }] // 100% 공격력 데미지
    });
  }

  /**
   * 스킬 처리
   * @param skillId 스킬 ID
   */
  private handleSkill(skillId: string): void {
    if (!this.currentActor) return;

    // 베이직 어택 스킬은 동적으로 생성
    let skill: any;
    if (skillId === 'basic-attack') {
      skill = this.createBasicAttackSkill();
    } else {
      // 현재 캐릭터의 스킬 찾기
      skill = this.currentActor.skills.find((s: any) => s.id === skillId);
      if (!skill) {
        console.warn('스킬을 찾을 수 없음:', skillId);
        return;
      }
    }

    // 타겟팅이 필요한 스킬인지 확인
    if (this.requiresTargeting(skill)) {
      // 타겟팅 모드 시작
      eventBus.emit('battle:start-targeting', {
        caster: this.currentActor,
        skill: skill,
      });
    } else {
      // 자동 타겟팅 (기존 로직)
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
  }

  /**
   * 스킬이 타겟팅을 필요로 하는지 확인
   * @param skill 스킬 객체
   * @returns 타겟팅 필요 여부
   */
  private requiresTargeting(skill: any): boolean {
    // 전체 대상 스킬은 타겟팅 불필요
    if (skill.targetType === 'all-enemies' || skill.targetType === 'all-allies' || skill.targetType === 'self') {
      return false;
    }

    // 단일 대상 스킬인 경우 유효한 대상 수 확인
    if (skill.targetType === 'single-enemy' || skill.targetType === 'single-ally') {
      const validTargets = this.getValidTargetsForSkill(skill);

      // 대상이 1명뿐이면 타겟팅 불필요 (선택권 없음)
      if (validTargets.length <= 1) {
        return false;
      }

      // 대상이 여러 명이면 타겟팅 필요 (선택권 있음)
      return true;
    }

    return false;
  }

  /**
   * 스킬에 대한 유효한 대상을 반환
   * @param skill 스킬 객체
   * @returns 유효한 대상 배열
   */
  private getValidTargetsForSkill(skill: any): any[] {
    switch (skill.targetType) {
      case 'single-enemy':
      case 'all-enemies':
        return this.enemies.filter(enemy => enemy.isAlive());
      case 'single-ally':
      case 'all-allies':
        return this.heroes.filter(hero => hero.isAlive());
      case 'self':
        return [this.currentActor];
      default:
        return [];
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
