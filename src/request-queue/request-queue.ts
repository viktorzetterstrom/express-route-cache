export class RequestQueue {
  private queues: Record<string, Array<() => void>> = {};

  init(key: string) {
    this.queues[key] = [];
  }

  add(key: string, requestFunction: () => void) {
    if (!this.queues[key]) this.init(key);

    this.queues[key].push(requestFunction);
  }

  has(key: string) {
    return this.queues[key] !== undefined;
  }

  drain(key: string) {
    if (!this.queues[key]) return false;

    while (this.queues[key].length > 0) {
      this.queues[key].shift()!();
    }
    delete this.queues[key];
    return true;
  }

  flush(key: string) {
    delete this.queues[key];
  }
}
