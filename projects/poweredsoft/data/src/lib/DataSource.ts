import { Observable, of } from 'rxjs';
import { IDataSource } from './IDataSource';
import { IQueryExecutionResult, IQueryExecutionGroupResult, IFilter, ISort, IAggregate, IGroup, IQueryCriteria } from './models';
import { IDataSourceOptions } from './IDataSourceOptions';
import { IResolveCommandModelEvent } from './IResolveCommandModelEvent';

export class DataSource<TModel> implements IDataSource<TModel> 
{
    data: IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel> = null;
    
    protected _page: number = 0;
    protected _pageSize: number = 0;
    protected _filters: IFilter[] = [];
    protected _sorts: ISort[] = [];
    protected _aggregates: IAggregate[] = [];
    protected _groups: IGroup[] = [];

    constructor(public options: IDataSourceOptions<TModel>) {

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

    query<TQuery extends IQueryCriteria>(query: TQuery) : Observable<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>> {
        return this.options.transport.query.adapter.handle(query);
    }

    public refresh() {
        return this.query({
            sorts: this._sorts,
            filters: this._filters,
            groups: this._groups,
            aggregates: this._aggregates,
            pageSize: this._pageSize,
            page: this._page
        });
    }

    get sorts() {
        return this._sorts;
    }

    set sorts(value: ISort[]) {
        this._sorts = value;
        this.refresh();
    }

    get filters() {
        return this._filters;
    }

    set filters(value: IFilter[]) {
        this._filters = value;
        this.refresh();
    }

    get groups() {
        return this._groups;
    }

    set groups(value: IGroup[]) {
        this._groups = value;
        this.refresh();
    }

    get aggregates() {
        return this._aggregates;
    }

    set aggregates(value: IAggregate[]) {
        this._aggregates = value;
        this.refresh();
    }

    get pageSize() {
        return this._pageSize;
    }

    set pageSize(value: number) {
        this._pageSize = value;
        this.refresh();
    }

    get page() {
        return this._page;
    }

    set page(value: number) {
        this._page = value;
        this.refresh();
    }
}
