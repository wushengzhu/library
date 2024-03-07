import { Util } from './utils';
import { JsonUtils } from './json-utils';
import { CryptoUtils } from './crypto-utils';
import { EncryptUrlFragment, ResourceType } from './model';
import { LogLevel } from './model/log-level.enum';

// tslint:disable: no-angle-bracket-type-assertion whitespace
class InnerLogger {
  static operQueen = new Array();

  static sendQueen = new Array();

  static browserInfo: any;
}
export class LoggerClient {
  /**
   *
   */
  constructor(private moduleName: string, private category: string) {}

  info(message: any, ex?: Error) {
    this.paser(LogLevel.INFO, ex, message);
  }

  warn(message: any, ex?: Error) {
    this.paser(LogLevel.WARN, ex, message);
  }
  error(message: any, ex?: Error) {
    this.paser(LogLevel.ERROR, ex, message);
  }
  handeleException(ex: Error, message?: any) {
    this.paser(LogLevel.ERROR, ex, message);
  }
  private paser(logLevel: LogLevel, ex?: Error, message?: any) {
    if (ex == null && message == null) {
      return;
    }
    let msg = '';
    let stackTrack = null;
    if (ex) {
      msg = ex.name + ': ' + ex.message;
      stackTrack = ex.stack;
      if ((<any>ex).originalError) {
        msg += `Original Msg:${(<any>ex).originalError.name},${(<any>ex).originalError.message}`;
        stackTrack += (<any>ex).originalError.stack;
      }
    }
    if (message) {
      if (typeof message === 'string') {
        msg = message;
      } else {
        msg = JsonUtils.stringify(message) + message;
      }
    }
    this.sendErrorLog({
      Message: msg,
      StackTrace: stackTrack,
      ExtraInfo: null,
      Level: logLevel,
    });
  }
  private checkDup(data: any) {
    if (
      InnerLogger.sendQueen.some((v) => {
        if (data.StackTrace) {
          return data.StackTrace === v.StackTrace;
        } else {
          return data.Message === v.Message;
        }
      })
    ) {
      return true;
    } else {
      InnerLogger.sendQueen.push(data);
      return false;
    }
  }
  sendErrorLog(data: any) {
    if (data) {
      let url = CryptoUtils.decryptUrl(location.href);
      let moduleName = this.moduleName;
      if (moduleName === 'Global' && !url.includes(EncryptUrlFragment)) {
        const tempUrl = url.replace(Util.getBaseUri(), '');
        const urls = tempUrl.split('/');
        if (urls.length >= 1) {
          if (urls[0] === 'extra') {
            if (urls.length >= 1) {
              if (urls[1]) {
                moduleName = urls[1];
              }
            }
          } else if (urls[0].indexOf('#') >= 0 || url[0].indexOf('?') >= 0) {
          } else {
            if (urls[0]) {
              moduleName = urls[0];
            }
          }
        }
      }
      data.ModuleName = moduleName;
      data.Category = this.category;

      data.BrowserInfo = InnerLogger.browserInfo;
      try {
        if (!Util.isUndefinedOrNull(window.opener)) {
          let opener = CryptoUtils.decryptUrl(window.opener.location.href);
          if (!Util.isUndefinedOrNull(opener)) {
            url += `,openner:${opener}`;
          }
        }
      } catch {}

      data.Url = url;
      if (Util.isUndefinedOrNull(data.Level)) {
        data.Level = LogLevel.ERROR;
      }
      data.OperTrace = JSON.stringify(InnerLogger.operQueen);
      InnerLogger.operQueen.length = 0;
      if (!this.checkDup(data)) {
        this.ajaxSend(data);
      }
    }
  }
  private ajaxSend(data: any) {
    if (data) {
      const sessionKeys = Reflect.ownKeys(window.sessionStorage);
      let token = null;
      for (const s of sessionKeys) {
        if (typeof s === 'string' && s.startsWith('UniWork.')) {
          const ts = window.sessionStorage[s];
          let t = null;
          try {
            t = JSON.parse(ts);
          } catch (ex) {}
          if (t) {
            token = t.access_token;
          }
        }
      }
      const xhr = new XMLHttpRequest();
      xhr.open('post', Util.parsePath('/api/Logging/FrontEndLog/Add', ResourceType.BackEnd));
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Content-Type', 'application/json');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(JSON.stringify(data));
    }
  }
}

export class Logger {
  private static loggers: any = {};
  static GetLogger(moduleName: string, category: string): LoggerClient {
    const loggerName = `${moduleName}.${category}`;
    if (Logger.loggers[loggerName]) {
      return Logger.loggers[loggerName];
    } else {
      Logger.loggers[loggerName] = new LoggerClient(moduleName, category);
    }
    return Logger.loggers[loggerName];
  }
  private static tryCatch(func: () => any) {
    try {
      func();
    } catch {}
  }
  static initForGlobal() {
    const screen = <any>window.screen;
    let orientation = null;
    if (<any>screen.msOrientation) {
      orientation = <any>screen.msOrientation;
    } else if (screen.orientation && screen.orientation.type) {
      orientation = screen.orientation.type;
    }
    let browserInfo: any = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      // tslint:disable-next-line: object-literal-shorthand
      orientation: orientation,
      screenWidth: screen.width,
      screentHeight: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      devicePixelRatio: window.devicePixelRatio,
    };
    Logger.tryCatch(() => {
      browserInfo.deviceMemory = (<any>navigator).deviceMemory;
    });
    if ((<any>navigator).userAgentData) {
      const uad = (<any>navigator).userAgentData;
      uad.getHighEntropyValues(['architecture', 'bitness', 'model', 'platformVersion', 'fullVersionList']).then((ua: any) => {
        browserInfo.userAgentData = ua;
        InnerLogger.browserInfo = JSON.stringify(browserInfo);
      });
    }
    InnerLogger.browserInfo = JSON.stringify(browserInfo);
    const logerClient = Logger.GetLogger('Global', 'HandleException');
    window.onerror = (msg, url, lineNum, colNum, err) => {
      // tslint:disable-next-line: max-line-length
      console.log(
        `错误发生的异常信息(字符串):${msg}`,
        `错误发生的脚本URL(字符串):${url}`,
        `错误发生的行号(数字):${lineNum}`,
        `错误发生的列号(数字):${colNum}`,
        `错误发生的Error对象(错误对象):${err}`
      );
      let errorMsg = `异常信息:${msg}`;
      if (url) {
        errorMsg += `错误发生的脚本URL:${url}`;
      }
      if (lineNum) {
        errorMsg += `错误发生的行号（数字）:${lineNum}`;
      }
      if (colNum) {
        errorMsg += `错误发生的列号（数字）:${colNum}`;
      }
      logerClient.handeleException(err!, errorMsg);
    };
    console.error = ((func) => {
      return (...args: any[]) => {
        // 在这里就可以收集到console.error的错误
        InnerLogger.operQueen.push({ timestamp: Date.now(), opType: 'console.error', message: `${args}` });
        // TODO 转换args
        func.apply(console, args);
      };
    })(console.error);

    // Promise.reject
    window.addEventListener('unhandledrejection', (e) => {
      console.log(`Promise.reject发生错误的原因:${e.reason}`, `Promise对象 :${e.promise}`);
      logerClient.sendErrorLog({
        Message: `Promise.reject${e.reason},Promise对象 :${e.promise}`,
        StackTrace: null,
        ExtraInfo: null,
      });
    });
    window.addEventListener(
      'error',
      (_errorEvent) => {
        //   Logger.sendErrorLog({});
      },
      true
    );
  }
}
