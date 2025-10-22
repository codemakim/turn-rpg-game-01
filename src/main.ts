import Phaser from 'phaser';
import { BattleScene } from './scenes/BattleScene';

console.log('🎮 Phaser 게임 초기화 중...');

// 반응형 Phaser 게임 설정
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',  // 부모 컨테이너 크기에 맞춤
  height: '100%', // 부모 컨테이너 크기에 맞춤
  parent: 'game-container',
  backgroundColor: '#1a1a2e', // HTML과 배경색 통일
  scene: [BattleScene],
  scale: {
    mode: Phaser.Scale.RESIZE, // 화면 크기 변경에 반응
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,   // 최소 너비 (모바일)
      height: 240   // 최소 높이 (모바일)
    },
    max: {
      width: 2560, // 최대 너비 (울트라와이드)
      height: 1440  // 최대 높이 (울트라와이드)
    }
  },
  render: {
    pixelArt: false, // 픽셀 아트가 아니므로 스무딩 활성화
    antialias: true
  }
};

// Phaser 게임 인스턴스 생성
const game = new Phaser.Game(config);

// 화면 크기 변경 이벤트 리스너
window.addEventListener('resize', () => {
  game.scale.refresh();
});

console.log('🎮 Phaser 게임 시작! (반응형 모드)');
