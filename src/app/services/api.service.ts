import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private server = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  selectAll(table: string) {
    return this.http.get(`${this.server}/${table}`);
  }
}
