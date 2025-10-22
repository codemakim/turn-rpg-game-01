# 턴제 RPG 게임 아키텍처 가이드

## 🎮 게임 시스템 구조 한눈에 보기

### 📁 핵심 파일 구조 (리팩토링 완료)

```text
src/
├── main.ts                    ⭐ Phaser 게임 시작점
├── characters/
│   └── Character.ts          👤 캐릭터 (HP, MP, 스탯, 스킬)
├── battle/                    # 전투 로직 (Phaser 독립적!)
│   ├── BattleController.ts   🎮 전투 로직 컨트롤러
│   ├── EnemyAI.ts            🤖 적 AI 시스템
│   ├── DamageCalculator.ts   ⚔️ 데미지 계산
│   ├── TurnQueue.ts          ⏱️ 턴 순서 관리
│   └── Skill.ts              ✨ 스킬 시스템
├── scenes/                    # Phaser 씬 (리팩토링됨)
│   ├── BattleScene.ts        🎬 전투 씬 (오케스트레이션)
│   └── managers/             # 전투 씬 매니저들
│       ├── BattleCharacterFactory.ts  🏭 캐릭터 생성
│       ├── BattleLayoutManager.ts     📐 레이아웃 계산
│       ├── BattleUIManager.ts         🖥️ UI 관리
│       └── BattleEventManager.ts      📡 이벤트 처리
├── ui/components/             # UI 컴포넌트들
│   ├── CharacterUI.ts         👤 캐릭터 UI
│   ├── Button.ts             🔘 버튼
│   ├── StatusBar.ts          📊 HP/MP 바
│   └── TurnIndicator.ts      🔺 턴 표시
├── animation/
│   └── AnimationManager.ts   🎬 애니메이션 관리
├── input/
│   └── BattleInputHandler.ts 🎮 입력 처리
└── core/
    └── EventBus.ts          📡 이벤트 버스
```

---

## 🔍 각 파일 역할 상세 설명

### ⭐ main.ts - Phaser 게임 시작점

**역할**: Phaser 게임을 초기화하고 시작하는 진입점

**흐름**:

1. Phaser 게임 설정 정의 (1280x720, BattleScene 시작)
2. Phaser.Game 인스턴스 생성
3. BattleScene 자동 시작

**코드**:

```typescript
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: [BattleScene]
};
new Phaser.Game(config);
```

---

### 🎬 BattleScene.ts - 전투 씬 (리팩토링됨!)

**역할**: 전투 화면의 오케스트레이션만 담당 (545줄 → 109줄로 축소)

**주요 기능**:

- **매니저들 초기화**: 각 전문 매니저들을 생성하고 연결
- **게임 루프 관리**: `update(deltaTime)` 메서드로 프레임 독립적 로직
- **씬 생명주기**: 생성, 업데이트, 파괴 관리

**코드**:

```typescript
export class BattleScene extends Phaser.Scene {
  private controller!: BattleController;
  private uiManager!: BattleUIManager;
  private eventManager!: BattleEventManager;
  
  create(): void {
    this.initializeSystems();
    this.createCharacters();
    this.createUI();
  }
  
  update(_time: number, delta: number): void {
    // 턴 업데이트 및 UI 업데이트
  }
}
```

---

### 🏭 BattleCharacterFactory.ts - 캐릭터 생성 팩토리

**역할**: 캐릭터와 스킬 데이터를 생성하는 전문 클래스

**주요 기능**:

- **아군 캐릭터 생성**: 용사, 마법사 등
- **적 캐릭터 생성**: 슬라임, 고블린 등
- **스킬 데이터 생성**: 각 캐릭터별 스킬 정의

**코드**:

```typescript
export class BattleCharacterFactory {
  createHeroes(): Character[] {
    return [
      new Character({
        name: '용사',
        hp: 100,
        attack: 15,
        defense: 5,
        speed: 12,
        isHero: true,
        skills: this.createHeroSkills()
      })
    ];
  }
}
```

---

### 📐 BattleLayoutManager.ts - 레이아웃 계산

**역할**: UI 요소들의 위치와 크기를 계산하는 순수 계산 클래스

**주요 기능**:

- **캐릭터 위치 계산**: 아군(왼쪽), 적군(오른쪽) 배치
- **버튼 영역 계산**: 하단 버튼들의 위치와 크기
- **화면 크기 관리**: 16:9 비율에 맞는 레이아웃

