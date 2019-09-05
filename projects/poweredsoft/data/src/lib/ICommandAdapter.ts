import { Observable } from 'rxjs';
export interface ICommandAdapter<TCommand, TResult> {
    handle(command: TCommand): Observable<TResult>;
}
