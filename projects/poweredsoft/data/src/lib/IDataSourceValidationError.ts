import { IDataSourceError } from './IDataSourceError';

export interface IDataSourceValidationError extends IDataSourceError
{
    errors: { [field: string]: string[]; }
}