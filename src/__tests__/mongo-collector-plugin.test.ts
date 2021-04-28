import mongoose from 'mongoose';
import { mongoCollectorPlugin } from '../mongo-collector-plugin';
import { MongooQueryCollector } from '../mongo-query-collector'

const MONGODB_URI = (global as any).MONGODB_URI ?? 'mongodb://localhost/database'

describe('MongooQueryCollector', () => {
  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });
    }
  });

  afterAll(async (done) => {
    await mongoose.connection.close();
    done()
  });

  const mongoCollector = MongooQueryCollector.getInstance()
  const fakeSchema = new mongoose.Schema({
    name: String
  });
  fakeSchema.index({ name: 1 });
  fakeSchema.plugin(mongoCollectorPlugin);

  const FakeModel = mongoose.model('fake', fakeSchema);

  beforeEach(() => {
    mongoCollector.reset()
  })

  test('reset method should erase previous data', async () => {
    await FakeModel.find({ name: 'Peter' }),
      expect(mongoCollector.queries.length).toEqual(1)

    mongoCollector.reset()

    expect(mongoCollector.queries.length).toEqual(0)
  })

  test('collects find request', async () => {
    await FakeModel.find({ name: 'Peter' })

    expect(mongoCollector.queries.length).toEqual(1)
    expect(mongoCollector.queries[0]).toEqual({
      executionTimeMS: expect.anything(),
      collectionName: 'fakes',
      filter: { name: 'Peter' },
      fields: {},
      options: {},
      operation: 'find',
    })
  })

  test('computes global execution time', async () => {
    await Promise.all([
      await FakeModel.find({ name: 'Peter' }),
      await FakeModel.find({ name: 'Michel' }),
    ])

    const expectedExecutionTimeMS = mongoCollector.queries.reduce((globalExecutionTimeMs, { executionTimeMS }) => globalExecutionTimeMs + executionTimeMS, 0)
    expect(mongoCollector.executionTimeMS).toEqual(expectedExecutionTimeMS)
  })
})
