import { IAdvanceQueryAdapter } from "./IAdvanceQueryAdapter";

export interface IDataSourceQueryAdapterOptions<TModel> {
    adapter: IAdvanceQueryAdapter<any, TModel>;
}
