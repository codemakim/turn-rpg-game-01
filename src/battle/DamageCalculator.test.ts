import { describe, it, expect } from 'vitest';
import { calculateDamage } from './DamageCalculator';

describe('DamageCalculator', () => {
  describe('기본 데미지 계산', () => {
    it('공격력 - 방어력으로 데미지를 계산해야 함', () => {
      const result = calculateDamage({
        attack: 100,
        defense: 30,
      });

      expect(result.damage).toBe(70);
      expect(result.isCritical).toBe(false);
    });

    it('스킬 배율이 적용되어야 함', () => {
      const result = calculateDamage({
        attack: 50,
        defense: 10,
        skillPower: 2.0, // 2배 데미지
      });

      // (50 * 2.0) - 10 = 90
      expect(result.damage).toBe(90);
    });

    it('방어력이 공격력보다 높아도 최소 1의 데미지는 들어가야 함', () => {
      const result = calculateDamage({
        attack: 10,
        defense: 50,
      });

      expect(result.damage).toBe(1);
    });

    it('스킬 배율이 없으면 기본값 1.0을 사용해야 함', () => {
      const result = calculateDamage({
        attack: 60,
        defense: 20,
      });

      // (60 * 1.0) - 20 = 40
      expect(result.damage).toBe(40);
    });
  });

  describe('크리티컬', () => {
    it('크리티컬이 발생하면 데미지가 1.5배가 되어야 함', () => {
      const result = calculateDamage({
        attack: 100,
        defense: 30,
        isCritical: true,
      });

      // (100 - 30) * 1.5 = 105
      expect(result.damage).toBe(105);
      expect(result.isCritical).toBe(true);
    });

    it('크리티컬 확률이 0이면 크리티컬이 발생하지 않아야 함', () => {
      // 여러 번 시도해도 크리티컬이 발생하지 않아야 함
      for (let i = 0; i < 10; i++) {
        const result = calculateDamage({
          attack: 100,
          defense: 30,
          criticalRate: 0,
        });

        expect(result.isCritical).toBe(false);
      }
    });

    it('크리티컬 확률이 1이면 항상 크리티컬이 발생해야 함', () => {
      // 여러 번 시도해도 모두 크리티컬이어야 함
      for (let i = 0; i < 10; i++) {
        const result = calculateDamage({
          attack: 100,
          defense: 30,
          criticalRate: 1,
        });

        expect(result.isCritical).toBe(true);
        expect(result.damage).toBe(105); // (100 - 30) * 1.5
      }
    });

    it('스킬 배율과 크리티컬이 함께 적용되어야 함', () => {
      const result = calculateDamage({
        attack: 50,
        defense: 10,
        skillPower: 2.0,
        isCritical: true,
      });

      // ((50 * 2.0) - 10) * 1.5 = 135
      expect(result.damage).toBe(135);
      expect(result.isCritical).toBe(true);
    });
  });

  describe('경계 케이스', () => {
    it('공격력이 0이어도 최소 1의 데미지는 들어가야 함', () => {
      const result = calculateDamage({
        attack: 0,
        defense: 10,
      });

      expect(result.damage).toBe(1);
    });

    it('방어력이 0이면 공격력 전체가 데미지가 되어야 함', () => {
      const result = calculateDamage({
        attack: 75,
        defense: 0,
      });

      expect(result.damage).toBe(75);
    });

    it('음수 값이 입력되어도 정상 동작해야 함', () => {
      const result = calculateDamage({
        attack: -10,
        defense: 5,
      });

      expect(result.damage).toBe(1); // 최소 데미지 보장
    });
  });
});

