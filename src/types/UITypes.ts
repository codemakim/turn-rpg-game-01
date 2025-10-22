/**
 * UI 관련 타입 정의
 */

import type { Character } from '@/characters/Character';

/**
 * UI 컴포넌트 상태
 */
export type UIComponentState = 'idle' | 'hover' | 'active' | 'disabled' | 'loading';

/**
 * 버튼 타입
 */
export type ButtonType = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

/**
 * 버튼 크기
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * 레이아웃 정보
 */
export interface LayoutInfo {
  /** 화면 너비 */
  width: number;
  /** 화면 높이 */
  height: number;
  /** 캐릭터 영역 */
  characterArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 버튼 영역 */
  buttonArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 캐릭터 위치 정보 */
  characterPositions: UICharacterPosition[];
}

/**
 * 캐릭터 위치 정보 (UI용)
 */
export interface UICharacterPosition {
  /** 캐릭터 객체 */
  character: Character;
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
  /** 인덱스 */
  index: number;
}

/**
 * 타겟팅 상태
 */
export type TargetingState = 'IDLE' | 'SELECTING' | 'CONFIRMED' | 'CANCELLED';

/**
 * 타겟팅 결과
 */
export interface TargetingResult {
  /** 성공 여부 */
  success: boolean;
  /** 결과 메시지 */
  message: string;
  /** 선택된 대상들 */
  targets?: Character[];
}

/**
 * 마우스 이벤트 데이터
 */
export interface MouseEventData {
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
  /** 버튼 타입 */
  button?: number;
}

/**
 * 터치 이벤트 데이터
 */
export interface TouchEventData {
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
  /** 터치 ID */
  identifier?: number;
}

/**
 * 키보드 이벤트 데이터
 */
export interface KeyboardEventData {
  /** 키 코드 */
  keyCode: string;
  /** 키 이름 */
  key: string;
  /** 수정자 키들 */
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
}
