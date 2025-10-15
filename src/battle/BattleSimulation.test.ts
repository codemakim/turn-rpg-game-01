import { describe, it, expect } from 'vitest';
import { Character } from '@/characters/Character';
import { TurnQueue } from './TurnQueue';
import { calculateDamage } from './DamageCalculator';

describe('전투 시뮬레이션 통합 테스트', () => {
  it('간단한 1vs1 전투가 정상 동작해야 함', () => {
    // 캐릭터 생성
    const hero = new Character({
      name: 'Hero',
      hp: 100,
      mp: 50,
      attack: 30,
      defense: 10,
      speed: 15,
    });

    const enemy = new Character({
      name: 'Slime',
      hp: 50,
      mp: 0,
      attack: 15,
      defense: 5,
      speed: 10,
    });

    // 턴 큐 설정
    const queue = new TurnQueue();
    queue.addCharacter(hero);
    queue.addCharacter(enemy);

    // 전투 시뮬레이션
    let turnCount = 0;
    const maxTurns = 100; // 무한 루프 방지

    while (hero.isAlive() && enemy.isAlive() && turnCount < maxTurns) {
      queue.updateGauges(1);

      let actor = queue.getNextActor();
      while (actor && hero.isAlive() && enemy.isAlive()) {
        // 행동 실행
        const target = actor === hero ? enemy : hero;
        const damageResult = calculateDamage({
          attack: actor.attack,
          defense: target.defense,
          criticalRate: 0.2,
        });

        target.takeDamage(damageResult.damage);
        queue.consumeTurn(actor);
        turnCount++;

        actor = queue.getNextActor();
      }
    }

    // 결과 검증: 둘 중 하나는 반드시 죽어야 함
    expect(hero.isAlive() || enemy.isAlive()).toBe(true);
    expect(hero.isAlive() && enemy.isAlive()).toBe(false);

    // 무한 루프 없이 전투가 끝나야 함
    expect(turnCount).toBeLessThan(maxTurns);
  });

  it('속도가 빠른 캐릭터가 먼저 행동해야 함', () => {
    const fastHero = new Character({
      name: 'Fast',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 30,
    });

    const slowEnemy = new Character({
      name: 'Slow',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 5,
    });

    const queue = new TurnQueue();
    queue.addCharacter(fastHero);
    queue.addCharacter(slowEnemy);

    const actionOrder: string[] = [];

    // 첫 행동자 결정
    for (let i = 0; i < 20; i++) {
      queue.updateGauges(1);
      const actor = queue.getNextActor();
      if (actor) {
        actionOrder.push(actor.name);
        queue.consumeTurn(actor);
        break;
      }
    }

    // 빠른 캐릭터가 먼저 행동해야 함
    expect(actionOrder[0]).toBe('Fast');
  });

  it('한쪽이 전멸하면 전투가 종료되어야 함', () => {
    const hero = new Character({
      name: 'Hero',
      hp: 200,
      attack: 50,
      defense: 20,
      speed: 15,
    });

    const weakEnemy = new Character({
      name: 'Weak',
      hp: 30,
      attack: 5,
      defense: 0,
      speed: 10,
    });

    const queue = new TurnQueue();
    queue.addCharacter(hero);
    queue.addCharacter(weakEnemy);

    let battleEnded = false;
    let turnCount = 0;

    while (!battleEnded && turnCount < 50) {
      queue.updateGauges(1);

      let actor = queue.getNextActor();
      while (actor) {
        const target = actor === hero ? weakEnemy : hero;

        if (!target.isAlive()) {
          battleEnded = true;
          break;
        }

        const damageResult = calculateDamage({
          attack: actor.attack,
          defense: target.defense,
        });

        target.takeDamage(damageResult.damage);
        queue.consumeTurn(actor);
        turnCount++;

        if (!hero.isAlive() || !weakEnemy.isAlive()) {
          battleEnded = true;
          break;
        }

        actor = queue.getNextActor();
      }
    }

    // 전투 종료 확인
    expect(battleEnded).toBe(true);
    expect(hero.isAlive()).toBe(true);
    expect(weakEnemy.isAlive()).toBe(false);
  });

  it('크리티컬이 발생하면 더 큰 데미지를 입혀야 함', () => {
    const attacker = new Character({
      name: 'Attacker',
      hp: 100,
      attack: 50,
      defense: 10,
      speed: 10,
    });

    const defender = new Character({
      name: 'Defender',
      hp: 200,
      attack: 10,
      defense: 10,
      speed: 10,
    });

    // 일반 공격
    const normalDamage = calculateDamage({
      attack: attacker.attack,
      defense: defender.defense,
      isCritical: false,
    });

    // 크리티컬 공격
    const criticalDamage = calculateDamage({
      attack: attacker.attack,
      defense: defender.defense,
      isCritical: true,
    });

    // 크리티컬이 더 큰 데미지를 입혀야 함
    expect(criticalDamage.damage).toBeGreaterThan(normalDamage.damage);
    expect(criticalDamage.isCritical).toBe(true);
    expect(normalDamage.isCritical).toBe(false);
  });
});

