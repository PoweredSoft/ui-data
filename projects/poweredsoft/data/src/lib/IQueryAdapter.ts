import { Observable } from 'rxjs';
export interface IQueryAdapter<TQuery, TResult> {
    handle(query: TQuery): Observable<TResult>;
}
