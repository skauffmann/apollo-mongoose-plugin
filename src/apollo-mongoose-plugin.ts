import { ApolloServerPlugin, BaseContext, GraphQLRequestContextWillSendResponse } from 'apollo-server-plugin-base'
import { FormatMongoQuery, formatMongoQueryAsString } from './format-mongo-query'
import { MongooQueryCollector } from './mongo-query-collector'

interface ApolloMongooseExtensionQueryLog {
  executionTimeMS: number
  query: string | Object
}
export interface ApolloMongooseExtension {
  executionTimeMS: number
  queries: ApolloMongooseExtensionQueryLog[]
  queryCount: number
}


interface ApolloMongoosePluginParameters {
  mongoCollector?: MongooQueryCollector
  formatMongoQuery?: FormatMongoQuery
}

export class ApolloMongoosePlugin implements ApolloServerPlugin {
  mongoCollector: MongooQueryCollector
  formatMongoQuery: FormatMongoQuery

  constructor({ mongoCollector, formatMongoQuery }: ApolloMongoosePluginParameters = {}) {
    this.mongoCollector = mongoCollector ?? MongooQueryCollector.getInstance()
    this.formatMongoQuery = formatMongoQuery ?? formatMongoQueryAsString
  }

  requestDidStart() {
    const mongoCollector = this.mongoCollector
    const formatMongoQuery = this.formatMongoQuery
    return {
      willSendResponse(requestContext: GraphQLRequestContextWillSendResponse<BaseContext>) {
        const mongooseExtension: ApolloMongooseExtension = {
          executionTimeMS: mongoCollector.executionTimeMS,
          queries: mongoCollector.queries.map(query => ({
            executionTimeMS: query.executionTimeMS,
            query: formatMongoQuery(query)
          })),
          queryCount: mongoCollector.queries.length
        }
        if (requestContext?.response) {
          requestContext.response.extensions = { ...requestContext.response.extensions, mongooseExtension };
        }

        mongoCollector.reset();
      }
    }
  }
}
