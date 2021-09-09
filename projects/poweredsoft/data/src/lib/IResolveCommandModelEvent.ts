export interface IResolveCommandModelEvent<TModel> {
    command: string;
    model: TModel;
    params?: any;
}