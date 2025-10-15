import type { Skill } from '@/battle/Skill';

/**
 * 캐릭터 생성 시 필요한 스탯 정보
 */
export interface CharacterStats {
  /** 캐릭터 이름 */
  name: string;
  /** 현재 체력 */
  hp: number;
  /** 최대 체력 (선택, 기본값: hp) */
  maxHp?: number;
  /** 현재 마나 (선택, 기본값: 0) */
  mp?: number;
  /** 최대 마나 (선택, 기본값: mp) */
  maxMp?: number;
  /** 공격력 */
  attack: number;
  /** 방어력 */
  defense: number;
  /** 속도 (턴 게이지 증가 속도, 선택, 기본값: 10) */
  speed?: number;
  /** 보유 스킬 목록 (선택, 기본값: []) */
  skills?: Skill[];
}

/**
 * 게임 캐릭터 클래스
 * 플레이어와 적 모두 이 클래스를 사용합니다.
 */
export class Character {
  /** 캐릭터 이름 */
  public name: string;
  /** 현재 체력 */
  public hp: number;
  /** 최대 체력 */
  public maxHp: number;
  /** 현재 마나 */
  public mp: number;
  /** 최대 마나 */
  public maxMp: number;
  /** 공격력 */
  public attack: number;
  /** 방어력 */
  public defense: number;
  /** 속도 (턴 게이지 증가 속도) */
  public speed: number;
  /** 보유 스킬 목록 */
  public skills: Skill[];

  /**
   * 캐릭터를 생성합니다
   * @param stats 캐릭터 스탯 정보
   */
  constructor(stats: CharacterStats) {
    this.name = stats.name;
    this.hp = stats.hp;
    this.maxHp = stats.maxHp ?? stats.hp;
    this.mp = stats.mp ?? 0;
    this.maxMp = stats.maxMp ?? this.mp;
    this.attack = stats.attack;
    this.defense = stats.defense;
    this.speed = stats.speed ?? 10;
    this.skills = stats.skills ?? [];
  }

  /**
   * 데미지를 받아 HP를 감소시킵니다
   * @param amount 받을 데미지량
   */
  takeDamage(amount: number): void {
    // HP는 0 이하로 내려가지 않음
    this.hp = Math.max(0, this.hp - amount);
  }

  /**
   * HP를 회복합니다
   * @param amount 회복량
   */
  heal(amount: number): void {
    // maxHp를 초과할 수 없음
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /**
   * 캐릭터가 살아있는지 확인합니다
   * @returns HP가 0보다 크면 true
   */
  isAlive(): boolean {
    return this.hp > 0;
  }
}

