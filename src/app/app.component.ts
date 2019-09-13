import { Component, OnInit, Pipe } from '@angular/core';
import { IDataSource } from 'projects/poweredsoft/data/src/lib/IDataSource';
import { IDataSourceNotifyMessage } from 'projects/poweredsoft/data/src/lib/IDataSourceNotifyMessage';
import { DataSource, IDataSourceTransportOptions, IDataSourceQueryAdapterOptions, IQueryCriteria, IQueryExecutionResult, IQueryExecutionGroupResult, IDataSourceCommandAdapterOptions } from 'projects/poweredsoft/data/src/public-api';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

export interface MyModel {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'data';
  message: string = '';
  type: string = '';

  dataSource: IDataSource<any>;
  createCommand: IDataSourceCommandAdapterOptions<MyModel>;
  
  public constructor(private http: HttpClient) {

  }

  ngOnInit(): void {
    const keyResolver = (m: MyModel) => m.id;
    let route = 'http://localhost:9999';

    const query: IDataSourceQueryAdapterOptions<MyModel> = {
      adapter: {
          handle: (criteria: IQueryCriteria) => {
              const queryRoute = `${route}/read`;
              return this.http.post<IQueryExecutionResult<MyModel> & IQueryExecutionGroupResult<MyModel>>(queryRoute, criteria);
          }
      }
  };

  this.createCommand = {
      adapter: {
          handle: (command: MyModel) => {
              return of(command);
              //return this.http.post<MyModel>(route, command);
          }
      }
  };

  const updateCommand: IDataSourceCommandAdapterOptions<MyModel> = {
      adapter: {
          handle: (command: MyModel) => {
              const key = keyResolver(command);
              const updateRoute = `${route}/${encodeURIComponent(key as any)}`;
              return of(command);
          }
      }
  };

  const deleteCommand: IDataSourceCommandAdapterOptions<MyModel> = {
      adapter: {
          handle: (command: MyModel) => {
              const key = keyResolver(command);
              const updateRoute = `${route}/${encodeURIComponent(key as any)}`;
              return of(command);
          }
      }
  };

  const transportOptions : IDataSourceTransportOptions<MyModel> = {
      query: query,
      commands: {
          'create': this.createCommand,
          'update': updateCommand,
          'delete': deleteCommand
      }
  };
    this.dataSource = new DataSource<MyModel>({
      manageNotificationMessage: false,
      transport: transportOptions,
      defaultCriteria: {
        page: 1,
        pageSize: 5,
        groups: [
          { path: 'name' }
        ]
      }
    });

    this.dataSource.notifyMessage$.subscribe((notifyMessage: IDataSourceNotifyMessage) => {
      this.handleNotification(notifyMessage);
    });
  }

  handleNotification(notification: IDataSourceNotifyMessage) {
    this.message = notification.message;
  }

  onDoSomething() {
    this.dataSource.executeCommandByName('create', this.createCommand).subscribe(() => {
      console.log('hey we did it!');
    });
    //this.dataSource.refresh();
  }
}
