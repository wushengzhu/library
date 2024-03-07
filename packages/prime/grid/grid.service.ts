import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class GridService {
  constructor(private http: HttpClient) {}

  getData(url: string, entity?: any, option?) {
    return this.http.post(url, entity).pipe(map((r: any) => r?.Data));
  }
}
