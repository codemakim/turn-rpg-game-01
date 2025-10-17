import { Character } from '@/characters/Character';

/**
 * 턴 큐의 각 엔트리
 */
export interface TurnEntry {
  /** 캐릭터 */
  character: Character;
  /** 턴 게이지 (100이 되면 행동 가능) */
  turnGauge: number;
}

/**
 * 턴제 전투의 행동 순서를 관리하는 클래스
 * 각 캐릭터의 속도(speed)에 비례하여 턴 게이지가 증가하고,
 * 100 이상이 되면 행동할 수 있습니다.
 */
export class TurnQueue {
  private entries: TurnEntry[] = [];

  /**
   * 캐릭터를 턴 큐에 추가합니다
   * @param character 추가할 캐릭터
   */
  addCharacter(character: Character): void {
    this.entries.push({
      character,
      turnGauge: 0,
    });
  }

  /**
   * 모든 캐릭터의 턴 게이지를 업데이트합니다
   * 다음 업데이트까지 아무도 100 도달 못할 때는 즉시 점프합니다
   * @param deltaTime 이전 프레임과의 시간 차이 (초 단위)
   */
  updateGauges(deltaTime: number): void {
    // 점프 조건 확인: 다음 업데이트까지 아무도 100 도달 못할 때
    let needsJump = true;
    let jumpTime = 0;

    // 다음 업데이트에서 누가 100 도달할지 확인
    for (const entry of this.entries) {
      if (entry.character.isAlive()) {
        const nextGauge = entry.turnGauge + entry.character.speed * deltaTime;
        if (nextGauge >= 100) {
          needsJump = false;
          break;
        }
      }
    }

    if (needsJump) {
      // 가장 빨리 100 도달할 캐릭터까지의 시간 계산
      let minTimeTo100 = Infinity;
      for (const entry of this.entries) {
        if (entry.character.isAlive() && entry.turnGauge < 100) {
          const timeTo100 = (100 - entry.turnGauge) / entry.character.speed;
          minTimeTo100 = Math.min(minTimeTo100, timeTo100);
        }
      }

      if (minTimeTo100 !== Infinity) {
        jumpTime = minTimeTo100;
        // 모든 캐릭터를 점프 시점으로 업데이트
        this.entries.forEach(entry => {
          if (entry.character.isAlive()) {
            entry.turnGauge += entry.character.speed * jumpTime;
          }
        });
      }
    } else {
      // 일반 업데이트
      this.entries.forEach(entry => {
        entry.turnGauge += entry.character.speed * deltaTime;
      });
    }
  }

  /**
   * 다음 행동할 캐릭터를 가져옵니다
   * @returns turnGauge가 100 이상이고 살아있는 캐릭터 중 게이지가 가장 높은 캐릭터, 없으면 null
   */
  getNextActor(): Character | null {
    // turnGauge가 100 이상인 엔트리 중 가장 높은 것 찾기
    const ready = this.entries
      .filter(e => e.turnGauge >= 100 && e.character.isAlive())
      .sort((a, b) => b.turnGauge - a.turnGauge)[0];

    return ready?.character ?? null;
  }

  /**
   * 캐릭터가 행동을 완료했을 때 턴을 소비합니다
   * 행동한 캐릭터의 게이지만 100 차감 (다른 캐릭터는 유지)
   * @param character 행동한 캐릭터
   */
  consumeTurn(character: Character): void {
    const entry = this.entries.find(e => e.character === character);
    if (entry) {
      entry.turnGauge -= 100;
    }
  }

  /**
   * 모든 캐릭터의 턴 게이지를 0으로 초기화합니다
   */
  reset(): void {
    this.entries.forEach(entry => {
      entry.turnGauge = 0;
    });
  }

  /**
   * 모든 턴 엔트리의 복사본을 가져옵니다
   * @returns 턴 엔트리 배열
   */
  getEntries(): TurnEntry[] {
    return [...this.entries];
  }
}

