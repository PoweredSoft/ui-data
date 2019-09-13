import { Observable } from "rxjs";
import { ISort, IFilter, IGroup, IAggregate, IQueryExecutionResult, IQueryExecutionGroupResult, IQueryCriteria } from "./models";
import { IResolveCommandModelEvent } from "./IResolveCommandModelEvent";
import { IDataSourceValidationError } from './IDataSourceValidationError';
import { IDataSourceNotifyMessage } from './IDataSourceNotifyMessage';

export interface IDataSource<TModel>
{
    resolveCommandModelByName<T extends any>(event: IResolveCommandModelEvent<TModel>) : Observable<T>;
    executeCommandByName<TCommand, TResult>(name: string, command: TCommand) : Observable<TResult>;
    query<TQuery extends IQueryCriteria>(query: TQuery);
    refresh();

    data$: Observable<IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>>;
    loading$: Observable<boolean>;
    validationError$: Observable<IDataSourceValidationError>;
    notifyMessage$: Observable<IDataSourceNotifyMessage>;

    data: IQueryExecutionResult<TModel> & IQueryExecutionGroupResult<TModel>;

    sorts: ISort[];
    filters: IFilter[];
    groups: IGroup[];
    aggregates: IAggregate[];
    pageSize: number;
    page: number;
}