type mseconds = number;

export const wait = (ms: mseconds) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
