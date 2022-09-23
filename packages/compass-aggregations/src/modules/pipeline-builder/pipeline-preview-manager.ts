import type { DataService } from 'mongodb-data-service';
import type { AggregateOptions, Document } from 'mongodb';
import { aggregatePipeline } from '../../utils/cancellable-aggregation';
import { raceWithAbort } from '../../utils/cancellable-promise';

async function cancellableWait(ms: number, signal: AbortSignal) {
  await raceWithAbort(
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    }),
    signal
  );
}

export class PipelinePreviewManager {
  private queue = new Map<number, AbortController>();
  constructor(private dataService: DataService) {}
  async getPreviewForStage(
    idx: number,
    namespace: string,
    pipeline: Document[],
    options: AggregateOptions = {}
  ): Promise<Document> {
    if (this.queue.has(idx)) {
      this.queue.get(idx)?.abort();
    }
    const controller = new AbortController();
    this.queue.set(idx, controller);
    await cancellableWait(700, controller.signal);
    return await aggregatePipeline({
      dataService: this.dataService,
      signal: controller.signal,
      namespace,
      pipeline,
      options
    });
  }
  clearQueue() {
    this.queue.forEach((controller) => {
      controller.abort();
    });
    this.queue.clear();
  }
}
