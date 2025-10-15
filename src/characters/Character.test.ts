import { describe, it, expect } from 'vitest';
import { Character } from './Character';

describe('Character', () => {
  describe('생성', () => {
    it('초기 스탯으로 캐릭터를 생성해야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 100,
        mp: 50,
        attack: 20,
        defense: 10,
        speed: 15,
      });

      expect(char.name).toBe('Hero');
      expect(char.hp).toBe(100);
      expect(char.maxHp).toBe(100);
      expect(char.mp).toBe(50);
      expect(char.maxMp).toBe(50);
      expect(char.attack).toBe(20);
      expect(char.defense).toBe(10);
      expect(char.speed).toBe(15);
    });

    it('maxHp가 지정되지 않으면 hp와 같아야 함', () => {
      const char = new Character({
        name: 'Warrior',
        hp: 150,
        attack: 25,
        defense: 15,
      });

      expect(char.hp).toBe(150);
      expect(char.maxHp).toBe(150);
    });

    it('maxMp가 지정되지 않으면 mp와 같아야 함', () => {
      const char = new Character({
        name: 'Mage',
        hp: 80,
        mp: 100,
        attack: 15,
        defense: 5,
      });

      expect(char.mp).toBe(100);
      expect(char.maxMp).toBe(100);
    });

    it('speed가 지정되지 않으면 기본값 10이어야 함', () => {
      const char = new Character({
        name: 'Slime',
        hp: 50,
        attack: 5,
        defense: 3,
      });

      expect(char.speed).toBe(10);
    });
  });

  describe('데미지 받기', () => {
    it('데미지를 받으면 HP가 감소해야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 100,
        attack: 20,
        defense: 10,
      });

      char.takeDamage(30);
      expect(char.hp).toBe(70);
    });

    it('HP가 0 이하로 내려가지 않아야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 100,
        attack: 20,
        defense: 10,
      });

      char.takeDamage(150);
      expect(char.hp).toBe(0);
    });
  });

  describe('회복', () => {
    it('회복하면 HP가 증가해야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 50,
        maxHp: 100,
        attack: 20,
        defense: 10,
      });

      char.heal(30);
      expect(char.hp).toBe(80);
    });

    it('HP가 maxHp를 초과하지 않아야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 80,
        maxHp: 100,
        attack: 20,
        defense: 10,
      });

      char.heal(50);
      expect(char.hp).toBe(100);
    });
  });

  describe('생존 상태', () => {
    it('HP가 0보다 크면 살아있어야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 100,
        attack: 20,
        defense: 10,
      });

      expect(char.isAlive()).toBe(true);
    });

    it('HP가 0이면 죽은 상태여야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 100,
        attack: 20,
        defense: 10,
      });

      char.takeDamage(100);
      expect(char.hp).toBe(0);
      expect(char.isAlive()).toBe(false);
    });

    it('HP가 0 미만이면 죽은 상태여야 함', () => {
      const char = new Character({
        name: 'Hero',
        hp: 50,
        attack: 20,
        defense: 10,
      });

      char.takeDamage(100);
      expect(char.hp).toBe(0);
      expect(char.isAlive()).toBe(false);
    });
  });
});

