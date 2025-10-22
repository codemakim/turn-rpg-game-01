import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterUIManager } from '@/ui/managers/CharacterUIManager';
import { Character } from '@/characters/Character';

// Mock Phaser Scene
const mockScene = {
  add: {
    container: vi.fn(() => ({
      setPosition: vi.fn(),
      add: vi.fn(),
    })),
    graphics: vi.fn(() => ({
      fillStyle: vi.fn(),
      fillRect: vi.fn(),
    })),
    text: vi.fn(() => ({
      setOrigin: vi.fn(),
    })),
  },
} as any;

describe('CharacterUIManager', () => {
  let characterUIManager: CharacterUIManager;
  let mockHero: Character;
  let mockEnemy: Character;

  beforeEach(() => {
    characterUIManager = new CharacterUIManager(mockScene);
    mockHero = new Character({
      name: '용사',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 15,
    });
    mockEnemy = new Character({
      name: '슬라임',
      hp: 50,
      attack: 10,
      defense: 5,
      speed: 8,
    });
  });

  describe('캐릭터 UI 생성', () => {
    it('아군 캐릭터 UI가 생성되어야 함', () => {
      const layout = {
        heroPositions: [{ x: 200, y: 150 }],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      characterUIManager.createCharacterUIs([mockHero], [], layout);

      expect(characterUIManager.getCharacterUIs()).toHaveLength(1);
    });

    it('적군 캐릭터 UI가 생성되어야 함', () => {
      const layout = {
        heroPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
        enemyPositions: [{ x: 1080, y: 150 }],
      };

      characterUIManager.createCharacterUIs([], [mockEnemy], layout);

      expect(characterUIManager.getCharacterUIs()).toHaveLength(1);
    });

    it('여러 캐릭터 UI가 생성되어야 함', () => {
      const layout = {
        heroPositions: [{ x: 200, y: 150 }, { x: 200, y: 270 }],
        enemyPositions: [{ x: 1080, y: 150 }, { x: 1080, y: 270 }],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      characterUIManager.createCharacterUIs([mockHero, mockHero], [mockEnemy, mockEnemy], layout);

      expect(characterUIManager.getCharacterUIs()).toHaveLength(4);
    });
  });

  describe('캐릭터 UI 재배치', () => {
    it('레이아웃 변경 시 캐릭터 UI가 재배치되어야 함', () => {
      const initialLayout = {
        heroPositions: [{ x: 200, y: 150 }],
        enemyPositions: [{ x: 1080, y: 150 }],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      const updatedLayout = {
        heroPositions: [{ x: 100, y: 100 }],
        enemyPositions: [{ x: 1180, y: 100 }],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      characterUIManager.createCharacterUIs([mockHero], [mockEnemy], initialLayout);
      characterUIManager.rearrangeLayout(updatedLayout);

      expect(characterUIManager.getCharacterUIs()).toHaveLength(2);
    });
  });

  describe('캐릭터 UI 정리', () => {
    it('기존 캐릭터 UI가 정리되어야 함', () => {
      const layout = {
        heroPositions: [{ x: 200, y: 150 }],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      characterUIManager.createCharacterUIs([mockHero], [], layout);
      expect(characterUIManager.getCharacterUIs()).toHaveLength(1);

      characterUIManager.createCharacterUIs([mockHero], [], layout);
      expect(characterUIManager.getCharacterUIs()).toHaveLength(1);
    });
  });
});
