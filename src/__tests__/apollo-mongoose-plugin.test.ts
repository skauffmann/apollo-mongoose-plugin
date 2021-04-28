// @ts-nocheck
import { ApolloMongoosePlugin } from "../apollo-mongoose-plugin"
import { MongooQueryCollector } from "../mongo-query-collector"

describe('ApolloMongoosePlugin', () => {
  test('extends graphql response with mongooseExtension', async () => {
    const plugin = new ApolloMongoosePlugin({ formatMongoQuery: (query) => query })
    const request = plugin.requestDidStart()
    const requestContext = { response: {} }

    request.willSendResponse(requestContext)

    expect(requestContext.response.extensions.mongooseExtension).toEqual({
      "executionTimeMS": 0,
      "queries": [],
      "queryCount": 0,
    })
  })

  test('mongooseExtension contains find query', async () => {
    const plugin = new ApolloMongoosePlugin({ formatMongoQuery: (query) => query })
    const request = plugin.requestDidStart()
    const query = {
      executionTimeMS: 3,
      collectionName: 'fakes',
      filter: { name: 'Peter' },
      fields: {},
      options: {},
      operation: 'find',
    }
    MongooQueryCollector.getInstance().addQuery(query)
    const requestContext = { response: {} }

    request.willSendResponse(requestContext)

    expect(requestContext.response.extensions.mongooseExtension).toEqual({
      executionTimeMS: 3,
      queries: [{
        executionTimeMS: 3,
        query
      }],
      queryCount: 1,
    })
  })
})