**코드**:

```typescript
export class BattleLayoutManager {
  calculateLayout(heroes: Character[], enemies: Character[]): LayoutInfo {
    return {
      heroPositions: heroes.map((_, index) => ({ x: 200, y: 150 + index * 120 })),
      enemyPositions: enemies.map((_, index) => ({ x: 1080, y: 150 + index * 120 })),
      buttonArea: { x: 100, y: 600, width: 1080, height: 80 }
    };
  }
}
```

---

### 🖥️ BattleUIManager.ts - UI 관리

**역할**: 모든 UI 요소의 생성, 표시, 숨김을 담당

**주요 기능**:

- **배경 생성**: 그라데이션 배경과 제목
- **캐릭터 UI 생성**: CharacterUI 컴포넌트들 생성
- **버튼 UI 생성**: 공격, 스킬 버튼들 생성
- **UI 업데이트**: HP/MP 바, 턴 표시 등 실시간 업데이트

**코드**:

```typescript
export class BattleUIManager {
  createCharacterUIs(heroes: Character[], enemies: Character[], layout: LayoutInfo): void {
    // 아군 UI 생성
    heroes.forEach((hero, index) => {
      const position = layout.heroPositions[index];
      const characterUI = new CharacterUI(this.scene, hero, position.x, position.y);
      this.characterUIs.push(characterUI);
    });
  }
}
```

---

### 📡 BattleEventManager.ts - 이벤트 처리

**역할**: 전투 이벤트를 수신하고 적절한 매니저에게 위임

**주요 기능**:

- **BattleController 이벤트**: 공격, 스킬, 데미지 이벤트 처리
- **입력 이벤트**: 버튼 클릭, 스킬 선택 등 처리
- **상태 관리**: 현재 행동자, 턴 처리 상태 관리
- **애니메이션 위임**: AnimationManager에 애니메이션 요청

**코드**:

```typescript
export class BattleEventManager {
  private setupEventListeners(): void {
    this.controller.on((event) => {
      if (event.type === 'damage') {
        this.animationManager.showDamageAnimation(position, damage);
      }
    });
  }
}
```

---

### 👤 CharacterUI.ts - 캐릭터 UI 컴포넌트

**역할**: 개별 캐릭터의 모든 UI 요소를 관리하는 조합 컴포넌트

**주요 기능**:

- **캐릭터 그래픽**: 원형 도형으로 캐릭터 표현
- **상태 텍스트**: 이름, HP/MP 수치 표시
- **HP/MP 바**: StatusBar 컴포넌트 사용
- **턴 표시**: TurnIndicator로 현재 행동자 표시

**코드**:

```typescript
export class CharacterUI {
  private container: Phaser.GameObjects.Container;
  private hpBar: StatusBar;
  private mpBar: StatusBar;
  private turnIndicator: TurnIndicator;
  
  updateUI(): void {
    this.hpBar.update(this.character.hp, this.character.maxHp);
    this.mpBar.update(this.character.mp, this.character.maxMp);
  }
}
```

---

### 🔘 Button.ts - 버튼 컴포넌트

**역할**: 클릭 가능한 버튼 UI를 생성하고 이벤트를 발생시키는 컴포넌트

**주요 기능**:

- **시각적 피드백**: 호버 시 커서 변경, 클릭 시 색상 변경
- **이벤트 발생**: EventBus를 통해 이벤트 전달
- **상태 관리**: 활성화/비활성화, 표시/숨김

**코드**:

```typescript
export class Button {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, buttonId: string) {
    this.textObject = scene.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#2196F3'
    }).setInteractive({ useHandCursor: true });
    
    this.textObject.on('pointerdown', () => {
      eventBus.emit('battle:attack', { buttonId });
    });
  }
}
```

---

### 📊 StatusBar.ts - HP/MP 바

**역할**: 캐릭터의 HP나 MP를 시각적으로 표시하는 바 컴포넌트

**주요 기능**:

- **그래픽 렌더링**: Phaser Graphics로 바 그리기
- **비율 계산**: 현재값/최대값 비율로 바 길이 결정
- **색상 관리**: HP는 빨간색, MP는 파란색

**코드**:

```typescript
export class StatusBar {
  update(current: number, max: number): void {
    const ratio = current / max;
    this.graphics.clear();
    this.graphics.fillStyle(this.color);
    this.graphics.fillRect(0, 0, this.width * ratio, this.height);
  }
}
```

