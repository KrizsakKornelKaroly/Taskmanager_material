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

  delete(table: string, id: string) {
    return this.http.delete(`${this.server}/${table}/${id}`);
  }

  update(table: string, id: string, data: any) {
    return this.http.patch(`${this.server}/${table}/${id}`, data);
  }

  create(table: string, data: any) {
    return this.http.post(`${this.server}/${table}`, data);
  }
}
