import { Subject, Observable } from 'rxjs';

class InnerEventBus {
  /**
   *
   */
  constructor() {}
  private eventHandle: { [key: string]: Subject<any> } = {};
  private parseKey(modCode: string, event: string): string {
    return modCode + '.' + event;
  }
  on<T>(modCode: string, event: string): Observable<T> {
    const key = this.parseKey(modCode, event);
    if (!(key in this.eventHandle)) {
      this.eventHandle[key] = new Subject<T>();
    }
    return this.eventHandle[key];
  }

  trigger<T>(modCode: string, event: string, data: T) {
    const key = this.parseKey(modCode, event);
    if (key in this.eventHandle) {
      this.eventHandle[key].next(data);
    }
  }
  offAll(modCode: string, event: string) {
    const key = this.parseKey(modCode, event);
    if (key in this.eventHandle) {
      this.eventHandle[key].complete();
    }
  }
  overrideOn<T>(modCode: string, event: string): Observable<T> {
    const key = this.parseKey(modCode, event);
    if (!(key in this.eventHandle)) {
      this.eventHandle[key] = new Subject<T>();
    } else {
      this.eventHandle[key].complete();
      this.eventHandle[key] = new Subject<T>();
    }
    return this.eventHandle[key];
  }
}

export class EventBus {
  private static innerEB: InnerEventBus = new InnerEventBus();
  /**
   * 监听EventBus消息
   * @param modCode
   * @param event
   */
  static on<T>(modCode: string, event: string): Observable<T> {
    return EventBus.innerEB.on(modCode, event);
  }
  /**
   * 触发EventBus消息
   * @param modCode
   * @param event
   * @param data
   */
  static trigger<T>(modCode: string, event: string, data: T) {
    EventBus.innerEB.trigger(modCode, event, data);
  }
  /**
   * 注销所有监听
   * @param modCode
   * @param event
   */
  static offAll(modCode: string, event: string) {
    EventBus.innerEB.offAll(modCode, event);
  }
  /**
   * 注销之前的监听，仅保留本次
   * @param modCode
   * @param event
   * @returns
   */
  static overrideOn<T>(modCode: string, event: string): Observable<T> {
    return EventBus.innerEB.overrideOn(modCode, event);
  }
}