---

### 🎮 BattleController.ts - 전투 로직

**역할**: 전투의 핵심 로직을 처리하는 컨트롤러 (Phaser 독립적!)

**주요 기능**:

- **턴 관리**: TurnQueue를 사용한 턴 순서 관리
- **공격/스킬 실행**: 실제 전투 행동 처리
- **이벤트 발생**: 전투 상황을 UI에 알림
- **승부 판정**: 아군/적군 생존 여부 확인

**코드**:

```typescript
export class BattleController {
  executeAttack(attacker: Character, target: Character): void {
    const damage = calculateDamage(attacker, target);
    target.takeDamage(damage);
    
    this.emit({
      type: 'damage',
      actor: attacker,
      target: target,
      message: `${attacker.name}이(가) ${target.name}에게 ${damage} 데미지!`
    });
  }
}
```

---

### ⏱️ TurnQueue.ts - 턴 순서 관리

**역할**: 캐릭터들의 턴 게이지를 관리하고 다음 행동자를 결정

**주요 기능**:

- **게이지 업데이트**: 매 프레임마다 속도만큼 게이지 증가
- **즉시 점프**: 아무도 100에 도달할 수 없으면 가장 빠른 캐릭터까지 점프
- **턴 소모**: 행동 후 게이지 100 차감

**코드**:

```typescript
export class TurnQueue {
  updateGauges(deltaTime: number): Character | null {
    // 모든 캐릭터의 게이지를 속도만큼 증가
    for (const character of this.characters) {
      const newGauge = this.gauges.get(character) + (character.speed * deltaTime);
      this.gauges.set(character, newGauge);
      
      if (newGauge >= 100) {
        return character; // 행동 가능한 캐릭터
      }
    }
    return null;
  }
}
```

---

### 🤖 EnemyAI.ts - 적 AI

**역할**: 적 캐릭터의 행동을 자동으로 결정하는 AI 시스템

**주요 기능**:

- **상황 판단**: HP, MP, 적 상태에 따른 행동 결정
- **스킬 우선순위**: 회복 > 공격 > 방어 순으로 판단
- **타겟 선택**: 가장 약한 아군을 우선 공격

**코드**:

```typescript
export class EnemyAI {
  decideAction(enemy: Character, heroes: Character[]): Action {
    // HP가 30% 이하면 회복 우선
    if (enemy.hp / enemy.maxHp < 0.3) {
      return this.findHealSkill(enemy);
    }
    
    // 공격 스킬 사용
    return this.findAttackSkill(enemy, heroes);
  }
}
```

---

### ⚔️ DamageCalculator.ts - 데미지 계산

**역할**: 공격력, 방어력, 크리티컬 등을 고려한 데미지 계산

**주요 기능**:

- **기본 데미지**: 공격력 - 방어력
- **크리티컬**: 10% 확률로 2배 데미지
- **최소 데미지**: 최소 1 데미지 보장

**코드**:

```typescript
export function calculateDamage(attacker: Character, target: Character): number {
  const baseDamage = Math.max(1, attacker.attack - target.defense);
  const isCritical = Math.random() < 0.1; // 10% 크리티컬 확률
  
  return isCritical ? baseDamage * 2 : baseDamage;
}
```

---

### ✨ Skill.ts - 스킬 시스템

**역할**: 캐릭터의 특별한 기술들을 정의하고 관리

**주요 기능**:

- **MP 소모**: 스킬 사용 시 마나 소모
- **타겟팅**: 단일/전체/자신 타겟팅
- **효과**: 데미지, 회복, 버프 등

**코드**:

```typescript
export class Skill {
  constructor(
    public name: string,
    public mpCost: number,
    public damage: number,
    public targetType: 'single' | 'all' | 'self'
  ) {}
  
  canUse(caster: Character): boolean {
    return caster.mp >= this.mpCost;
  }
}
```

---

### 🎬 AnimationManager.ts - 애니메이션 관리

**역할**: 모든 시각적 애니메이션과 효과를 처리

**주요 기능**:

- **데미지 애니메이션**: 데미지 숫자 표시 및 사라짐
- **회복 애니메이션**: 회복량 숫자 표시
- **캐릭터 흔들림**: 피격 시 흔들림 효과
- **이벤트 기반**: EventBus를 통한 애니메이션 요청

