import { QueryLog } from "./mongo-query-collector"
import { Operations } from "./operations"

const OperationSignatures = {
  FilterFieldsOptions: [Operations.Find, Operations.FindOne],
  FilterOptions: [Operations.FindOneAndDelete, Operations.FindOneAndRemove, Operations.DeleteOne, Operations.DeleteMany],
  FilterUpdateOptions: [Operations.FindOneAndUpdate, Operations.Update, Operations.UpdateMany, Operations.UpdateOne],
  Filter: [Operations.Count, Operations.CountDocuments, Operations.EstimatedDocumentCount],

}

export type FormatMongoQuery = (query: QueryLog) => string | Object

export function formatMongoQueryAsString(query: QueryLog): string {
  const prefix = `db.getCollection('${query.collectionName}').${query.operation}`
  if (OperationSignatures.FilterFieldsOptions.includes(query.operation)) {
    return `${prefix}(${JSON.stringify(query.filter)}, ${JSON.stringify(query.fields)}, ${JSON.stringify(query.options)})`
  }
  if (OperationSignatures.FilterOptions.includes(query.operation)) {
    return `${prefix}(${JSON.stringify(query.filter)}, ${JSON.stringify(query.options)})`
  }
  if (OperationSignatures.FilterUpdateOptions.includes(query.operation)) {
    return `${prefix}(${JSON.stringify(query.filter)}, ${JSON.stringify(query.update)}, ${JSON.stringify(query.options)})`
  }
  if (OperationSignatures.Filter.includes(query.operation)) {
    return `${prefix}(${JSON.stringify(query.filter)})`
  }
  return `${prefix}
    filter: ${JSON.stringify(query.filter)},
    fields: ${JSON.stringify(query.fields)},
    update: ${JSON.stringify(query.update)},
    options: ${JSON.stringify(query.options)}`
}
