import Phaser from 'phaser';
import { BattleScene } from './scenes/BattleScene';

console.log('🎮 Phaser 게임 초기화 중...');

// Phaser 게임 설정 (PC 게임 표준 16:9 비율)
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,  // 16:9 비율
  height: 720,  // 16:9 비율
  parent: 'game-container',
  backgroundColor: '#1a1a2e', // HTML과 배경색 통일
  scene: [BattleScene],
  scale: {
    mode: Phaser.Scale.NONE, // 스케일링 비활성화로 정확한 크기 보장
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Phaser 게임 인스턴스 생성
const game = new Phaser.Game(config);

console.log('🎮 Phaser 게임 시작!');
