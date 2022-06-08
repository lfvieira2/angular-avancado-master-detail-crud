import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Entry } from './entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntryService {
  private apiPath: string = "api/entries";

  constructor(private http: HttpClient) { }

  getAll(): Observable<Entry[]> {
    return this.http.get(this.apiPath).pipe(
      catchError(this.handlerError),
      map(this.jsonDataToEntries)
    )
  }

  getById(id: number): Observable<Entry> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handlerError),
      map(this.jsonDataToEntry)
    )
  }

  create(entry: Entry): Observable<Entry>{
    return this.http.post(this.apiPath, entry).pipe(
      catchError(this.handlerError),
      map(this.jsonDataToEntry)
    )
  }

  update(entry: Entry):  Observable<Entry>{
    const url = `${this.apiPath}/${entry.id}`;

    return this.http.put(url, entry).pipe(
      catchError(this.handlerError),
      map(() => entry)
    )
  }

  delete(id: number): Observable<any>{
    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handlerError),
      map(() => null)
    )
  }

  // Private methods

  private jsonDataToEntries(jsonData: any[]): Entry[]{
    const entries: Entry[] = [];
    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element);
      entries.push(entry);
    });
    return entries;
  }

  private jsonDataToEntry(jsonData: any): Entry{
    return Object.assign(new Entry(), jsonData);
  }

  private handlerError(error: any): Observable<any>{
    console.log('Erro na requisição => ', error);
    return throwError(error);
  }
}
