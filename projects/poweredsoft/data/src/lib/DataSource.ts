import { Observable, of, Observer, BehaviorSubject, throwError, Subject } from 'rxjs';
import { IDataSource } from './IDataSource';
import { IQueryExecutionResult, IQueryExecutionGroupResult, IFilter, ISort, IAggregate, IGroup, IQueryCriteria } from './models';
import { finalize, catchError, map } from 'rxjs/operators';
import { IDataSourceOptions, IResolveCommandModelEvent } from '../public-api';
import { IDataSourceErrorMessage } from './IDataSourceErrorMessage';
import { IDataSourceValidationError } from './IDataSourceValidationError';
import { IDataSourceError } from './IDataSourceError';
import { IDataSourceNotifyMessage } from './IDataSourceNotifyMessage';

export class DataSource<TModel> implements IDataSource<TModel> 
{
    data: IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel> = null;
    
    protected _dataSubject: BehaviorSubject<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>> = new BehaviorSubject(null);
    protected _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    protected _validationSubject: Subject<IDataSourceValidationError> = new Subject();
    protected _notifyMessageSubject: Subject<IDataSourceNotifyMessage> = new Subject();

    protected _data$: Observable<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>>;
    protected _loading$: Observable<boolean>;
    protected _validationError$: Observable<IDataSourceValidationError>;
    protected _notifyMessage$: Observable<IDataSourceNotifyMessage>;
    public manageNotificationMessage: boolean;

    protected _criteria: IQueryCriteria = {
        page: null,
        pageSize: null,
        filters: [],
        aggregates: [],
        groups: [],
        sorts: []
    };

    get data$() {
        if (!this._data$)
            this._data$ = this._dataSubject.asObservable();

        return this._data$;
    }

    get loading$() {
        if (!this._loading$)
            this._loading$ = this._loadingSubject.asObservable();

        return this._loading$;
    }

    get validationError$() {
        if (!this._validationError$)
            this._validationError$ = this._validationSubject.asObservable();

        return this._validationError$;
    }

    get notifyMessage$() {
        if (!this._notifyMessage$)
            this._notifyMessage$ = this._notifyMessageSubject.asObservable();

        return this._notifyMessage$;
    }

    constructor(public options: IDataSourceOptions<TModel>) {
        this._initCriteria();
    }

    protected _initCriteria() {
        if (!this.options.defaultCriteria) 
            return;

        this.manageNotificationMessage = (null == this.options.manageNotificationMessage || !this.options.manageNotificationMessage) ? false : true;

        const copy: IQueryCriteria = JSON.parse(JSON.stringify(this.options.defaultCriteria));
        this._criteria.page = copy.page || this._criteria.page;
        this._criteria.pageSize = copy.pageSize || this._criteria.pageSize;
        this._criteria.filters = copy.filters || this._criteria.filters;
        this._criteria.groups = copy.groups || this._criteria.groups;
        this._criteria.aggregates = copy.aggregates || this._criteria.aggregates;
        this._criteria.sorts = copy.sorts || this._criteria.sorts;
    }

    resolveCommandModelByName<T extends any>(event: IResolveCommandModelEvent<TModel>) : Observable<T> {
        if (!this.options.transport.commands.hasOwnProperty(name))
            return Observable.throw(`command with name ${name} not found`);

        const commandOptions = this.options.transport.commands[name];
        if (commandOptions.resolveCommandModel)
            return commandOptions.resolveCommandModel(event);

        return of<T>(event.model as any as T);
    }

    executeCommandByName<TCommand, TResult>(name: string, command: TCommand) : Observable<TResult> {
        if (!this.options.transport.commands.hasOwnProperty(name))
            return Observable.throw(`command with name ${name} not found`);

        return this.options.transport.commands[name].adapter.handle(command).pipe(
            map(t => {
                let message = `{command} was executed successfully..`;
                if (!this.manageNotificationMessage)
                    message = message.replace('{command}', name);

                this._notifyMessageSubject.next({
                    type: 'success',
                    message: message
                });
                return t;
            }),
            catchError((err: IDataSourceError) => {
                if (err.type == 'message')
                    this._notifyMessageSubject.next({
                        type: 'error',
                        message: (err as IDataSourceErrorMessage).message
                    });
                else if(err.type == 'validation')
                    this._validationSubject.next(err as IDataSourceValidationError);

                return throwError(err);
            })
        );
    }

    private _query() : Observable<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>> {
        return Observable.create((o: Observer<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>>) => {
            this._loadingSubject.next(true);
            this.options.transport.query.adapter.handle(this._criteria)
                .pipe(
                    finalize(() => {
                        o.complete();
                        this._loadingSubject.next(false);
                    })
                )
                .subscribe(
                    result => {
                        this.data = result;
                        o.next(result);
                        this._dataSubject.next(this.data);
                        this._notifyMessageSubject.next({
                            message: 'New data has been read succesfully..',
                            type: 'info'
                        });
                    },
                    err => {
                        o.error(err);
                        this._notifyMessageSubject.next({
                            message: 'Something unexpected as occured during the query',
                            type: 'error'
                        });
                    }
                );
        });
    }

    query<TQuery extends IQueryCriteria>(query: TQuery) {
        this._criteria.page = query.page || this._criteria.page;
        this._criteria.pageSize = query.pageSize || this._criteria.pageSize;
        this._criteria.filters = query.filters || this._criteria.filters;
        this._criteria.groups = query.groups || this._criteria.groups;
        this._criteria.aggregates = query.aggregates || this._criteria.aggregates;
        this._criteria.sorts = query.sorts || this._criteria.sorts;
        return this.refresh();
    }

    refresh() {
        return this._query().subscribe(
            res => {},
            err => {}  
        );
    }

    get sorts() {
        return this._criteria.sorts;
    }

    set sorts(value: ISort[]) {
        this._criteria.sorts = value;
        this.refresh();
    }

    get filters() {
        return this._criteria.filters;
    }

    set filters(value: IFilter[]) {
        this._criteria.filters = value;
        this.refresh();
    }

    get groups() {
        return this._criteria.groups;
    }

    set groups(value: IGroup[]) {
        this._criteria.groups = value;
        this.refresh();
    }

    get aggregates() {
        return this._criteria.aggregates;
    }

    set aggregates(value: IAggregate[]) {
        this._criteria.aggregates = value;
        this.refresh();
    }

    get pageSize() {
        return this._criteria.pageSize;
    }

    set pageSize(value: number) {
        this._criteria.pageSize = value;
        this.refresh();
    }

    get page() {
        return this._criteria.page;
    }

    set page(value: number) {
        this._criteria.page = value;
        this.refresh();
    }
}
