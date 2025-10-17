# 턴제 RPG 게임 아키텍처 가이드

## 🎮 게임 시스템 구조 한눈에 보기

### 📁 핵심 파일 구조

```
src/
├── main.ts              ⭐ Phaser 게임 시작점
├── core/
│   └── Scene.ts         🎬 씬 베이스 클래스
├── characters/
│   └── Character.ts     👤 캐릭터 (HP, MP, 스탯, 스킬)
├── battle/              # 전투 로직 (Phaser 독립적!)
│   ├── BattleController.ts  🎮 전투 로직 컨트롤러
│   ├── EnemyAI.ts           🤖 적 AI 시스템
│   ├── DamageCalculator.ts  ⚔️ 데미지 계산
│   ├── TurnQueue.ts         ⏱️ 턴 순서 관리
│   └── Skill.ts             ✨ 스킬 시스템
└── scenes/              # Phaser 씬
    └── PhaserBattleScene.ts 🎬 전투 씬 (Phaser 기반)
```

---

## 🔍 각 파일 역할 상세 설명

### ⭐ main.ts - Phaser 게임 시작점

**역할**: Phaser 게임을 초기화하고 시작하는 진입점

**흐름**:

1. Phaser 게임 설정 정의 (800x600, PhaserBattleScene 시작)
2. Phaser.Game 인스턴스 생성
3. PhaserBattleScene 자동 시작

**코드**:

```typescript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [PhaserBattleScene]
};
new Phaser.Game(config);
```

---

### 🎬 Scene.ts - 씬 베이스 클래스 (NEW!)

**역할**: 모든 씬의 공통 인터페이스 정의

**추상 메서드**:

- `update(deltaTime)`: 씬 업데이트
- `render()`: 씬 렌더링
- `destroy()`: 리소스 정리

**왜 필요한가?**:

```typescript
// 향후 씬 전환 시스템
class Game {
  currentScene: Scene;
  
  changeScene(newScene: Scene) {
    currentScene.destroy();
    currentScene = newScene;
  }
}

// 모든 씬이 동일한 인터페이스
BattleScene extends Scene
ShopScene extends Scene
MapScene extends Scene
```

---

### 🎬 PhaserBattleScene.ts - Phaser 전투 씬

**역할**: Phaser 기반 전투 화면 (로직은 BattleController 재사용!)

**핵심 개념**:

- **로직 재사용**: BattleController, EnemyAI 그대로 사용
- **UI만 Phaser**: Phaser의 Graphics, Text, 입력 시스템 활용

**주요 메서드**:

```typescript
create() {
  // 씬 초기화
  // 캐릭터 생성 (용사, 슬라임)
  // BattleController 생성 (로직 재사용!)
  // 이벤트 리스너 등록 (턴 시작, 데미지, 힐, 턴 종료)
  // Phaser UI 생성 (HP/MP 바, 버튼, 텍스트)
}

update(time, delta) {
  // 매 프레임 호출 (Phaser가 자동)
  // 전투 종료 확인
  // controller.update()로 턴 관리 (즉시 점프 시스템)
  // UI 업데이트
}

drawStatusBar() {
  // Phaser Graphics로 HP/MP 바 그리기
}

showDamageAnimation() {
  // Phaser Tweens로 데미지 숫자 애니메이션
}

shakeCharacter() {
  // Phaser Tweens로 캐릭터 흔들림 효과
}
```

**장점**:

- Phaser 애니메이션 사용 가능 (데미지 숫자, 캐릭터 흔들림)
- 터치/마우스 자동 처리
- 씬 전환 시스템 내장
- 300ms 딜레이로 안정적인 턴 전환

---

### 👤 Character.ts - 캐릭터

**역할**: 캐릭터의 모든 정보와 상태 관리

**주요 속성**:

```typescript
{
  name: string        // 이름
  hp/maxHp: number   // 체력
  mp/maxMp: number   // 마나
  attack: number     // 공격력
  defense: number    // 방어력
  speed: number      // 속도 (턴 게이지 증가 속도)
  skills: Skill[]    // 보유 스킬 목록
}
```

**주요 메서드**:

- `takeDamage(amount)`: HP 감소 (0 이하로 안 내려감)
- `heal(amount)`: HP 회복 (maxHp 초과 안 됨)
- `isAlive()`: HP > 0이면 true

---

### ⏱️ TurnQueue.ts - 턴 순서 관리

**역할**: 속도 기반으로 누가 먼저 행동할지 결정

**핵심 개념**:

```
각 캐릭터마다 turnGauge(턴 게이지)를 가짐
매 프레임마다 speed만큼 증가
100 이상 되면 행동 가능
행동하면 -100
```

**주요 메서드**:

- `addCharacter(character)`: 캐릭터를 큐에 추가
- `updateGauges(deltaTime)`: 모든 캐릭터의 게이지 증가
- `getNextActor()`: 게이지 100+ 중 가장 높은 캐릭터 반환
- `consumeTurn(character)`: 행동 후 게이지 -100

**예시**:

```
용사 speed: 18 → 1초에 게이지 +18
슬라임 speed: 12 → 1초에 게이지 +12
→ 용사가 더 자주 행동!
```

---

### ⚔️ DamageCalculator.ts - 데미지 계산

**역할**: 공격 시 최종 데미지 계산

**공식**:

```
기본 데미지 = (공격력 × 스킬배율) - 방어력
크리티컬 발생 시 × 1.5
최소 데미지 1 보장
```

**함수**:

```typescript
calculateDamage({
  attack,
  defense,
  skillPower,      // 기본 1.0
  criticalRate,    // 크리티컬 확률 (0~1)
  isCritical       // 강제 크리티컬 (테스트용)
})
→ { damage, isCritical }
```

---

### ✨ Skill.ts - 스킬

**역할**: 스킬 정보와 사용 로직

**주요 속성**:

```typescript
{
  id: string              // 고유 ID
  name: string            // 스킬명
  mpCost: number          // MP 소비량
  targetType: string      // 'single-enemy' | 'self' 등
  effects: SkillEffect[]  // 효과 목록
}
```

**효과 타입**:

- `damage`: 데미지
- `heal`: 회복
- `buff/debuff`: 버프/디버프 (향후 확장)

**주요 메서드**:

- `canUse(user)`: MP 충분 & 살아있는지 체크
- `use(user, targets)`: MP 소비 → 효과 적용 → 결과 반환

---

### 🎮 BattleController.ts - 전투 로직 컨트롤러

**역할**: 전투의 핵심 로직만 담당 (UI와 분리)

**주요 기능**:

```typescript
class BattleController {
  turnQueue            // 턴 관리
  hero, enemy          // 캐릭터들
  
  update(deltaTime)    // 턴 게이지 업데이트, 다음 행동자 반환
  executeAttack()      // 플레이어 공격 실행
  executeSkill(skill)  // 플레이어 스킬 사용
  executeEnemyTurn()   // 적 자동 행동
  
  // 이벤트 시스템
  on(callback)         // 전투 이벤트 리스너 등록
  emit(event)          // 전투 이벤트 발생 (로그용)
}
```

**이벤트 타입**:

- `turn-start`: 턴 시작 (플레이어/적 턴 시작 알림)
- `attack`: 공격 실행
- `skill`: 스킬 사용
- `damage`: 데미지 발생 (애니메이션용)
- `heal`: 회복 발생 (애니메이션용)
- `turn-end`: 턴 종료

**장점**:

- UI와 로직 완전 분리
- 테스트 용이성
- 재사용 가능한 전투 로직

### ⏱️ TurnQueue.ts - 턴 순서 관리 (즉시 점프 시스템)

**역할**: 턴 게이지 관리 및 즉시 점프 시스템으로 대기 시간 제거

**핵심 기능**:

```typescript
class TurnQueue {
  entries: TurnEntry[]  // 캐릭터별 턴 게이지
  
  updateGauges(deltaTime) {
    // 점프 조건 확인: 다음 업데이트까지 아무도 100 도달 못할 때
    // 가장 빨리 100 도달할 캐릭터까지 시간 계산
    // 모든 캐릭터를 점프 시점으로 동시 업데이트
  }
  
  getNextActor() {
    // turnGauge >= 100인 캐릭터 중 가장 높은 게이지 반환
  }
  
  consumeTurn(character) {
    // 행동한 캐릭터만 100 차감 (다른 캐릭터 게이지 유지)
  }
}
```

