import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect } from 'chai';

import { PipelineStorage } from './pipeline-storage';

const createPipeline = (tmpDir, data) => {
  fs.writeFileSync(
    path.join(tmpDir, 'SavedPipelines', `${data.id}.json`),
    JSON.stringify(data)
  );
};

describe('PipelineStorage', function () {
  let tmpDir;
  let pipelineStorage;
  beforeEach(function () {
    tmpDir = fs.mkdtempSync(os.tmpdir());
    fs.mkdirSync(path.join(tmpDir, 'SavedPipelines'));
    pipelineStorage = new PipelineStorage(tmpDir);
  });

  afterEach(function () {
    fs.rmdirSync(tmpDir, { recursive: true });
  });

  it('should read saved pipelines', async function () {
    let aggregations = await pipelineStorage.loadAll();
    expect(aggregations).to.have.length(0);

    const data = [
      {
        id: 1234567,
        name: 'hello',
        namespace: 'db.hello',
      },
      {
        id: 7654321,
        name: 'world',
        namespace: 'db.hello',
      },
    ];
    createPipeline(tmpDir, data[0]);
    createPipeline(tmpDir, data[1]);

    aggregations = await pipelineStorage.loadAll();

    expect(aggregations).to.have.length(2);

    expect(aggregations[0]).to.have.property('lastModified');
    expect(aggregations[1]).to.have.property('lastModified');

    expect(aggregations[0].pipelineText).to.equal('[]');
    expect(aggregations[1].pipelineText).to.equal('[]');

    // Remove lastModified
    aggregations.map((x) => {
      delete x.lastModified;
      delete x.pipelineText;
      return x;
    });

    expect(aggregations.find((x) => x.id === data[0].id)).to.deep.equal(
      data[0]
    );
    expect(aggregations.find((x) => x.id === data[1].id)).to.deep.equal(
      data[1]
    );
  });

  it('should update a pipeline', async function () {
    const data = {
      id: 1234567890,
      name: 'hello',
      namespace: 'airbnb.users',
    };
    createPipeline(tmpDir, data);

    let aggregations = await pipelineStorage.loadAll();

    expect(aggregations).to.have.length(1);
    // loads lastModified from the file stats as well.
    delete aggregations[0].lastModified;
    delete aggregations[0].pipelineText;
    expect(aggregations[0]).to.deep.equal(data);

    const updatedAggregation = await pipelineStorage.updateAttributes(data.id, {
      name: 'updated',
      namespace: 'airbnb.users',
    });

    aggregations = await pipelineStorage.loadAll();
    expect(aggregations).to.have.length(1);
    delete aggregations[0].lastModified;
    delete aggregations[0].pipelineText;
    expect(aggregations[0], 'updates in storage').to.deep.equal({
      ...data,
      name: 'updated',
    });

    delete updatedAggregation.lastModified;
    delete updatedAggregation.pipelineText;
    expect(updatedAggregation, 'returns updated pipeline').to.deep.equal({
      ...data,
      name: 'updated',
    });
  });

  it('should delete a pipeline', async function () {
    const data = {
      id: 1234567890,
      name: 'hello',
      namespace: 'airbnb.users',
    };
    createPipeline(tmpDir, data);

    let aggregations = await pipelineStorage.loadAll();

    expect(aggregations).to.have.length(1);
    expect(aggregations[0].id).to.equal(data.id);
    expect(aggregations[0].name).to.equal(data.name);

    await pipelineStorage.delete(data.id);

    aggregations = await pipelineStorage.loadAll();
    expect(aggregations).to.have.length(0);
  });
});
