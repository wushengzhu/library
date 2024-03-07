import { HttpParams } from '@angular/common/http';
import { Util } from './utils';
export class Serialize {
  static BuildParametersFromSearch<T>(obj: T): HttpParams {
    let params = new HttpParams();

    if (obj == null) {
      return params;
    }
    params = Serialize.PopulateSearchParams(params, '', obj);
    return params;
  }

  private static PopulateArray<T>(params: HttpParams, prefix: string, val: Array<T>): HttpParams {
    for (let index = 0; index < val.length; index++) {
      const key = prefix + '[' + index + ']';
      const value: any = val[index];
      params = Serialize.PopulateSearchParams(params, key, value);
    }
    return params;
  }

  private static PopulateObject<T>(params: HttpParams, prefix: string, val: T): HttpParams {
    const objectKeys = Object.keys(val) as Array<keyof T>;

    if (prefix) {
      prefix = prefix + '.';
    }

    for (const objKey of objectKeys) {
      const value = val[objKey];
      const key = prefix + objKey;

      params = Serialize.PopulateSearchParams(params, key, value);
    }
    return params;
  }

  private static PopulateSearchParams(params: HttpParams, key: string, value: any): HttpParams {
    if (value instanceof Array) {
      return Serialize.PopulateArray(params, key, value);
    } else if (value instanceof Date) {
      return params.set(key, value.toISOString());
    } else if (value instanceof Object) {
      return Serialize.PopulateObject(params, key, value);
    } else {
      if (value != null) {
        return params.set(key, value.toString());
      } else {
        return params;
      }
    }
  }
  static queryToJson(query: string): any {
    const qm = query.indexOf('?');
    if (qm !== -1) {
      query = query.substring(qm + 1);
    }
    const param = query.split('&');
    const result: any = {};
    for (const p of param) {
      const o = p.split('=');
      result[o[0]] = o[1];
    }
    return result;
  }

  static JsonToFormDataObject(data: object | Array<any>) {
    const result = {};
    if (Util.isUndefinedOrNull(data)) {
      return result;
    }
    Serialize.PopulateFormDataObject(result, '', data);
    return result;
  }

  private static PopulateFormDataObject(result: any, key: string, value: any) {
    if (value instanceof Array) {
      Serialize.PopulateFormDataObjectArray(result, key, value);
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (value instanceof Object) {
      Serialize.PopulateFormDataObjectObject(result, key, value);
    } else {
      if (value != null) {
        result[key] = value.toString();
      }
    }
  }

  private static PopulateFormDataObjectArray<T>(result: any, prefix: string, val: Array<T>) {
    for (let index = 0; index < val.length; index++) {
      const key = prefix + '[' + index + ']';
      const value: any = val[index];
      Serialize.PopulateFormDataObject(result, key, value);
    }
  }

  private static PopulateFormDataObjectObject<T>(result: object, prefix: string, val: T) {
    const objectKeys = Object.keys(val) as Array<keyof T>;

    if (prefix) {
      prefix = prefix;
    }

    for (const objKey of objectKeys) {
      const value = val[objKey];
      const key = prefix + '[' + objKey + ']';

      Serialize.PopulateFormDataObject(result, key, value);
    }
  }
}
