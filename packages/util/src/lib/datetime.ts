import { Util } from './utils';
import * as dayjs from 'dayjs';

export const dateReg = /^((1[89]\d{2})|([2-9]\d{3}))[\/\-.](\d{1,2})[\/\-.](\d{1,2})([T\s]?\S*)?/;

export class Datetime {
  /**
   * 按格式输出日期字符串
   */
  static formatDate(date: dayjs.ConfigType, formatStr: string): string {
    return dayjs(date).format(formatStr);
  }
  static toDate(data: { [key: string]: any }) {
    if (!Util.isUndefinedOrNull(data)) {
      const datas = Object.assign({}, data);
      for (const d of Object.keys(datas)) {
        // 严格判断是否是date
        if (dateReg.test(data[d])) {
          datas[d] = new Date(data[d]);
        }
      }
      return datas;
    }
    return null;
  }

  static isDateTime(value: string) {
    if (!Util.isNullOrWhiteSpace(value) && dateReg.test(value)) {
      return true;
    }
    return false;
  }
}
