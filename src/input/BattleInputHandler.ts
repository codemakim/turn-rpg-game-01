import { eventBus } from '@/core/EventBus';
import { Skill } from '@/battle/Skill';
import { Character } from '@/characters/Character';
import { BattleController } from '@/battle/BattleController';

/**
 * 전투 입력 처리 핸들러 (입력 처리만 담당)
 * EventBus를 통해 UI 이벤트를 전투 로직으로 변환
 */
export class BattleInputHandler {
  private currentActor: Character | null = null;
  private controller: BattleController | null = null;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * BattleController 설정
   * @param controller 전투 컨트롤러
   */
  public setController(controller: BattleController): void {
    this.controller = controller;
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // UI 버튼 클릭 이벤트 처리
    eventBus.on('ui:button-click', (data) => {
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
  public setCurrentActor(actor: Character | null): void {
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
    if (!this.currentActor || !this.controller) return;

    // 베이직 어택 스킬은 동적으로 생성
    let skill: Skill;
    if (skillId === 'basic-attack') {
      skill = this.createBasicAttackSkill();
    } else {
      // 현재 캐릭터의 스킬 찾기
      const foundSkill = this.currentActor.skills.find((s: Skill) => s.id === skillId);
      if (!foundSkill) {
        console.warn('스킬을 찾을 수 없음:', skillId);
        return;
      }
      skill = foundSkill;
    }

    // BattleController를 통해 스킬 처리
    const needsTargeting = this.controller.handleSkillUse(this.currentActor, skill);

    if (needsTargeting) {
      // 타겟팅 모드 시작 (기존 이벤트 방식 유지)
      eventBus.emit('battle:start-targeting', {
        caster: this.currentActor,
        skill: skill,
      });
    }
  }



  /**
   * 입력 핸들러 파괴
   */
  public destroy(): void {
    // 이벤트 리스너는 EventBus에서 자동으로 정리됨
  }
}
