# 턴제 RPG 게임 코드 가이드

## 🎯 이 문서의 목적

이 문서는 턴제 RPG 게임의 코드 구조를 **초보자도 이해할 수 있도록** 자세히 설명합니다. Phaser를 처음 접하는 개발자도 이 가이드를 보고 게임을 수정하고 확장할 수 있도록 작성되었습니다.

---

## 📚 목차

1. [Phaser 기초 개념](#1-phaser-기초-개념)
2. [게임 시작 과정](#2-게임-시작-과정)
3. [핵심 시스템 분석](#3-핵심-시스템-분석)
4. [UI 시스템 이해](#4-ui-시스템-이해)
5. [전투 시스템 흐름](#5-전투-시스템-흐름)
6. [개발 가이드](#6-개발-가이드)

---

## 1. Phaser 기초 개념

### 1.1 Phaser란?

**Phaser**는 웹 브라우저에서 2D 게임을 만들 수 있게 해주는 JavaScript 라이브러리입니다.

```javascript
// Phaser의 핵심 개념들
- Scene: 게임의 각 화면 (타이틀, 전투, 인벤토리 등)
- GameObject: 화면에 표시되는 모든 것 (텍스트, 도형, 이미지 등)
- Container: 여러 GameObject를 묶는 그룹
- Tween: 애니메이션 효과
- Input: 마우스, 키보드, 터치 입력 처리
```

### 1.2 Phaser 객체 생성 방법

```typescript
// 1. 텍스트 생성
const text = scene.add.text(x, y, 'Hello World', {
  fontSize: '16px',
  color: '#ffffff'
});

// 2. 도형 생성
const graphics = scene.add.graphics();
graphics.fillStyle(0xff0000); // 빨간색
graphics.fillRect(x, y, width, height);

// 3. 컨테이너 생성
const container = scene.add.container(x, y);
container.add(text);
container.add(graphics);
```

### 1.3 Phaser 생명주기

```typescript
class MyScene extends Phaser.Scene {
  // 1. 씬 생성 시 (한 번만 실행)
  create() {
    // 게임 객체들 생성
  }
  
  // 2. 매 프레임마다 실행 (60fps)
  update(time, delta) {
    // 게임 로직 처리
  }
  
  // 3. 씬 종료 시
  destroy() {
    // 리소스 정리
  }
}
```

---

## 2. 게임 시작 과정

### 2.1 main.ts - 게임 진입점

```typescript
// src/main.ts
import Phaser from 'phaser';
import { BattleScene } from './scenes/BattleScene';

// Phaser 게임 설정
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,           // WebGL 또는 Canvas 자동 선택
  width: 1280,                 // 화면 너비 (16:9 비율)
  height: 720,                 // 화면 높이 (16:9 비율)
  parent: 'game-container',    // HTML의 어느 요소에 게임을 넣을지
  backgroundColor: '#1a1a2e',   // 배경색
  scene: [BattleScene],        // 사용할 씬들
  scale: {
    mode: Phaser.Scale.NONE,   // 스케일링 비활성화
    autoCenter: Phaser.Scale.CENTER_BOTH, // 화면 중앙 정렬
  },
};

// 게임 시작!
const game = new Phaser.Game(config);
```

**설명:**

- `width: 1280, height: 720`: PC 게임 표준 16:9 비율
- `scene: [BattleScene]`: 전투 씬만 사용 (나중에 타이틀, 인벤토리 등 추가 가능)
- `new Phaser.Game(config)`: 실제로 게임을 시작하는 코드

### 2.2 게임 실행 흐름

```text
1. main.ts 실행
   ↓
2. Phaser.Game 생성
   ↓
3. BattleScene.create() 자동 호출
   ↓
4. BattleScene.update() 매 프레임 호출 (60fps)
```

---

## 3. 핵심 시스템 분석

### 3.1 Character.ts - 캐릭터 시스템

```typescript
// src/characters/Character.ts
export class Character {
  public name: string;        // 캐릭터 이름
  public hp: number;          // 현재 체력
  public maxHp: number;       // 최대 체력
  public mp: number;          // 현재 마나
  public maxMp: number;       // 최대 마나
  public attack: number;       // 공격력
  public defense: number;     // 방어력
  public speed: number;       // 속도 (턴 순서 결정)
  public skills: Skill[];     // 보유 스킬들
  public isHero: boolean;     // 아군인지 적인지

  // 데미지를 받는 메서드
  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }
  
  // 체력을 회복하는 메서드
  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}
```

**캐릭터 시스템의 특징:**

- **아군과 적 모두 같은 클래스 사용**: `isHero` 플래그로 구분
- **HP/MP 관리**: 체력과 마나의 현재값과 최대값 관리
- **스탯 시스템**: 공격력, 방어력, 속도로 전투 계산
- **스킬 시스템**: 각 캐릭터가 가진 특별한 기술들

### 3.2 BattleController.ts - 전투 로직

```typescript
// src/battle/BattleController.ts
export class BattleController {
  private heroes: Character[];     // 아군 캐릭터들
  private enemies: Character[];    // 적 캐릭터들
  private turnQueue: TurnQueue;    // 턴 순서 관리

  // 공격 실행
  executeAttack(attacker: Character, target: Character): void {
    const damage = calculateDamage(attacker, target);
    target.takeDamage(damage);
    
    // 이벤트 발생 (UI에 알림)
    this.emit({
      type: 'damage',
      actor: attacker,
      target: target,
      message: `${attacker.name}이(가) ${target.name}에게 ${damage} 데미지!`,
      data: { damage, isCritical: false }
    });
  }
}
```

**전투 시스템의 핵심:**

- **턴 기반**: 한 번에 한 캐릭터만 행동
- **이벤트 시스템**: 전투 상황을 UI에 실시간 알림
- **데미지 계산**: 공격력, 방어력, 크리티컬 등을 고려한 복잡한 계산

### 3.3 TurnQueue.ts - 턴 순서 관리

```typescript
// src/battle/TurnQueue.ts
export class TurnQueue {
  private characters: Character[] = [];
  private gauges: Map<Character, number> = new Map();

  // 매 프레임마다 턴 게이지 업데이트
  updateGauges(deltaTime: number): Character | null {
    // 모든 캐릭터의 게이지를 속도만큼 증가
    for (const character of this.characters) {
      const currentGauge = this.gauges.get(character) || 0;
      const newGauge = currentGauge + (character.speed * deltaTime);
      this.gauges.set(character, newGauge);
      
      // 100에 도달하면 행동 가능
      if (newGauge >= 100) {
        return character;
      }
    }
    return null; // 아직 행동할 캐릭터 없음
  }
}
```

**턴 시스템의 특징:**

- **속도 기반**: 빠른 캐릭터가 더 자주 행동
- **게이지 시스템**: 0에서 100까지 채워지면 행동 가능
- **즉시 점프**: 아무도 100에 도달할 수 없으면 가장 빠른 캐릭터까지 한번에 점프

---

## 4. UI 시스템 이해

### 4.1 CharacterUI.ts - 캐릭터 화면 표시

```typescript
// src/ui/components/CharacterUI.ts
export class CharacterUI {
  private container: Phaser.GameObjects.Container;  // 메인 컨테이너
  private graphics: Phaser.GameObjects.Graphics;   // 캐릭터 도형
  private statusText: Phaser.GameObjects.Text;      // 이름/상태 텍스트
  private hpBar: StatusBar;                         // HP 바
  private mpBar: StatusBar;                         // MP 바
  private turnIndicator: TurnIndicator;             // 턴 표시 삼각형

  constructor(scene: Phaser.Scene, character: Character, x: number, y: number) {
    // 1. 메인 컨테이너 생성
    this.container = scene.add.container(x, y);
    
    // 2. 캐릭터 도형 생성 (원형)
    this.graphics = scene.add.graphics();
    this.createCharacterGraphics();
    
    // 3. HP/MP 바 생성
    this.hpBar = new StatusBar(scene, 0, 40, 100, 10, '#ff0000');
    this.mpBar = new StatusBar(scene, 0, 55, 100, 10, '#0000ff');
    
    // 4. 모든 것을 컨테이너에 추가
    this.container.add(this.graphics);
    this.container.add(this.hpBar.graphics);
    this.container.add(this.mpBar.graphics);
  }
}
```

**CharacterUI의 구성 요소:**

- **Container**: 모든 UI 요소를 묶는 그룹
- **Graphics**: 캐릭터를 나타내는 원형 도형
- **StatusBar**: HP/MP를 시각적으로 표시하는 바
- **TurnIndicator**: 현재 행동할 캐릭터에 표시되는 삼각형

### 4.2 Button.ts - 버튼 시스템

```typescript
// src/ui/components/Button.ts
export class Button {
  private textObject: Phaser.GameObjects.Text;
  private buttonId: string;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, buttonId: string) {
    // 1. 버튼 텍스트 생성
    this.textObject = scene.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#2196F3',
      padding: { x: 30, y: 15 }
    });
    
    // 2. 클릭 가능하게 설정
    this.textObject.setInteractive({ useHandCursor: true });
    
    // 3. 클릭 이벤트 등록
    this.textObject.on('pointerdown', () => {
      eventBus.emit('battle:attack', { buttonId: this.buttonId });
    });
  }
}
```

**버튼 시스템의 특징:**

- **이벤트 기반**: 클릭 시 EventBus를 통해 이벤트 발생
- **재사용 가능**: 같은 버튼 클래스를 공격, 스킬 등에 사용
- **시각적 피드백**: 호버 시 커서 변경, 클릭 시 색상 변경

### 4.3 EventBus.ts - 이벤트 시스템

```typescript
// src/core/EventBus.ts
class EventBus {
  private events: Map<string, Function[]> = new Map();

  // 이벤트 발생
  emit(eventName: string, data?: any): void {
    const listeners = this.events.get(eventName) || [];
    listeners.forEach(callback => callback(data));
  }

  // 이벤트 리스너 등록
  on(eventName: string, callback: Function): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(callback);
  }
}

export const eventBus = new EventBus();
```

**이벤트 시스템의 장점:**

- **느슨한 결합**: UI와 게임 로직이 직접 연결되지 않음
- **확장성**: 새로운 기능 추가 시 기존 코드 수정 불필요
- **디버깅**: 모든 이벤트를 중앙에서 관리

---

## 5. 전투 시스템 흐름

### 5.1 전투 시작 과정

```text
1. BattleScene.create() 실행
   ↓
2. 캐릭터들 생성 (용사, 슬라임)
   ↓
3. UI 생성 (캐릭터 표시, 버튼)
   ↓
4. 이벤트 리스너 설정
   ↓
5. 첫 번째 턴 시작
```

### 5.2 턴 진행 과정

```text
1. TurnQueue.updateGauges() - 턴 게이지 업데이트
   ↓
2. 게이지 100 도달한 캐릭터 확인
   ↓
3. 아군이면 → 버튼 활성화, 플레이어 입력 대기
   ↓
4. 적이면 → AI가 자동으로 행동 결정
   ↓
5. 행동 실행 → 데미지 계산 → 이벤트 발생
   ↓
6. UI 업데이트 (HP 바, 애니메이션)
   ↓
7. 다음 턴으로
```

### 5.3 플레이어 행동 처리

```text
1. 플레이어가 "공격" 버튼 클릭
   ↓
2. Button.ts에서 'battle:attack' 이벤트 발생
   ↓
3. BattleInputHandler.ts가 이벤트 수신
   ↓
4. BattleController.executeAttack() 호출
   ↓
5. 데미지 계산 및 적용
   ↓
6. 'damage' 이벤트 발생
   ↓
7. UI에서 데미지 애니메이션 표시
```

---

## 6. 개발 가이드

### 6.1 새로운 캐릭터 추가하기

```typescript
// src/scenes/managers/BattleCharacterFactory.ts
export class BattleCharacterFactory {
  createEnemies(): Character[] {
    return [
      new Character({
        name: '슬라임',
        hp: 50,
        attack: 8,
        defense: 2,
        speed: 10,
        isHero: false
      }),
      // 새로운 적 추가
      new Character({
        name: '고블린',
        hp: 80,
        attack: 12,
        defense: 5,
        speed: 15,
        isHero: false
      })
    ];
  }
}
```

### 6.2 새로운 스킬 추가하기

```typescript
// src/battle/Skill.ts
export class Skill {
  constructor(
    public name: string,
    public mpCost: number,
    public damage: number,
    public targetType: 'single' | 'all' | 'self'
  ) {}
}

// 새로운 스킬 생성
const fireball = new Skill('파이어볼', 10, 25, 'single');
const heal = new Skill('힐', 5, 0, 'self'); // 회복 스킬
```

### 6.3 새로운 씬 추가하기

```typescript
// src/scenes/TitleScene.ts
export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // 타이틀 화면 UI 생성
    this.add.text(640, 200, '턴제 RPG', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 시작 버튼
    const startButton = this.add.text(640, 400, '게임 시작', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#2196F3'
    }).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('BattleScene');
    });
  }
}
```

### 6.4 파일 수정 시 주의사항

1. **의존성 확인**: 한 파일을 수정하면 다른 파일에 영향
2. **이벤트 순서**: 초기화 순서가 중요 (UI → 이벤트 → 로직)
3. **메모리 관리**: 사용하지 않는 객체는 `destroy()` 호출
4. **타입 안전성**: TypeScript 타입을 제대로 사용

### 6.5 디버깅 팁

```typescript
// 1. 콘솔 로그 활용
console.log('현재 턴:', currentActor?.name);
console.log('캐릭터 HP:', character.hp);

// 2. 이벤트 추적
eventBus.on('battle:attack', (data) => {
  console.log('공격 이벤트:', data);
});

// 3. UI 상태 확인
console.log('버튼 활성화:', button.isEnabled);
console.log('캐릭터 위치:', characterUI.position);
```

---

## 🚀 다음 단계

이제 이 가이드를 바탕으로 다음과 같은 확장이 가능합니다:

1. **새로운 씬**: 타이틀 화면, 인벤토리, 상점
2. **더 많은 캐릭터**: 동료, 다양한 적들
3. **아이템 시스템**: 무기, 방어구, 소모품
4. **사운드**: 효과음, 배경음악
5. **애니메이션**: 더 화려한 전투 효과

코드에 대한 질문이 있으면 언제든 물어보세요! 🎮
