/**
 * 게임 전역 이벤트 버스
 * UI와 로직 간의 느슨한 결합을 위한 이벤트 시스템
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * 이벤트 타입 정의
 */
export interface GameEvents {
  // 전투 이벤트
  'battle:turn-start': { actor: any };
  'battle:turn-end': { actor: any };
  'battle:damage': { target: any; damage: number; isCritical: boolean };
  'battle:heal': { target: any; amount: number };
  'battle:attack': { attacker: any; target: any; damage: number };
  'battle:skill': { caster: any; skill: any; targets: any[] };
  'battle:start-targeting': { caster: any; skill: any };
  'battle:targeting-complete': { caster: any; skill: any; targets: any[] };
  'battle:targeting-cancel': {};

  // UI 이벤트
  'ui:button-click': { buttonId: string; data?: any };
  'ui:button-hover': { buttonId: string };
  'ui:button-out': { buttonId: string };
  'ui:character-select': { character: any };

  // 애니메이션 이벤트
  'animation:damage': { target: any; damage: number; isCritical: boolean };
  'animation:heal': { target: any; amount: number };
  'animation:shake': { target: any };

  // 게임 상태 이벤트
  'game:start': {};
  'game:over': { isVictory: boolean };
  'game:pause': {};
  'game:resume': {};
}

/**
 * 전역 이벤트 버스 클래스
 */
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() { }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 이벤트 발생
   * @param event 이벤트 이름
   * @param data 이벤트 데이터
   */
  public emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`이벤트 처리 오류 [${event}]:`, error);
        }
      });
    }
  }

  /**
   * 이벤트 리스너 등록
   * @param event 이벤트 이름
   * @param callback 콜백 함수
   */
  public on<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * 이벤트 리스너 제거
   * @param event 이벤트 이름
   * @param callback 제거할 콜백 함수
   */
  public off<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 모든 이벤트 리스너 제거
   */
  public clear(): void {
    this.listeners.clear();
  }

  /**
   * 특정 이벤트의 리스너 수 반환
   * @param event 이벤트 이름
   */
  public getListenerCount(event: string): number {
    return this.listeners.get(event)?.length || 0;
  }

  /**
   * 등록된 모든 이벤트 목록 반환 (디버깅용)
   */
  public getRegisteredEvents(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// 전역 인스턴스 export
export const eventBus = EventBus.getInstance();
