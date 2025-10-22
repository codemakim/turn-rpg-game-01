# 턴제 RPG 게임

TypeScript와 Phaser 3를 사용한 턴제 RPG 게임입니다.

## 🎮 게임 특징

- **턴 기반 전투**: 속도 기반 턴 순서 시스템
- **다양한 스킬**: MP 소모하는 특별한 기술들
- **AI 적**: 자동으로 행동하는 적 캐릭터
- **모듈화된 구조**: 확장 가능한 아키텍처

## 🚀 시작하기

### 필요 조건

- Node.js 20.19+ 또는 22.12+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

## 📁 프로젝트 구조

```
src/
├── main.ts                    # 게임 시작점
├── characters/                # 캐릭터 시스템
├── battle/                    # 전투 로직
├── scenes/                    # Phaser 씬
│   ├── BattleScene.ts        # 전투 씬
│   └── managers/             # 씬 매니저들
├── ui/components/             # UI 컴포넌트들
├── animation/                 # 애니메이션
├── input/                     # 입력 처리
└── core/                      # 핵심 시스템
```

## 🎯 게임 플레이

1. **전투 시작**: 용사 vs 슬라임 전투
2. **턴 순서**: 속도에 따라 행동 순서 결정
3. **플레이어 턴**: 공격 또는 스킬 사용
4. **적 턴**: AI가 자동으로 행동
5. **승부**: 한쪽 팀이 모두 쓰러질 때까지

## 🛠️ 개발 가이드

### 코드 구조 이해

- **[아키텍처 가이드](docs/ARCHITECTURE.md)**: 전체 시스템 구조
- **[코드 가이드](docs/CODE_GUIDE.md)**: 초보자를 위한 상세 설명

### 주요 시스템

- **Character**: 캐릭터 데이터와 기본 행동
- **BattleController**: 전투 로직 처리
- **TurnQueue**: 턴 순서 관리
- **UI Components**: 화면 표시 요소들
- **EventBus**: 모듈 간 통신

### 새로운 기능 추가

1. **새로운 씬**: `src/scenes/`에 씬 클래스 추가
2. **새로운 캐릭터**: `BattleCharacterFactory.ts`에서 생성
3. **새로운 스킬**: `Skill.ts`` 클래스 확장
4. **새로운 UI**: `src/ui/components/`에 컴포넌트 추가

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage
```

## 📚 문서

- **[아키텍처 가이드](docs/ARCHITECTURE.md)**: 시스템 구조와 각 파일 역할
- **[코드 가이드](docs/CODE_GUIDE.md)**: 초보자를 위한 상세 코드 설명

## 🚀 다음 단계

- [ ] 타이틀 화면 추가
- [ ] 인벤토리 시스템
- [ ] 아이템 및 장비 시스템
- [ ] 레벨업 시스템
- [ ] 사운드 및 음악
- [ ] 세이브/로드 기능

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 만듭니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 만듭니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

**즐거운 게임 개발 되세요!** 🎮
