export interface IDataSourceNotifyMessage {
    type: 'warning' | 'info' | 'success' | 'error';
    message: string;
}
