import { IDataSourceQueryAdapterOptions } from "./IDataSourceQueryAdapterOptions";
import { IDataSourceCommandAdapterOptions } from "./IDataSourceCommandAdapterOptions";
import { IQueryCriteria } from "./models";


export interface IDataSourceOptions<TModel> {
    transport: IDataSourceTransportOptions<TModel>;
    idField?: string;
    resolveIdField?: (model: TModel) => any;
    defaultCriteria: IQueryCriteria;
}

export interface IDataSourceTransportOptions<TModel> {
    query: IDataSourceQueryAdapterOptions<TModel>;
    commands: {
        [name: string]: IDataSourceCommandAdapterOptions<TModel>;
    };
}