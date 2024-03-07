import * as dayjs from 'dayjs';
export class JsonUtils {
  static parse(text: string | undefined | null) {
    if (typeof text == 'undefined') {
      return null;
    }
    if (text == null) {
      return null;
    }
    try {
      return JSON.parse(text as string);
    } catch {}
    return null;
  }

  static stringify(data: any): string {
    try {
      if (typeof data === 'string') {
        return data;
      }
      return JSON.stringify(data, function (key: string, value: any) {
        // const that: any = this;
        if (this[key] instanceof Date) {
          return dayjs(this[key]).format('YYYY-MM-DD HH:mm');
        }
        return value;
      });
    } catch {}
    return '';
  }
}
