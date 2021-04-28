import { Schema } from "mongoose";
import { MongooQueryCollector } from "./mongo-query-collector";

export function mongoCollectorPlugin(schema: Schema) {
  const queryCollector: MongooQueryCollector = MongooQueryCollector.getInstance()
  queryCollector.registerMongooseHooks(schema)
}
