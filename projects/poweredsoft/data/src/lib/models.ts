export interface IAggregate {
    path: string;
    type: string;
}

export interface ISort {
    path: string;
    ascending?: boolean;
}

export interface ISimpleFilter extends IFilter {
    path: string;
    value: any;
}

export interface IQueryResult<TModel> {
    aggregates?: IAggregateResult[];
    data?: TModel[];
}

export interface IQueryExecutionResultPaging {
    totalRecords: number;
    numberOfPages?: number;
}

export interface IQueryExecutionResult<TRecord> extends IQueryResult<TRecord>, IQueryExecutionResultPaging {
}

export interface IQueryExecutionGroupResult<TModel> extends IQueryExecutionResult<TModel> {
    groups: IGroupQueryResult<TModel>[];
}

export interface IQueryCriteria {
    page?: number;
    pageSize?: number;
    sorts?: ISort[];
    groups?: IGroup[];
    aggregates?: IAggregate[];
    filters?: IFilter[];
}

export interface IGroupQueryResult<TModel> extends IQueryResult<TModel> {
    groupPath: string;
    groupValue: any;
    hasSubGroups: boolean;
    subGroups?: IGroupQueryResult<TModel>[];
}

export interface IGroup {
    path: string;
    ascending?: boolean;
}

export interface IFilter {
    type: string;
    and?: boolean;
}

export interface IAggregateResult {
    path: string;
    type: string;
    value: any;
}

export interface ICompositeFilter extends IFilter {
    filters: IFilter[];
}