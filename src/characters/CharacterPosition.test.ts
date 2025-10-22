import { describe, it, expect, beforeEach } from 'vitest';
import { Character } from './Character';

describe('Character Position System', () => {
  let character: Character;

  beforeEach(() => {
    character = new Character({
      name: '용사',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 15
    });
  });

  describe('기본 위치 속성', () => {
    it('Character는 기본적으로 position 속성을 가져야 한다', () => {
      expect(character.position).toBeDefined();
      expect(character.position.x).toBe(0);
      expect(character.position.y).toBe(0);
    });

    it('position은 { x: number; y: number } 형태여야 한다', () => {
      expect(typeof character.position.x).toBe('number');
      expect(typeof character.position.y).toBe('number');
    });
  });

  describe('위치 설정 및 업데이트', () => {
    it('setPosition 메서드로 위치를 설정할 수 있어야 한다', () => {
      character.setPosition(100, 200);

      expect(character.position.x).toBe(100);
      expect(character.position.y).toBe(200);
    });

    it('setPosition은 객체 형태로도 설정할 수 있어야 한다', () => {
      character.setPosition({ x: 300, y: 400 });

      expect(character.position.x).toBe(300);
      expect(character.position.y).toBe(400);
    });

    it('위치를 여러 번 변경할 수 있어야 한다', () => {
      character.setPosition(100, 200);
      character.setPosition(500, 600);

      expect(character.position.x).toBe(500);
      expect(character.position.y).toBe(600);
    });
  });

  describe('위치 정보 조회', () => {
    it('getPosition 메서드로 현재 위치를 조회할 수 있어야 한다', () => {
      character.setPosition(150, 250);
      const position = character.getPosition();

      expect(position.x).toBe(150);
      expect(position.y).toBe(250);
    });

    it('getPosition은 position 속성과 동일한 값을 반환해야 한다', () => {
      character.setPosition(200, 300);
      const position = character.getPosition();

      expect(position).toEqual(character.position);
    });
  });

  describe('위치 초기화', () => {
    it('resetPosition 메서드로 위치를 초기화할 수 있어야 한다', () => {
      character.setPosition(100, 200);
      character.resetPosition();

      expect(character.position.x).toBe(0);
      expect(character.position.y).toBe(0);
    });
  });

  describe('위치 유효성 검사', () => {
    it('음수 위치도 설정할 수 있어야 한다', () => {
      character.setPosition(-100, -200);

      expect(character.position.x).toBe(-100);
      expect(character.position.y).toBe(-200);
    });

    it('소수점 위치도 설정할 수 있어야 한다', () => {
      character.setPosition(100.5, 200.7);

      expect(character.position.x).toBe(100.5);
      expect(character.position.y).toBe(200.7);
    });
  });

  describe('위치 기반 거리 계산', () => {
    it('다른 캐릭터와의 거리를 계산할 수 있어야 한다', () => {
      const character1 = new Character({
        name: '용사1',
        hp: 100,
        attack: 20,
        defense: 10,
        speed: 15
      });
      const character2 = new Character({
        name: '용사2',
        hp: 100,
        attack: 20,
        defense: 10,
        speed: 15
      });

      character1.setPosition(0, 0);
      character2.setPosition(3, 4);

      const distance = character1.getDistanceTo(character2);
      expect(distance).toBe(5); // 3-4-5 직각삼각형
    });

    it('같은 위치의 캐릭터와의 거리는 0이어야 한다', () => {
      const character1 = new Character({
        name: '용사1',
        hp: 100,
        attack: 20,
        defense: 10,
        speed: 15
      });
      const character2 = new Character({
        name: '용사2',
        hp: 100,
        attack: 20,
        defense: 10,
        speed: 15
      });

      character1.setPosition(100, 200);
      character2.setPosition(100, 200);

      const distance = character1.getDistanceTo(character2);
      expect(distance).toBe(0);
    });
  });
});