**즉시 점프 시스템**:

```
기존: 0 → 16 → 32 → ... → 100 (6.25초 대기)
수정: 0 → 즉시 점프 → 100 (대기 시간 제거)
```

**장점**:

- 턴 게이지 대기 시간 완전 제거
- 일관된 턴 순서 보장
- 속도 차이에 따른 공정한 순서 결정

---

## 🎯 데이터 흐름 예시

### 플레이어가 "강타" 사용 시 (Phaser 기반)

```
1. 플레이어 클릭 (Phaser 입력 시스템)
   ↓
2. PhaserBattleScene.handleSkill(강타스킬) 호출
   ↓
3. BattleController.executeSkill(강타스킬)
   ↓
4. Skill.use(hero, [enemy])
   - hero.mp -= 10
   - enemy.takeDamage(50)
   ↓
5. 이벤트 발생 (skill, damage)
   ↓
6. PhaserBattleScene에서 이벤트 수신
   - 데미지 애니메이션 (showDamageAnimation)
   - 캐릭터 흔들림 (shakeCharacter)
   - 전투 로그 추가
   ↓
7. TurnQueue.consumeTurn(hero)
   - hero의 turnGauge -= 100 (다른 캐릭터는 유지)
   ↓
8. turn-end 이벤트 발생
   ↓
9. 300ms 딜레이 후 다음 턴 처리
```

---

## 🧪 테스트 구조

각 핵심 모듈마다 `.test.ts` 파일 존재:

- `Character.test.ts`: 11개 테스트
- `DamageCalculator.test.ts`: 11개 테스트
- `TurnQueue.test.ts`: 13개 테스트 (즉시 점프 시스템 테스트 포함)
- `Skill.test.ts`: 12개 테스트
- `EnemyAI.test.ts`: 10개 테스트
- `BattleSimulation.test.ts`: 4개 통합 테스트

**총 61개 테스트 - 모두 통과!**

---

## 💡 확장 포인트

### 🎯 리팩토링 후 확장이 쉬워진 것

#### 1. **장비 시스템 추가**

```typescript
// BattleController.ts에만 수정
calculateDamage({
  attack: hero.attack + hero.equipment.weapon.attack,
  defense: enemy.defense,
  ...
})
```

#### 2. **아이템 시스템**

```typescript
// BattleController.ts에 메서드 추가
executeItem(item: Item): void {
  item.use(hero);
  emit({ type: 'item-use', ... });
}

// BattleUI.ts에 버튼 추가
createItemButtons(items, onItemClick);
```

#### 3. **적 AI 개선 (Phase 4)**

```typescript
// BattleController.ts의 executeEnemyTurn()만 수정
private executeEnemyTurn(): void {
  const ai = new EnemyAI();
  const action = ai.decide(enemy, [hero]);
  
  if (action.type === 'skill') {
    // 스킬 사용
  } else {
    // 기본 공격
  }
}
```

#### 4. **새로운 씬 추가**

```typescript
// Scene 베이스 클래스 상속
class ShopScene extends Scene {
  update(deltaTime) { ... }
  render() { ... }
  destroy() { ... }
}

class MapScene extends Scene { ... }
class InventoryScene extends Scene { ... }
```

#### 5. **씬 전환 시스템**

```typescript
// main.ts 또는 Game.ts
class Game {
  currentScene: Scene;
  
  changeScene(newScene: Scene) {
    currentScene.destroy();
    currentScene = newScene;
    // UI는 각 씬이 관리
    // 로직은 각 씬의 Controller가 관리
  }
}
```

---

### 🏗️ 향후 RPG 시스템 구조

```
src/
├── core/
│   ├── Scene.ts           ✅ 완료
│   ├── GameLoop.ts        ✅ 완료
│   └── SceneManager.ts    ⬜ 추후 (씬 전환)
├── systems/
│   ├── InputManager.ts    ✅ 완료
│   ├── SaveManager.ts     ⬜ 추후 (세이브/로드)
│   ├── InventoryManager.ts ⬜ 추후 (인벤토리)
│   └── EquipmentManager.ts ⬜ 추후 (장비)
├── data/
│   ├── items.json         ⬜ 추후
│   ├── equipment.json     ⬜ 추후
│   └── enemies.json       ⬜ 추후
├── scenes/
│   ├── BattleScene.ts     ✅ 완료
│   ├── ShopScene.ts       ⬜ 추후
│   ├── MapScene.ts        ⬜ 추후
│   └── InventoryScene.ts  ⬜ 추후
└── ...
```

