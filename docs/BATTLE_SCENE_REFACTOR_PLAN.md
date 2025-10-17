# BattleScene 리팩토링 계획서

## 📋 현재 상황 분석

### 현재 BattleScene.ts 문제점

- **545줄**의 거대한 파일 (단일 책임 원칙 위반)
- **6가지 서로 다른 책임**을 모두 담당
- **AnimationManager 중복 사용** (이미 완벽한 모듈이 있음)
- **확장성 부족** (향후 4명 아군, 8명 적 지원 어려움)

### 현재 파일별 책임 분석

```text
BattleScene.ts (545줄) - 과도한 책임:
├── 캐릭터/스킬 생성 (하드코딩) ❌ → BattleCharacterFactory
├── 레이아웃 계산 ❌ → BattleLayoutManager  
├── UI 생성 및 관리 ❌ → BattleUIManager
├── 이벤트 처리 ❌ → BattleEventManager
├── 애니메이션 처리 ❌ → AnimationManager (중복!)
└── 게임 루프 관리 ✅ → 이것만 남겨야 함

AnimationManager.ts (111줄) - 완벽한 모듈이지만 미활용:
├── 애니메이션 이벤트 리스너 ✅
├── 데미지/회복/흔들림 애니메이션 ✅
└── EventBus 기반 시스템 ✅

BattleController.ts (261줄) - 제대로 된 책임:
├── 전투 로직 (공격, 스킬, 턴 관리) ✅
├── 이벤트 발생 ✅
└── 승부 판정 ✅

BattleInputHandler.ts (147줄) - 제대로 된 책임:
├── 버튼 클릭 이벤트 처리 ✅
└── 전투 액션 변환 ✅

UI 컴포넌트들 (694줄) - 제대로 된 책임:
├── CharacterUI.ts (223줄) ✅
├── Button.ts (164줄) ✅
├── StatusBar.ts (166줄) ✅
└── TurnIndicator.ts (141줄) ✅
```

## 🎯 리팩토링 목표

### 목표 파일 구조

```text
src/scenes/
├── BattleScene.ts (목표: 100줄) - 오케스트레이션만
└── managers/
    ├── BattleCharacterFactory.ts (목표: 80줄)
    ├── BattleLayoutManager.ts (목표: 60줄)
    ├── BattleUIManager.ts (목표: 100줄)
    └── BattleEventManager.ts (목표: 80줄)
```

### 목표 책임 분배

```text
BattleScene.ts:
├── create() - 매니저들 초기화
├── update() - 게임 루프
└── destroy() - 리소스 정리

BattleCharacterFactory.ts:
├── createHeroSkills()
├── createEnemySkills()
├── createHeroes()
└── createEnemies()

BattleLayoutManager.ts:
├── calculateHeroPositions()
├── calculateEnemyPositions()
└── calculateButtonArea()

BattleUIManager.ts:
├── createBackground()
├── createCharacterUIs()
├── createButtonUI()
├── enableButtons()
└── disableAllButtons()

BattleEventManager.ts:
├── setupEventListeners()
├── setupInputHandlerEvents()
└── startPlayerTurn()

AnimationManager.ts (기존 활용):
├── showDamageAnimation() ✅
├── showHealAnimation() ✅
└── shakeCharacter() ✅
```

## 📝 단계별 실행 계획

### Phase 1: BattleCharacterFactory 생성

**목표**: 캐릭터/스킬 생성 로직 분리
**작업 내용**:

1. `src/scenes/managers/BattleCharacterFactory.ts` 생성
2. `BattleScene.createCharacters()` 메서드를 새 클래스로 이동
3. 하드코딩된 스킬/캐릭터 데이터를 팩토리 메서드로 분리
4. `BattleScene`에서 팩토리 사용하도록 수정

**예상 결과**:

- BattleScene.ts: 545줄 → 480줄 (-65줄)
- BattleCharacterFactory.ts: 80줄 (신규)

### Phase 2: BattleLayoutManager 생성

**목표**: 레이아웃 계산 로직 분리
**작업 내용**:

1. `src/scenes/managers/BattleLayoutManager.ts` 생성
2. `BattleScene.calculateLayout()` 메서드를 새 클래스로 이동
3. 위치 계산 로직을 개별 메서드로 분리
4. `BattleScene`에서 레이아웃 매니저 사용하도록 수정

**예상 결과**:

- BattleScene.ts: 480줄 → 440줄 (-40줄)
- BattleLayoutManager.ts: 60줄 (신규)

### Phase 3: BattleUIManager 생성

**목표**: UI 생성 및 관리 로직 분리
**작업 내용**:

