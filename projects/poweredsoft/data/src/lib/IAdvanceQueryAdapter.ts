import { IQueryCriteria, IQueryExecutionResult, IQueryExecutionGroupResult } from './models';
import { IQueryAdapter } from "./IQueryAdapter";
export interface IAdvanceQueryAdapter<TQuery extends IQueryCriteria, TResult> extends IQueryAdapter<TQuery, IQueryExecutionResult<TResult> & IQueryExecutionGroupResult<TResult>> {
}
