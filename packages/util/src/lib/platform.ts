import { Util } from './utils';
export class Platform {
  static IsWechat() {
    const userAgent = Platform.getUserAgent();
    return userAgent.includes('MicroMessenger');
  }
  static IsWechatWork() {
    const userAgent = Platform.getUserAgent();
    return userAgent.includes('wxwork');
  }
  static IsWechatLocal() {
    const userAgent = Platform.getUserAgent();
    return userAgent.includes('wxworklocal');
  }
  private static getUserAgent(): string {
    return Util.getter(window, 'navigator.userAgent');
  }
  static IsDingTalk() {
    const userAgent = Platform.getUserAgent();
    return userAgent.toLowerCase().includes('dingtalk');
  }
  static IsWindows() {
    return window.navigator.platform === 'Win32' || window.navigator.platform === 'Win64';
  }
  static IsMobile() {
    const userAgent = Platform.getUserAgent();
    return userAgent.toLowerCase().indexOf('mobile') !== -1;
  }

  static isIE(): boolean {
    return window.ActiveXObject !== undefined || window.ActiveXObject != null || 'ActiveXObject' in window;
  }
  static isEdge(): boolean {
    return !Platform.isIE() && !!window.StyleMedia;
  }
  static isChrome(): boolean {
    const userAgent = Platform.getUserAgent();
    return userAgent.indexOf('Chrome') > -1;
  }

  static IsAndroid() {
    const userAgent = Platform.getUserAgent();
    return /android/i.test(userAgent);
  }

  static IsIos() {
    const userAgent = Platform.getUserAgent();
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    return /iPad|iPhone|iPod/.test(userAgent) && !(<any>window).MSStream;
  }

  static smallScreenDetected() {
    let result = false;
    if (location.search && window.localStorage) {
      if (location.search.indexOf('pc=on') !== -1) {
        window.localStorage.setItem('pc', 'on');
      } else if (location.search.indexOf('pc=off') !== -1) {
        window.localStorage.removeItem('pc');
      }
    }
    if (window.localStorage.getItem('pc') !== 'on') {
      // tslint:disable-next-line: no-angle-bracket-type-assertion whitespace
      const screen = <any>window.screen;
      let orientation = '';
      if (screen.msOrientation) {
        orientation = screen.msOrientation;
      } else if (screen.orientation && screen.orientation.type) {
        orientation = screen.orientation.type;
      }
      if (orientation) {
        if (orientation.includes('portrait')) {
          if (screen.width < 600) {
            result = true;
          }
        } else {
          if (screen.height < 600) {
            result = true;
          }
        }
      } else {
        if (screen.width < 600) {
          result = true;
        }
      }
    }
    return result;
  }
  /**
   * 操作系统
   */
  static detectOS() {
    const userAgent = Platform.getUserAgent();
    const isWin = userAgent.includes('Win32') || userAgent.includes('Win64') || userAgent.includes('Windows');
    if (isWin) return 'Win';

    const isMac =
    userAgent.includes('Mac68K') ||
    userAgent.includes('MacPPC') ||
    userAgent.includes('Macintosh') ||
    userAgent.includes('MacIntel');
    if (isMac) return 'Mac';

    const isUnix = userAgent.includes('X11') && !isWin && !isMac;
    if (isUnix) return 'Unix';

    const isLinux = userAgent.includes('Linux');
    if (isLinux) return 'Linux';

    return 'other';
  }

  /**
   * 是否在微应用中
   */
  static isInMicro() {
    return window.__POWERED_BY_QIANKUN__ === true;
  }

  /**
   * 是否在电脑上打开
   */
  static IsInPc() {
    return Platform.detectOS() !== 'other';
  }
}
