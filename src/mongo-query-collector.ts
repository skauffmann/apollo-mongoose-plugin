import { Schema } from "mongoose";
import { Operations } from "./operations";

export interface QueryLog {
  operation: string
  collectionName: string
  executionTimeMS: number
  filter: Object | null
  fields: Object | null
  options: any
  update: Object | null
}

class NativeError extends global.Error { }
export interface QueryHook<T extends Document = any> {
  (this: T, next: (err?: NativeError) => void): void;
}

export class MongooQueryCollector {
  static instance: MongooQueryCollector;
  executionTimeMS: number = 0;
  queries: QueryLog[] = []

  private constructor() {
    this.initializeData();
  }

  initializeData() {
    this.executionTimeMS = 0;
    this.queries = [];
  }

  reset() {
    this.initializeData();
  }

  addQuery(queryLog: QueryLog) {
    this.executionTimeMS += queryLog.executionTimeMS;
    this.queries.push(queryLog);
    return this;
  }

  static getInstance(): MongooQueryCollector {
    if (!MongooQueryCollector.instance) {
      MongooQueryCollector.instance = new MongooQueryCollector();
    }

    return MongooQueryCollector.instance;
  }

  private getPreQueryHook(): QueryHook {
    return function () {
      this._startTime = Date.now();
    };
  }

  private getPostQueryHook(): QueryHook {
    const instance = this
    return function () {
      const queryLog: QueryLog = {
        executionTimeMS: Date.now() - this._startTime,
        collectionName: this._collection.collectionName,
        filter: this._conditions,
        fields: this._fields,
        options: { ...this._options, ...this.options },
        operation: this.op,
        update: this._update,
      }
      instance.addQuery(queryLog)
    };
  }

  registerMongooseHooks(schema: Schema) {
    Object.values(Operations).forEach((operation: string) => {
      // @ts-ignore
      schema.pre(operation, this.getPreQueryHook());
      schema.post(operation, this.getPostQueryHook());
    })
  }
}
