/**
 * 게임 씬의 추상 베이스 클래스
 * 모든 씬(BattleScene, ShopScene 등)이 이 클래스를 상속합니다.
 */
export abstract class Scene {
  /**
   * 씬의 상태를 업데이트합니다
   * @param deltaTime 이전 프레임과의 시간 차이 (초 단위)
   */
  abstract update(deltaTime: number): void;

  /**
   * 씬을 렌더링합니다
   */
  abstract render(): void;

  /**
   * 씬을 정리하고 리소스를 해제합니다
   * 이벤트 리스너 제거, 메모리 정리 등을 수행합니다
   */
  abstract destroy(): void;
}

