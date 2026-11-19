/** One Server-Sent Events message: its `event:` name and joined `data:` lines. */
export type SseMessage = {
  event: string;
  data: string;
};

/** Complete messages found in a stream buffer plus the unfinished tail to keep. */
export type SseChunk = {
  messages: SseMessage[];
  rest: string;
};
