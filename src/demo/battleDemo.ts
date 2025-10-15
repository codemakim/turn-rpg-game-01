import { Character } from '@/characters/Character';
import { TurnQueue } from '@/battle/TurnQueue';
import { calculateDamage } from '@/battle/DamageCalculator';

export function runBattleDemo(): void {
  console.log('=== 턴제 RPG 전투 데모 ===\n');

  // 캐릭터 생성
  const hero = new Character({
    name: '용사',
    hp: 120,
    mp: 60,
    attack: 35,
    defense: 12,
    speed: 18,
  });

  const enemy = new Character({
    name: '슬라임',
    hp: 80,
    mp: 20,
    attack: 20,
    defense: 8,
    speed: 12,
  });

  console.log(`${hero.name} - HP: ${hero.hp}/${hero.maxHp}, MP: ${hero.mp}/${hero.maxMp}, 공격: ${hero.attack}, 방어: ${hero.defense}, 속도: ${hero.speed}`);
  console.log(`${enemy.name} - HP: ${enemy.hp}/${enemy.maxHp}, MP: ${enemy.mp}/${enemy.maxMp}, 공격: ${enemy.attack}, 방어: ${enemy.defense}, 속도: ${enemy.speed}`);
  console.log('\n전투 시작!\n');

  // 턴 큐 설정
  const queue = new TurnQueue();
  queue.addCharacter(hero);
  queue.addCharacter(enemy);

  // 전투 시뮬레이션
  let turnCount = 0;
  const maxTurns = 100;

  while (hero.isAlive() && enemy.isAlive() && turnCount < maxTurns) {
    queue.updateGauges(1);

    let actor = queue.getNextActor();
    while (actor && hero.isAlive() && enemy.isAlive()) {
      turnCount++;
      const target = actor === hero ? enemy : hero;

      // 데미지 계산 (20% 크리티컬 확률)
      const damageResult = calculateDamage({
        attack: actor.attack,
        defense: target.defense,
        criticalRate: 0.2,
      });

      target.takeDamage(damageResult.damage);

      // 전투 로그 출력
      const criticalText = damageResult.isCritical ? ' [크리티컬!]' : '';
      console.log(
        `[턴 ${turnCount}] ${actor.name}의 공격! ` +
        `${target.name}에게 ${damageResult.damage} 데미지!${criticalText} ` +
        `(${target.name} HP: ${target.hp}/${target.maxHp})`
      );

      queue.consumeTurn(actor);
      actor = queue.getNextActor();
    }
  }

  // 결과 출력
  console.log('\n=== 전투 종료 ===');
  if (hero.isAlive()) {
    console.log(`✅ 승리! ${hero.name}의 HP: ${hero.hp}/${hero.maxHp}`);
  } else {
    console.log(`❌ 패배! ${enemy.name}의 HP: ${enemy.hp}/${enemy.maxHp}`);
  }
  console.log(`총 턴 수: ${turnCount}\n`);
}

// 데모 자동 실행
runBattleDemo();
