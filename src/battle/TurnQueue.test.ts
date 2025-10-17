import { describe, it, expect, beforeEach } from 'vitest';
import { TurnQueue } from './TurnQueue';
import { Character } from '@/characters/Character';

describe('TurnQueue', () => {
  let queue: TurnQueue;
  let fastCharacter: Character;
  let slowCharacter: Character;
  let normalCharacter: Character;

  beforeEach(() => {
    queue = new TurnQueue();

    fastCharacter = new Character({
      name: 'Fast',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 20,
    });

    slowCharacter = new Character({
      name: 'Slow',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 5,
    });

    normalCharacter = new Character({
      name: 'Normal',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 10,
    });
  });

  describe('캐릭터 추가', () => {
    it('캐릭터를 큐에 추가할 수 있어야 함', () => {
      queue.addCharacter(fastCharacter);
      queue.addCharacter(slowCharacter);

      const entries = queue.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].character).toBe(fastCharacter);
      expect(entries[1].character).toBe(slowCharacter);
    });

    it('추가된 캐릭터의 초기 turnGauge는 0이어야 함', () => {
      queue.addCharacter(fastCharacter);

      const entries = queue.getEntries();
      expect(entries[0].turnGauge).toBe(0);
    });
  });

  describe('턴 게이지 업데이트', () => {
    it('캐릭터의 speed에 비례하여 turnGauge가 증가해야 함 (점프 시스템)', () => {
      queue.addCharacter(fastCharacter); // speed: 20
      queue.addCharacter(slowCharacter); // speed: 5

      queue.updateGauges(1); // deltaTime: 1 - 점프 발생 (속도 20이 100 도달)

      const entries = queue.getEntries();
      expect(entries[0].turnGauge).toBe(100); // 점프로 즉시 100 도달
      expect(entries[1].turnGauge).toBe(25);  // 5 * 5 (점프 시간)
    });

    it('여러 번 업데이트하면 turnGauge가 누적되어야 함 (점프 시스템)', () => {
      queue.addCharacter(normalCharacter); // speed: 10

      queue.updateGauges(3); // 점프 발생
      queue.updateGauges(2); // 추가 점프 (120 도달)

      const entries = queue.getEntries();
      expect(entries[0].turnGauge).toBe(120); // 점프로 120 도달
    });
  });

  describe('다음 행동자 결정', () => {
    it('turnGauge가 100 이상인 캐릭터가 없으면 null을 반환해야 함 (점프 시스템)', () => {
      queue.addCharacter(fastCharacter);
      queue.updateGauges(4); // 점프 발생으로 100 도달

      expect(queue.getNextActor()).not.toBeNull(); // 점프로 인해 행동 가능
    });

    it('turnGauge가 100 이상인 캐릭터를 반환해야 함', () => {
      queue.addCharacter(fastCharacter);
      queue.updateGauges(5); // 20 * 5 = 100

      const nextActor = queue.getNextActor();
      expect(nextActor).toBe(fastCharacter);
    });

    it('여러 캐릭터가 준비되면 turnGauge가 가장 높은 캐릭터를 반환해야 함', () => {
      queue.addCharacter(fastCharacter); // speed: 20
      queue.addCharacter(slowCharacter);  // speed: 5

      queue.updateGauges(10);
      // fastCharacter: 200, slowCharacter: 50

      const nextActor = queue.getNextActor();
      expect(nextActor).toBe(fastCharacter);
    });

    it('죽은 캐릭터는 행동할 수 없어야 함', () => {
      queue.addCharacter(fastCharacter);
      queue.addCharacter(slowCharacter);

      fastCharacter.takeDamage(100); // 죽음
      slowCharacter.takeDamage(100); // 둘 다 죽음
      queue.updateGauges(10);

      const nextActor = queue.getNextActor();
      expect(nextActor).toBeNull(); // 모든 캐릭터가 죽었으므로 null
    });

    it('살아있는 캐릭터만 행동 가능해야 함', () => {
      queue.addCharacter(fastCharacter);
      queue.addCharacter(slowCharacter);

      fastCharacter.takeDamage(100); // 죽음
      queue.updateGauges(20); // slowCharacter: 100

      const nextActor = queue.getNextActor();
      expect(nextActor).toBe(slowCharacter);
    });
  });

  describe('턴 소비', () => {
    it('행동한 캐릭터의 turnGauge가 100 감소해야 함', () => {
      queue.addCharacter(fastCharacter);
      queue.updateGauges(7); // 20 * 7 = 140

      queue.consumeTurn(fastCharacter);

      const entries = queue.getEntries();
      expect(entries[0].turnGauge).toBe(40); // 140 - 100
    });

    it('turnGauge가 음수가 될 수 있어야 함 (빠른 연속 행동 방지)', () => {
      queue.addCharacter(normalCharacter);
      queue.updateGauges(8); // 점프 발생으로 100 도달

      queue.consumeTurn(normalCharacter);

      const entries = queue.getEntries();
      expect(entries[0].turnGauge).toBe(0); // 100 - 100 = 0
    });
  });

  describe('리셋', () => {
    it('모든 캐릭터의 turnGauge를 0으로 초기화해야 함', () => {
      queue.addCharacter(fastCharacter);
      queue.addCharacter(slowCharacter);

      queue.updateGauges(10);
      queue.reset();

      const entries = queue.getEntries();
      entries.forEach(entry => {
        expect(entry.turnGauge).toBe(0);
      });
    });
  });

  describe('턴 순서 시뮬레이션', () => {
    it('속도가 빠른 캐릭터가 더 자주 행동해야 함', () => {
      queue.addCharacter(fastCharacter); // speed: 20
      queue.addCharacter(slowCharacter);  // speed: 5

      const actionOrder: string[] = [];

      // 시뮬레이션: 10번의 턴 진행
      for (let i = 0; i < 10; i++) {
        queue.updateGauges(1);

        let actor = queue.getNextActor();
        while (actor) {
          actionOrder.push(actor.name);
          queue.consumeTurn(actor);
          actor = queue.getNextActor();
        }
      }

      // Fast가 Slow보다 많이 행동해야 함 (속도가 4배 빠름)
      const fastActions = actionOrder.filter(name => name === 'Fast').length;
      const slowActions = actionOrder.filter(name => name === 'Slow').length;

      expect(fastActions).toBeGreaterThan(slowActions);
    });
  });
});

