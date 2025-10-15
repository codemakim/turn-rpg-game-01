import './style.css';
import Phaser from 'phaser';
import { PhaserBattleScene } from './scenes/PhaserBattleScene';

console.log('🎮 Phaser 게임 초기화 중...');

// Phaser 게임 설정
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#0f3460',
  scene: [PhaserBattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Phaser 게임 인스턴스 생성
const game = new Phaser.Game(config);

console.log('🎮 Phaser 게임 시작!');
