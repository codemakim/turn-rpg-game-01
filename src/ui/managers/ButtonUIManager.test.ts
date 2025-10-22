import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ButtonUIManager } from '@/ui/managers/ButtonUIManager';
import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';

// Mock Phaser Scene
const mockScene = {
  add: {
    container: vi.fn(() => ({
      setPosition: vi.fn(),
      add: vi.fn(),
    })),
  },
} as any;

describe('ButtonUIManager', () => {
  let buttonUIManager: ButtonUIManager;
  let mockHero: Character;

  beforeEach(() => {
    buttonUIManager = new ButtonUIManager(mockScene);
    mockHero = new Character({
      name: '용사',
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 15,
      skills: [
        new Skill({
          id: 'fireball',
          name: '파이어볼',
          description: '적에게 화염 데미지를 입힙니다',
          mpCost: 10,
          targetType: 'single-enemy',
          effects: [{ type: 'damage', value: 20 }]
        }),
        new Skill({
          id: 'heal',
          name: '힐',
          description: '아군의 체력을 회복합니다',
          mpCost: 5,
          targetType: 'single-ally',
          effects: [{ type: 'heal', value: 15 }]
        }),
      ],
    });
  });

  describe('버튼 UI 생성', () => {
    it('버튼 그룹이 생성되어야 함', () => {
      const layout = {
        heroPositions: [],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      buttonUIManager.createButtonUI(layout);

      expect(buttonUIManager.getButtonGroup()).toBeDefined();
    });

    it('공격 버튼이 생성되어야 함', () => {
      const layout = {
        heroPositions: [],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      buttonUIManager.createButtonUI(layout);

      expect(buttonUIManager.getAttackButton()).toBeDefined();
    });
  });

  describe('버튼 활성화', () => {
    it('캐릭터의 스킬에 따라 스킬 버튼이 생성되어야 함', () => {
      const layout = {
        heroPositions: [],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      buttonUIManager.createButtonUI(layout);
      buttonUIManager.enableButtons(mockHero);

      expect(buttonUIManager.getSkillButtons()).toHaveLength(2);
    });

    it('스킬 버튼들이 겹치지 않아야 함', () => {
      const layout = {
        heroPositions: [],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      buttonUIManager.createButtonUI(layout);
      buttonUIManager.enableButtons(mockHero);

      const skillButtons = buttonUIManager.getSkillButtons();
      const attackButton = buttonUIManager.getAttackButton();

      // 공격 버튼과 스킬 버튼들이 겹치지 않는지 확인
      const attackPos = attackButton.getPosition();
      skillButtons.forEach((skillButton: any) => {
        const skillPos = skillButton.getPosition();
        expect(skillPos.x).not.toBe(attackPos.x);
        expect(skillPos.x).toBeGreaterThan(attackPos.x);
        expect(skillPos.y).toBe(attackPos.y);
      });
    });
  });

  describe('버튼 비활성화', () => {
    it('모든 버튼이 비활성화되어야 함', () => {
      const layout = {
        heroPositions: [],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      buttonUIManager.createButtonUI(layout);
      buttonUIManager.enableButtons(mockHero);
      expect(buttonUIManager.getSkillButtons()).toHaveLength(2);

      buttonUIManager.disableAllButtons();
      expect(buttonUIManager.getSkillButtons()).toHaveLength(0);
    });
  });

  describe('버튼 재배치', () => {
    it('레이아웃 변경 시 버튼이 재배치되어야 함', () => {
      const initialLayout = {
        heroPositions: [],
        enemyPositions: [],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      const updatedLayout = {
        heroPositions: [],
        enemyPositions: [],
        buttonArea: { x: 50, y: 500, width: 1180, height: 100 },
      };

      buttonUIManager.createButtonUI(initialLayout);
      buttonUIManager.enableButtons(mockHero);
      buttonUIManager.rearrangeLayout(updatedLayout);

      expect(buttonUIManager.getButtonGroup()).toBeDefined();
    });
  });
});
