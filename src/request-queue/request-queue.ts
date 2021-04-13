export class RequestQueue {
  private queues: Record<string, (() => void)[]> = {};

  add(key: string, requestFunction: () => void) {
    if (!this.queues[key]) return (this.queues[key] = [requestFunction]);

    this.queues[key].push(requestFunction);
  }

  has(key: string) {
    return Boolean(this.queues[key]);
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
