import { CategoryService } from './../../categories/shared/category.service';
import { Injectable, Injector } from '@angular/core';

import { Observable, throwError, } from 'rxjs';
import { map, catchError, flatMap } from 'rxjs/operators';

import { Entry } from './entry.model';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(protected injector: Injector, private categoryService: CategoryService) {
    super("api/entries", injector);
  }

  create(entry: Entry): Observable<Entry>{
    return this.categoryService.getById(entry.categoryId).pipe(
     flatMap(category =>{
        entry.category = category;
        return super.create(entry);
      })
    );  
  }

  update(entry: Entry):  Observable<Entry>{
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
        return super.update(entry);
      })
    );
  }
  
  protected jsonDataToResources(jsonData: any[]): Entry[]{
    const entries: Entry[] = [];
    jsonData.forEach(element => {
      const entry = Entry.fromJson(element);
      entries.push(entry);
    });
    return entries;
  }

  protected jsonDataToResource(jsonData: any): Entry{
    return Entry.fromJson(jsonData);
  }
}