---

### 🎨 리팩토링의 진짜 가치

**나쁜 구조 (단일 파일):**

```
BattleScene.ts (600줄)
→ ShopScene 만들 때: 처음부터 다시
→ InventoryScene 만들 때: 또 처음부터
→ 패턴이 없어서 매번 고민
```

**좋은 구조 (분리됨):**

```
BattleScene = BattleController + BattleUI
ShopScene = ShopController + ShopUI       (패턴 재사용!)
InventoryScene = InventoryController + InventoryUI

→ Controller: 로직만
→ UI: 화면만
→ Scene: 조합만
→ 각 씬이 동일한 패턴!
```

---

## 🚀 빠른 참조

### 새 스킬 추가하기

```typescript
const newSkill = new Skill({
  id: 'ice-blast',
  name: '아이스 블래스트',
  mpCost: 25,
  targetType: 'single-enemy',
  effects: [{ type: 'damage', value: 60 }],
});
```

### 새 적 추가하기

```typescript
const boss = new Character({
  name: '보스',
  hp: 200,
  attack: 40,
  defense: 20,
  speed: 10,
  skills: [bossSkill1, bossSkill2],
});
```

### 테스트 실행

```bash
npm test          # 모든 테스트
npm run test:ui   # UI에서 테스트 확인
```

---

## 📝 코드 베이스 규모 (Phaser 3 전환 후)

### 전투 로직 (Phaser 독립적!)

- **BattleController.ts**: 264줄 (전투 로직 + AI 통합 + 주석)
- **EnemyAI.ts**: 99줄 (적 AI + 주석)
- **Character.ts**: 94줄 (캐릭터 + 주석)
- **Skill.ts**: 181줄 (스킬 시스템 + 주석)
- **TurnQueue.ts**: 84줄 (턴 관리 + 주석)
- **DamageCalculator.ts**: 62줄 (데미지 계산 + 주석)

### Phaser 씬

- **PhaserBattleScene.ts**: 323줄 (Phaser UI + 주석)
- **Scene.ts**: 24줄 (베이스 클래스)

### 테스트

- **총 61개 테스트** (모두 통과)
  - Character: 11개
  - DamageCalculator: 11개
  - TurnQueue: 13개
  - Skill: 12개
  - EnemyAI: 10개
  - BattleSimulation: 4개

**총계**: ~1,200줄 (로직 + Phaser UI + 주석)

**Canvas UI 제거**: ~800줄 감소 (중복 제거!)

---

## 🚀 완료된 Phase

### ✅ Phase 1-5a 완료

- **Phase 1**: 핵심 전투 시스템 (Character, TurnQueue, DamageCalculator)
- **Phase 2**: UI 렌더링 (Canvas → Phaser로 전환)
- **Phase 3**: 스킬 시스템 (MP 관리, 다양한 효과)
- **Phase 4**: 적 AI (상황별 행동 결정)
- **Phase 5a**: 폴리싱 완료
  - 🎨 애니메이션 (Phaser Tweens) - 데미지 숫자, 캐릭터 흔들림, 버튼 호버
  - ⚡ 즉시 점프 시스템 - 턴 게이지 대기 시간 완전 제거
  - 🎮 안정적인 턴 전환 - 300ms 딜레이로 동시 행동 방지

### 다음 Phase 5b: 콘텐츠 확장

- 🔊 사운드 (Phaser 오디오 시스템)
- 🗺️ 맵/필드 씬 추가
- 🛒 상점 시스템
- 🎒 인벤토리 & 장비
- 💾 세이브/로드

**현재 상태**: 61개 테스트 통과, 완전한 턴제 전투 시스템 완성!

---

이 문서는 전체 시스템을 이해하기 위한 가이드입니다.
각 파일의 상세 내용은 JSDoc 주석을 참고하세요.
