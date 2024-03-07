import AES from 'crypto-js/aes';
import MD5 from 'crypto-js/md5';
import Utf8 from 'crypto-js/enc-utf8';
import Hex from 'crypto-js/enc-hex';
import Pkcs7 from 'crypto-js/pad-pkcs7';
import WordArray from 'crypto-js/lib-typedarrays';

import { Util } from './utils';
import { EncryptUrlFragment } from './model';
import { JsonUtils } from './json-utils';
export class CryptoUtils {
  private static readonly testPasswordUrl = '/forEncryptUrlTest/';
  private static password: string;
  private static getCanvasFp() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 200;
      canvas.style.display = 'inline';
      const ctx: any = canvas.getContext('2d');
      ctx.rect(0, 0, 10, 10);
      ctx.rect(2, 2, 6, 6);
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.font = '11pt Arial';
      ctx.fillText('Cwm fjordbank glyphs vext quiz, \ud83d\ude03', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.2)';
      ctx.font = '18pt Arial';
      ctx.fillText('Cwm fjordbank glyphs vext quiz, \ud83d\ude03', 4, 45);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(0,255,255)';
      ctx.beginPath();
      ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(255,255,0)';
      ctx.beginPath();
      ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
      ctx.arc(75, 75, 25, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      if (canvas.toDataURL) {
        return canvas.toDataURL();
      }
    } catch {}
    return 'not support';
  }
  private static getLanguage() {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    return navigator.language || (<any>navigator).userLanguage || (<any>navigator).browserLanguage || (<any>navigator).systemLanguage;
  }
  private static hasSessionStorage() {
    try {
      return !!window.sessionStorage;
    } catch (e) {
      return null; // SecurityError when referencing it means it exists
    }
  }

  // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
  private static hasLocalStorage() {
    try {
      return !!window.localStorage;
    } catch (e) {
      return null; // SecurityError when referencing it means it exists
    }
  }
  private static hasIndexedDB() {
    try {
      return !!window.indexedDB;
    } catch (e) {
      return null; // SecurityError when referencing it means it exists
    }
  }
  private static getDoNotTrack() {
    if (navigator.doNotTrack) {
      return navigator.doNotTrack;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
    } else if ((<any>navigator).msDoNotTrack) {
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      return (<any>navigator).msDoNotTrack;
    } else if ((<any>window).doNotTrack) {
      return (<any>window).doNotTrack;
    } else {
      return null;
    }
  }
  private static getTimeZoneName() {
    try {
      if (window.Intl && window.Intl.DateTimeFormat) {
        return new window.Intl.DateTimeFormat().resolvedOptions().timeZone;
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  private static getTimezoneOffset() {
    try {
      return new Date().getTimezoneOffset();
    } catch (e) {
      return null;
    }
  }
  private static genPassword() {
    const browser = [
      navigator.userAgent,
      this.getLanguage(),
      navigator.webdriver,
      (<any>navigator).deviceMemory,
      (<any>navigator).cpuClass,
      this.getDoNotTrack(),
      navigator.platform,
      window.screen.width,
      window.screen.height,
      window.screen.colorDepth,
      this.getTimezoneOffset(),
      this.hasSessionStorage(),
      this.hasLocalStorage(),
      this.hasIndexedDB(),
      !!(<any>window).openDatabase,
      this.getTimeZoneName(),
      (<any>window).screen.deviceXDPI,
      (<any>window).screen.deviceYDPI,
      !!(<any>document).body.addBehavior,
      this.getCanvasFp(),
    ];
    return MD5(browser.join(',')).toString();
  }
  private static initDid(password: string) {
    let didLocal = window.localStorage.getItem('.did');
    let timeStampInChar: string = '';
    if (!Util.isNullOrWhiteSpace(didLocal)) {
      const didPlain = Util.base62Decode(didLocal!)!;
      if (!Util.isNullOrWhiteSpace(didPlain)) {
        const didArray = didPlain!.split('.');
        if (didArray.length === 2) {
          if (CryptoUtils.decryptUrlInner(didArray[1], didArray[0].substring(11)) === CryptoUtils.testPasswordUrl) {
            timeStampInChar = didArray[0].substring(0, 11);
            password = didArray[0].substring(11);
          }
        }
      }
    }
    if (Util.isNullOrWhiteSpace(timeStampInChar)) {
      const timeStamp = Util.getTimeStampInSecond();
      timeStampInChar = CryptoUtils.getTimeStampInChar(timeStamp);
      didLocal = timeStampInChar + password + '.' + CryptoUtils.encryptUrlInner(CryptoUtils.testPasswordUrl, password);
      window.localStorage.setItem('.did', Util.base62Encode(didLocal)!);
    }
    const now = new Date();
    now.setFullYear(now.getFullYear() + 6);
    const doc = document as any;
    doc[atob('Y29va2ll')] = `.did=${Util.base62Encode(
      Utf8.parse(timeStampInChar + password).toString()
    )};expires=${now.toUTCString()};path=/;`;
  }
  static getPassword() {
    if (Util.isNullOrWhiteSpace(this.password)) {
      this.password = this.genPassword();
      const now = new Date();
      now.setFullYear(now.getFullYear() + 6);
      const doc = document as any;
      doc[atob('Y29va2ll')] = `.vid=${encodeURIComponent(btoa(Utf8.parse(this.password).toString()))};expires=${now.toUTCString()};path=/;`;
      this.initDid(this.password);
    }
    return this.password;
  }
  static encryptUrl(msg: string) {
    const password = this.getPassword();
    if (password == null) {
      return msg;
    }
    if (msg.includes('/auth-callback')) {
      return msg;
    }
    if (msg.includes('/slient-auth-callback')) {
      return msg;
    }
    if (msg.includes(EncryptUrlFragment)) {
      return msg;
    } else {
      return CryptoUtils.encryptUrlInner(msg, password);
    }
  }
  static decryptUrl(transitmessage: string) {
    const password = this.getPassword();
    if (password == null) {
      return transitmessage;
    }
    return this.decryptUrlInner(transitmessage, password);
  }

  private static encryptUrlInner(msg: string, password: string) {
    const iv = WordArray.random(128 / 8);
    //const iv = Utf8.parse('1234567890123456');
    const encrypted = AES.encrypt(msg, Utf8.parse(password), {
      iv: iv,
      padding: Pkcs7,
    });

    const transitmessage = btoa(iv.toString() + encrypted.toString());
    return `${EncryptUrlFragment}${transitmessage}`;
  }

  private static decryptUrlInner(transitmessage: string, password: string) {
    const urlFragment = transitmessage.indexOf(EncryptUrlFragment);
    if (urlFragment !== -1) {
      try {
        const enc = atob(transitmessage.substring(urlFragment + 3));
        // const salt = Hex.parse(transitmessage.substr(0, 32));
        const iv = Hex.parse(enc.substring(0, 32));
        const encrypted = enc.substring(32);
        const decrypted = AES.decrypt(encrypted, Utf8.parse(password), {
          iv: iv,
          padding: Pkcs7,
        });
        if (transitmessage.startsWith('http')) {
          return transitmessage.substring(0, urlFragment - 1) + decrypted.toString(Utf8);
        } else {
          return decrypted.toString(Utf8);
        }
      } catch {
        return transitmessage;
      }
    } else {
      return transitmessage;
    }
  }
  private static readonly keyByte = Utf8.parse('18e53b283866ba2c36a4ddfc860e3f05');
  private static readonly ivByte = Utf8.parse('9058efd34945c6a1');

  private static timeStampToCharMap: Array<Array<{ [key: number]: string }>>;
  private static charToTimeStampIntMap: { [key: string]: { [key: string]: number } };
  private static getTimeStampToCharMap() {
    if (Util.isUndefinedOrNull(CryptoUtils.timeStampToCharMap)) {
      CryptoUtils.timeStampToCharMap = [];
      for (let i = 0; i < 10; i++) {
        const digitToCharMap = [];
        let upperChar: { [key: number]: string } = {};
        let lowerChar: { [key: number]: string } = {};
        for (let j = 0; j < 10; j++) {
          upperChar[i + j] = String.fromCharCode(65 + i + j);
          lowerChar[i + j] = String.fromCharCode(97 + i + j);
        }
        digitToCharMap[0] = upperChar;
        digitToCharMap[1] = lowerChar;
        CryptoUtils.timeStampToCharMap[i] = digitToCharMap;
      }
    }
    return CryptoUtils.timeStampToCharMap;
  }
  private static getCharToTimeStampIntMap() {
    if (Util.isUndefinedOrNull(CryptoUtils.charToTimeStampIntMap)) {
      CryptoUtils.charToTimeStampIntMap = {};
      for (let i = 0; i < 10; i++) {
        let charToInt: { [key: string]: number } = {};
        for (let j = 0; j < 10; j++) {
          charToInt[String.fromCharCode(65 + i + j)] = j;
          charToInt[String.fromCharCode(97 + i + j)] = j;
        }
        CryptoUtils.charToTimeStampIntMap[String.fromCharCode(65 + i + i)] = charToInt;
        CryptoUtils.charToTimeStampIntMap[String.fromCharCode(97 + i + i)] = charToInt;
      }
    }
    return CryptoUtils.charToTimeStampIntMap;
  }
  static encrypt(msg: any) {
    if (Util.isUndefinedOrNull(msg)) {
      return null;
    }
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg);
    }
    if (Util.isNullOrWhiteSpace(msg)) {
      return null;
    }
    const timeStamp = Util.getTimeStampInSecond();
    const encrypted = AES.encrypt(timeStamp + msg, CryptoUtils.keyByte, {
      iv: CryptoUtils.ivByte,
      padding: Pkcs7,
    });
    const timeStampInChar = CryptoUtils.getTimeStampInChar(timeStamp);
    const iv = WordArray.random(128 / 8);
    return timeStampInChar + iv.toString() + encrypted.toString();
  }
  static decrypt(msg: string, expiresInSecond: number = 300) {
    const result = CryptoUtils.decryptForDebug(msg, expiresInSecond, false);
    if (Util.isUndefinedOrNull(result)) {
      return null;
    } else {
      if (!Util.isNullOrWhiteSpace(result.text)) {
        return result.text;
      } else {
        return null;
      }
    }
  }

  static decryptForDebug(
    msg: string,
    expiresInSecond: number = 300,
    debug: boolean
  ): { timeStamp: number | null; textTimeStamp: number | null; text: string | null; error: string | null } {
    const result: any = { timeStamp: null, textTimeStamp: null, text: null, error: null };
    if (Util.isNullOrWhiteSpace(msg)) {
      result.error = '字符为空';
      return result;
    }
    if (msg.length < 11 + 32) {
      result.error = '长度太短';
      return result;
    }
    try {
      let timeStamp = 0;
      if (expiresInSecond > 0 || debug) {
        let charToTimeStampMap = CryptoUtils.getCharToTimeStampIntMap()[msg[0]];
        for (let i = 10; i > 0; i--) {
          timeStamp += charToTimeStampMap[msg[i]] * Math.pow(10, 10 - i);
        }
        result.timeStamp = timeStamp;
        if (!debug && Util.getTimeStampInSecond() - timeStamp > expiresInSecond) {
          result.error = '已超时';
          return result;
        }
      }
      const encryptText = msg.substring(11 + 32);
      const decrypted = AES.decrypt(encryptText, CryptoUtils.keyByte, {
        iv: CryptoUtils.ivByte,
        padding: Pkcs7,
      });
      const decryptedText = decrypted.toString(Utf8);
      if (!debug && timeStamp > 0) {
        if (timeStamp.toString() !== decryptedText.substring(0, 10)) {
          result.error = '已超时';
          return result;
        }
      }
      result.textTimeStamp = decryptedText.substring(0, 10);
      result.text = decryptedText.substring(10);
      return result;
    } catch (ex) {
      result.error = `解析报错，${ex}`;
      return result;
    }
  }

  private static getTimeStampInChar(timeStamp: number): string {
    const random = Util.getRandomInt(0, 9);
    let timeStampToCharDic = CryptoUtils.getTimeStampToCharMap()[random];
    const result = [];
    let timeStampStr = timeStamp.toString();
    for (let count = 10; count > 0; count--) {
      let digit = timeStampStr[count - 1];
      let oddOrEven = Util.getRandomInt(0, 1);
      result[count] = timeStampToCharDic[oddOrEven][random + parseInt(digit, 10)];
    }
    result[0] = timeStampToCharDic[Util.getRandomInt(0, 1)][random + random];
    return result.join('');
  }

  /* private static jsStoreEncryptMap: { [key: string]: string };
   private static jsStoreDecryptMap: { [key: string]: string };
   private static getJsStoreEncryptMap() {
     if (Util.isUndefinedOrNull(CryptoUtils.jsStoreEncryptMap)) {
       CryptoUtils.jsStoreEncryptMap = {};
       const charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
       for (let i = 0; i < charMap.length - 1; i++) {
         let newCharIndex = i + 3;
         if (newCharIndex > charMap.length - 2) {
           CryptoUtils.jsStoreEncryptMap[charMap[i]] = charMap[newCharIndex - charMap.length + 1];
         } else {
           CryptoUtils.jsStoreEncryptMap[charMap[i]] = charMap[newCharIndex];
         }
       }
       CryptoUtils.jsStoreEncryptMap['='] = '=';
     }
     return CryptoUtils.jsStoreEncryptMap;
   }
   private static getJsStoreDecryptMap() {
     if (Util.isUndefinedOrNull(CryptoUtils.jsStoreDecryptMap)) {
       CryptoUtils.jsStoreDecryptMap = {};
       const charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
       for (let i = 0; i < charMap.length - 1; i++) {
         let newCharIndex = i - 3;
         if (newCharIndex < 0) {
           CryptoUtils.jsStoreDecryptMap[charMap[i]] = charMap[charMap.length - 1 + newCharIndex];
         } else {
           CryptoUtils.jsStoreDecryptMap[charMap[i]] = charMap[newCharIndex];
         }
       }
       CryptoUtils.jsStoreDecryptMap['='] = '=';
     }
     return CryptoUtils.jsStoreDecryptMap;
   }*/
  static jsStoreEncrypt(msg: any) {
    const timeStamp = Util.getTimeStampInSecond();
    const encodeResultStr: string = Util.base62Encode(
      CryptoUtils.getTimeStampInChar(timeStamp) +
        JsonUtils.stringify({
          value: msg,
        })
    ) as string;
    if (Util.isUndefinedOrNull(encodeResultStr)) {
      return null;
    }
    return encodeResultStr;
  }
  static jsStoreDecrypt(msg: string) {
    if (Util.isNullOrWhiteSpace(msg)) {
      return null;
    }
    if (typeof msg !== 'string') {
      return null;
    }
    let result = Util.base62Decode(msg);
    if (Util.isNullOrWhiteSpace(result)) {
      return null;
    }
    if (result!.length < 12) {
      return null;
    }
    const cacheResult = JsonUtils.parse(result!.substring(11));
    if (Util.isUndefinedOrNull(cacheResult)) {
      return null;
    } else {
      return cacheResult.value;
    }
  }
}
