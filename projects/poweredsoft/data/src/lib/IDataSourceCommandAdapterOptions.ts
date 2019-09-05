import { Observable } from "rxjs";
import { ICommandAdapter } from "./ICommandAdapter";
import { IResolveCommandModelEvent } from "./IResolveCommandModelEvent";
export interface IDataSourceCommandAdapterOptions<TModel> {
    adapter: ICommandAdapter<any, any>;
    resolveCommandModel?: (event: IResolveCommandModelEvent<TModel>) => Observable<any>;
}