1. `src/scenes/managers/BattleUIManager.ts` 생성
2. `BattleScene`의 UI 관련 메서드들을 새 클래스로 이동:
   - `createBackground()`
   - `createCharacterUIs()`
   - `createButtonUI()`
   - `enableButtons()`
   - `disableAllButtons()`
   - `updateTurnIndicators()`
3. `BattleScene`에서 UI 매니저 사용하도록 수정

**예상 결과**:

- BattleScene.ts: 440줄 → 320줄 (-120줄)
- BattleUIManager.ts: 100줄 (신규)

### Phase 4: BattleEventManager 생성

**목표**: 이벤트 처리 로직 분리
**작업 내용**:

1. `src/scenes/managers/BattleEventManager.ts` 생성
2. `BattleScene`의 이벤트 관련 메서드들을 새 클래스로 이동:
   - `setupEventListeners()`
   - `setupInputHandlerEvents()`
   - `startPlayerTurn()`
3. `BattleScene`에서 이벤트 매니저 사용하도록 수정

**예상 결과**:

- BattleScene.ts: 320줄 → 220줄 (-100줄)
- BattleEventManager.ts: 80줄 (신규)

### Phase 5: AnimationManager 활용 (중복 제거)

**목표**: 기존 AnimationManager 활용하여 중복 제거
**작업 내용**:

1. `BattleScene.showDamageText()`, `showHealText()` 메서드 제거
2. EventBus를 통한 애니메이션 이벤트 발생으로 변경
3. `AnimationManager`가 실제로 애니메이션 처리하도록 수정
4. `BattleScene`에서 직접 애니메이션 처리하는 코드 제거

**예상 결과**:

- BattleScene.ts: 220줄 → 180줄 (-40줄)
- AnimationManager.ts: 111줄 → 150줄 (+39줄, 실제 구현 추가)

### Phase 6: BattleScene 최종 정리

**목표**: BattleScene을 순수 오케스트레이션 클래스로 정리
**작업 내용**:

1. 불필요한 메서드 정리
2. 매니저들 간의 의존성 정리
3. 코드 주석 및 문서화
4. 최종 테스트 및 검증

**예상 결과**:

- BattleScene.ts: 180줄 → 100줄 (-80줄)
- 전체 코드 품질 향상

## ✅ 검증 기준

### 기능 검증

- [ ] 모든 기존 기능이 정상 작동
- [ ] 61개 테스트 모두 통과
- [ ] 버튼 클릭 정상 동작
- [ ] 애니메이션 정상 표시
- [ ] 턴 시스템 정상 작동

### 코드 품질 검증

- [ ] 각 파일이 단일 책임 원칙 준수
- [ ] 파일 크기가 적절함 (100줄 이하)
- [ ] 중복 코드 제거
- [ ] 명확한 의존성 관계
- [ ] 린터 오류 없음

### 확장성 검증

- [ ] 새로운 캐릭터 추가 용이
- [ ] 새로운 스킬 추가 용이
- [ ] UI 레이아웃 변경 용이
- [ ] 4명 아군, 8명 적 지원 가능

## 🚨 주의사항

### 각 Phase별 주의점

1. **Phase 1-4**: 한 번에 하나의 매니저만 생성하여 테스트
2. **Phase 5**: AnimationManager 수정 시 기존 기능 손상 주의
3. **Phase 6**: 최종 정리 시 모든 의존성 확인

### 롤백 계획

- 각 Phase 완료 후 커밋
- 문제 발생 시 이전 Phase로 롤백 가능
- 테스트 실패 시 즉시 중단

### 성공 기준

- BattleScene.ts가 100줄 이하로 축소
- 모든 기능이 정상 작동
- 코드 가독성 및 유지보수성 향상
- 향후 확장이 용이한 구조

## 📊 예상 결과

### 파일 크기 변화

```text
현재:
BattleScene.ts: 545줄 (1개 파일)

목표:
BattleScene.ts: 100줄
BattleCharacterFactory.ts: 80줄
BattleLayoutManager.ts: 60줄
BattleUIManager.ts: 100줄
BattleEventManager.ts: 80줄
AnimationManager.ts: 150줄 (기존 111줄 + 39줄)
총: 570줄 (6개 파일)
```

### 장점

- ✅ 단일 책임 원칙 준수
- ✅ 테스트 용이성 향상
- ✅ 재사용성 증대
- ✅ 유지보수성 개선
- ✅ 확장성 향상
- ✅ 코드 가독성 향상

이 계획서에 따라 단계별로 실행하겠습니다.
