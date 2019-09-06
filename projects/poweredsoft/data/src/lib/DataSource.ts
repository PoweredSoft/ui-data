import { Observable, of, Observer, BehaviorSubject } from 'rxjs';
import { IDataSource } from './IDataSource';
import { IQueryExecutionResult, IQueryExecutionGroupResult, IFilter, ISort, IAggregate, IGroup, IQueryCriteria } from './models';
import { finalize } from 'rxjs/operators';
import { IDataSourceOptions, IResolveCommandModelEvent } from '../public-api';

export class DataSource<TModel> implements IDataSource<TModel> 
{
   
    data: IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel> = null;
    
    protected _dataSubject: BehaviorSubject<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>> = new BehaviorSubject(null);
    protected _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    protected _data$: Observable<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>>;
    protected _loading$: Observable<boolean>;

    // TODO: Validation error subject
    // TODO: Message error subject

    protected _criteria: IQueryCriteria = {
        page: null,
        pageSize: null,
        filters: [],
        aggregates: [],
        groups: [],
        sorts: []
    };

    get data$() {
        return this._data$;
    }

    get loading$() {
        return this._loading$;
    }

    constructor(public options: IDataSourceOptions<TModel>) {
        this._initCriteria();
        this._initSubjectObservables();
    }

    protected _initCriteria() {

        if (!this.options.defaultCriteria) 
            return;

        const copy: IQueryCriteria = JSON.parse(JSON.stringify(this.options.defaultCriteria));
        this._criteria.page = copy.page || this._criteria.page;
        this._criteria.pageSize = copy.pageSize || this._criteria.pageSize;
        this._criteria.filters = copy.filters || this._criteria.filters;
        this._criteria.groups = copy.groups || this._criteria.groups;
        this._criteria.aggregates = copy.aggregates || this._criteria.aggregates;
        this._criteria.sorts = copy.sorts || this._criteria.sorts;
    }

    protected _initSubjectObservables() {
        this._loading$ = this._loadingSubject.asObservable();
        this._data$ = this._dataSubject.asObservable();
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

        return this.options.transport.commands[name].adapter.handle(command);
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
                        this._dataSubject.next(this.data);
                        o.next(result)
                    },
                    err => o.error(err)
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
