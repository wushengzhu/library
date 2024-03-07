import { LocalesConst } from './model';

export class LocaleUtils {
  static validLocales(locales: string) {
    switch (locales) {
      case LocalesConst.EN_US:
        return locales;
      default:
        return LocalesConst.ZH_CN;
    }
  }
}
