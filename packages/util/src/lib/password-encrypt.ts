import * as sm2 from 'gm-sm/src/sm2';

export class PasswordEncrypt {
  constructor() {}

  static sm2Encrypt(msg: string): string {
    // tslint:disable-next-line:max-line-length
    const publicKey =
      '046DEC23DA498A129DB79C8A6CFF6C5E3B884D3F09E6F5EA20A8C108F6AA5E707FF5553772A27DBE832F308EC9087803A88D383C85E64332EB9B39A33AFD1F767D';
    const cipher = sm2.doEncrypt(msg, publicKey, 0);
    return cipher;
  }
}
