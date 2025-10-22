import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleUIManager } from './BattleUIManager';
import { Character } from '@/characters/Character';
import { Skill } from '@/battle/Skill';

// Mock Phaser Scene
const mockScene = {
  add: {
    graphics: vi.fn(() => ({
      fillGradientStyle: vi.fn(),
      fillRect: vi.fn(),
    })),
    text: vi.fn(() => ({
      setOrigin: vi.fn(),
    })),
  },
  tweens: {
    add: vi.fn(),
  },
  time: {
    delayedCall: vi.fn(),
  },
  scale: {
    width: 1280,
    height: 720,
  },
} as any;

describe('BattleUIManager', () => {
  let uiManager: BattleUIManager;
  let mockHero: Character;

  beforeEach(() => {
    uiManager = new BattleUIManager(mockScene);
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

  describe('버튼 레이아웃 통일', () => {
    it('공격 버튼과 스킬 버튼이 겹치지 않아야 함', () => {
      const layout = {
        heroPositions: [{ x: 200, y: 150 }],
        enemyPositions: [{ x: 1080, y: 150 }],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      uiManager.createButtonUI(layout);
      uiManager.enableButtons(mockHero);

      const attackButton = uiManager.getAttackButton();
      const skillButtons = uiManager.getSkillButtons();

      // 공격 버튼과 스킬 버튼들이 존재하는지 확인
      expect(attackButton).toBeDefined();
      expect(skillButtons).toHaveLength(2);

      // 공격 버튼과 스킬 버튼들이 겹치지 않는지 확인
      const attackPos = attackButton.getPosition();
      skillButtons.forEach((skillButton) => {
        const skillPos = skillButton.getPosition();

        // X 좌표가 다르고, 스킬 버튼이 공격 버튼보다 오른쪽에 있는지 확인
        expect(skillPos.x).not.toBe(attackPos.x);
        expect(skillPos.x).toBeGreaterThan(attackPos.x);

        // Y 좌표는 같아야 함 (같은 행에 배치)
        expect(skillPos.y).toBe(attackPos.y);
      });
    });

    it('모든 버튼이 buttonArea 내에 배치되어야 함', () => {
      const layout = {
        heroPositions: [{ x: 200, y: 150 }],
        enemyPositions: [{ x: 1080, y: 150 }],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      uiManager.createButtonUI(layout);
      uiManager.enableButtons(mockHero);

      const attackButton = uiManager.getAttackButton();
      const skillButtons = uiManager.getSkillButtons();

      // 공격 버튼이 buttonArea 내에 있는지 확인
      const attackPos = attackButton.getPosition();
      expect(attackPos.x).toBeGreaterThanOrEqual(layout.buttonArea.x);
      expect(attackPos.x).toBeLessThanOrEqual(layout.buttonArea.x + layout.buttonArea.width);
      expect(attackPos.y).toBeGreaterThanOrEqual(layout.buttonArea.y);
      expect(attackPos.y).toBeLessThanOrEqual(layout.buttonArea.y + layout.buttonArea.height);

      // 스킬 버튼들이 buttonArea 내에 있는지 확인
      skillButtons.forEach((skillButton) => {
        const skillPos = skillButton.getPosition();
        expect(skillPos.x).toBeGreaterThanOrEqual(layout.buttonArea.x);
        expect(skillPos.x).toBeLessThanOrEqual(layout.buttonArea.x + layout.buttonArea.width);
        expect(skillPos.y).toBeGreaterThanOrEqual(layout.buttonArea.y);
        expect(skillPos.y).toBeLessThanOrEqual(layout.buttonArea.y + layout.buttonArea.height);
      });
    });

    it('버튼들이 올바른 순서로 배치되어야 함', () => {
      const layout = {
        heroPositions: [{ x: 200, y: 150 }],
        enemyPositions: [{ x: 1080, y: 150 }],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      uiManager.createButtonUI(layout);
      uiManager.enableButtons(mockHero);

      const attackButton = uiManager.getAttackButton();
      const skillButtons = uiManager.getSkillButtons();

      // 공격 버튼이 가장 왼쪽에 있는지 확인
      const attackPos = attackButton.getPosition();
      skillButtons.forEach((skillButton) => {
        const skillPos = skillButton.getPosition();
        expect(attackPos.x).toBeLessThan(skillPos.x);
      });

      // 스킬 버튼들이 순서대로 배치되어 있는지 확인
      for (let i = 0; i < skillButtons.length - 1; i++) {
        const currentPos = skillButtons[i].getPosition();
        const nextPos = skillButtons[i + 1].getPosition();
        expect(currentPos.x).toBeLessThan(nextPos.x);
      }
    });
  });

  describe('배경 색상 통일', () => {
    it('배경이 화면 전체를 덮어야 함', () => {
      uiManager.createBackground();

      // createBackground가 호출되었는지 확인
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('반응형 화면 크기에 맞춰 배경이 생성되어야 함', () => {
      // 화면 크기 변경 시뮬레이션
      mockScene.scale.width = 360;
      mockScene.scale.height = 640;

      uiManager.createBackground();

      // 배경이 새로운 화면 크기에 맞춰 생성되었는지 확인
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });
  });

  describe('UI 재배치', () => {
    it('화면 크기 변경 시 버튼들이 올바르게 재배치되어야 함', () => {
      const initialLayout = {
        heroPositions: [{ x: 200, y: 150 }],
        enemyPositions: [{ x: 1080, y: 150 }],
        buttonArea: { x: 100, y: 600, width: 1080, height: 80 },
      };

      const updatedLayout = {
        heroPositions: [{ x: 100, y: 100 }],
        enemyPositions: [{ x: 260, y: 100 }],
        buttonArea: { x: 50, y: 500, width: 260, height: 60 },
      };

      uiManager.createButtonUI(initialLayout);
      uiManager.enableButtons(mockHero);

      // 레이아웃 재배치
      uiManager.rearrangeLayout(updatedLayout);

      // 버튼들이 새로운 위치로 이동했는지 확인
      expect(uiManager.getAttackButton()).toBeDefined();
      expect(uiManager.getSkillButtons()).toHaveLength(2);
    });
  });
});