**코드**:

```typescript
export class AnimationManager {
  showDamageAnimation(position: { x: number; y: number }, damage: number): void {
    const damageText = this.scene.add.text(position.x, position.y, `-${damage}`, {
      fontSize: '24px',
      color: '#ff0000'
    });
    
    this.scene.tweens.add({
      targets: damageText,
      y: position.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
  }
}
```

---

### 🎮 BattleInputHandler.ts - 입력 처리

**역할**: 사용자 입력을 받아서 게임 로직으로 변환

**주요 기능**:

- **버튼 클릭**: 공격, 스킬 버튼 클릭 처리
- **타겟 선택**: 적 캐릭터 클릭으로 타겟 선택
- **이벤트 변환**: UI 이벤트를 게임 로직 이벤트로 변환

**코드**:

```typescript
export class BattleInputHandler {
  constructor() {
    eventBus.on('battle:attack', (data) => {
      if (this.currentActor && data.target) {
        this.controller.executeAttack(this.currentActor, data.target);
      }
    });
  }
}
```

---

### 📡 EventBus.ts - 이벤트 버스

**역할**: 게임의 각 부분이 서로 소통할 수 있게 해주는 중앙 이벤트 시스템

**주요 기능**:

- **이벤트 발생**: `emit(eventName, data)`
- **이벤트 수신**: `on(eventName, callback)`
- **느슨한 결합**: UI와 로직이 직접 연결되지 않음

**코드**:

```typescript
class EventBus {
  private events: Map<string, Function[]> = new Map();
  
  emit(eventName: string, data?: any): void {
    const listeners = this.events.get(eventName) || [];
    listeners.forEach(callback => callback(data));
  }
  
  on(eventName: string, callback: Function): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(callback);
  }
}
```

---

## 🔄 데이터 흐름

### 플레이어 행동 흐름

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
7. BattleEventManager가 이벤트 수신
   ↓
8. AnimationManager에 애니메이션 요청
   ↓
9. UI 업데이트 (HP 바, 데미지 텍스트)
```

### 턴 진행 흐름

```text
1. TurnQueue.updateGauges() - 턴 게이지 업데이트
   ↓
2. 게이지 100 도달한 캐릭터 확인
   ↓
3. 아군이면 → BattleUIManager가 버튼 활성화
   ↓
4. 적이면 → EnemyAI가 자동으로 행동 결정
   ↓
5. BattleController가 행동 실행
   ↓
6. 결과 이벤트 발생 및 UI 업데이트
   ↓
7. 다음 턴으로
```

---

## 🎯 현재 시스템 상태

### ✅ 완성된 기능

- **핵심 전투 시스템**: 턴 기반 전투, 데미지 계산, 스킬 시스템
- **UI 시스템**: 캐릭터 표시, HP/MP 바, 버튼, 턴 표시
- **애니메이션**: 데미지 텍스트, 캐릭터 흔들림, 버튼 효과
- **AI 시스템**: 적의 자동 행동 결정
- **이벤트 시스템**: 느슨한 결합을 통한 모듈 간 통신
- **리팩토링**: 단일 책임 원칙을 준수한 모듈화된 구조

### 🚀 다음 단계 (Phase 6+)

- **새로운 씬**: 타이틀 화면, 인벤토리, 상점, 맵
- **아이템 시스템**: 무기, 방어구, 소모품
- **레벨업 시스템**: 경험치, 스탯 증가
- **사운드**: 효과음, 배경음악
- **세이브/로드**: 게임 진행 저장

---

## 🛠️ 개발 가이드

### 새로운 기능 추가 시

1. **단일 책임 원칙**: 하나의 클래스는 하나의 책임만
2. **이벤트 기반**: 직접 호출보다는 이벤트 사용
3. **타입 안전성**: TypeScript 타입을 적극 활용
4. **테스트 우선**: 기능 구현 전 테스트 작성

### 파일 수정 시 주의사항

1. **의존성 확인**: 한 파일 수정이 다른 파일에 미치는 영향
2. **초기화 순서**: UI → 이벤트 → 로직 순서 유지
3. **메모리 관리**: 사용하지 않는 객체는 destroy() 호출
4. **이벤트 정리**: 씬 종료 시 이벤트 리스너 해제

이제 이 아키텍처를 바탕으로 게임을 확장하고 개선할 수 있습니다! 🎮
