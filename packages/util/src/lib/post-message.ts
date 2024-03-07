///<reference types="../typings"/>
import { JsonUtils } from './json-utils';
import { EventBus } from './event-bus';

import { fromEvent, Observable } from 'rxjs';
import { Util } from './utils';
import { NgZone } from '@angular/core';

class InnerPM {
  constructor() {
    if (window.appUtil === undefined) {
      window.appUtil = {};
    }
    window.appUtil.parentPostMessageFunProxy = (data: string) => {
      window.postMessage(data, '*');
    };
    fromEvent(window, 'message').subscribe((event: any) => {
      event = event.originalEvent || event;
      if (event && event.data) {
        this.parseData(event.data);
      }
    });
  }
  ngZone: NgZone;
  public on<T>(modCode: string, msgt: string): Observable<T> {
    return EventBus.on(modCode, msgt);
  }
  public offAll(modCode: string, msgt: string) {
    EventBus.offAll(modCode, msgt);
  }
  overrideOn<T>(modCode: string, event: string): Observable<T> {
    return EventBus.overrideOn(modCode, event);
  }
  public send(modCode: string, msgt: string, msg: any, targetWindow: Window) {
    if (targetWindow != null) {
      if (window.opener && window.opener === targetWindow && (window.hasOwnProperty('ActiveXObject') || 'ActiveXObject' in window)) {
        try {
          targetWindow.appUtil.parentPostMessageFunProxy(JSON.stringify({ modCode: modCode, msgt: msgt, data: msg }));
        } catch (e) {}
      }
      targetWindow.postMessage(JSON.stringify({ modCode: modCode, msgt: msgt, data: msg }), '*');
    }
  }
  private parseData(data: string) {
    try {
      const msg = JsonUtils.parse(data);
      if (!Util.isUndefinedOrNull(msg) && msg.hasOwnProperty('modCode') && msg.hasOwnProperty('msgt')) {
        if (NgZone.isInAngularZone()) {
          EventBus.trigger(msg.modCode, msg.msgt, msg.data);
        } else {
          if (!Util.isUndefinedOrNull(this.ngZone)) {
            this.ngZone.run(() => {
              EventBus.trigger(msg.modCode, msg.msgt, msg.data);
            });
          } else {
            EventBus.trigger(msg.modCode, msg.msgt, msg.data);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
export class PostMessage {
  private static innerPM: InnerPM = new InnerPM();
  static setNgZone(ngZone: NgZone) {
    PostMessage.innerPM.ngZone = ngZone;
  }
  /**
   * 监听系统PostMessage信息
   *
   * @static
   * @template T
   * @param {string} modCode
   * @param {string} msgt
   * @returns {Observable<T>}
   * @memberof PostMessage
   */
  static on<T>(modCode: string, msgt: string): Observable<T> {
    return PostMessage.innerPM.on(modCode, msgt);
  }
  /**
   * 发送系统格式PostMessage消息
   *
   * @static
   * @param {string} modCode
   * @param {string} msgt
   * @param {*} msg
   * @param {Window} targetWindow
   * @memberof PostMessage
   */
  static send(modCode: string, msgt: string, msg: any, targetWindow: Window) {
    PostMessage.innerPM.send(modCode, msgt, msg, targetWindow);
  }

  /**
   * 注销所有监听
   */
  static offAll(modCode: string, msgt: string) {
    PostMessage.innerPM.offAll(modCode, msgt);
  }

  /**
   * 注销之前的监听，仅保留本次
   * @param modCode
   * @param event
   * @returns
   */
  static overrideOn<T>(modCode: string, msgt: string): Observable<T> {
    return PostMessage.innerPM.overrideOn(modCode, msgt);
  }
}
