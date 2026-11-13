import {
  NOTIFICATION_SSE_DEFAULT_EVENT,
  NOTIFICATION_SSE_EVENTS,
  NOTIFICATION_SSE_FIELDS,
  NOTIFICATION_SSE_LINE_ENDING_PATTERN,
  NOTIFICATION_SSE_LINE_SEPARATOR,
  NOTIFICATION_SSE_MESSAGE_SEPARATOR,
} from '../../constants/notifications.constants';
import { NotificationApiItem } from '../../models/notification-api.model';
import { SseChunk, SseMessage } from '../../models/sse-message.model';

/** `field: value` → [field, value]; a single space after the colon is not part of the value. */
const splitSseLine = (line: string): [string, string] => {
  const colon = line.indexOf(':');
  if (colon < 0) {
    return [line, ''];
  }

  const value = line.slice(colon + 1);
  return [line.slice(0, colon), value.startsWith(' ') ? value.slice(1) : value];
};

/** Parses one message block; comment-only or data-less blocks give `null`. */
export const parseSseMessage = (block: string): SseMessage | null => {
  let event: string = NOTIFICATION_SSE_DEFAULT_EVENT;
  const data: string[] = [];

  for (const line of block.split(NOTIFICATION_SSE_LINE_SEPARATOR)) {
    if (!line || line.startsWith(':')) {
      continue;
    }

    const [field, value] = splitSseLine(line);
    if (field === NOTIFICATION_SSE_FIELDS.EVENT) {
      event = value;
    } else if (field === NOTIFICATION_SSE_FIELDS.DATA) {
      data.push(value);
    }
  }

  return data.length ? { event, data: data.join(NOTIFICATION_SSE_LINE_SEPARATOR) } : null;
};

/** Splits a stream buffer into complete messages; the unfinished tail is returned as `rest`. */
export const splitSseBuffer = (buffer: string): SseChunk => {
  const blocks = buffer
    .replace(NOTIFICATION_SSE_LINE_ENDING_PATTERN, NOTIFICATION_SSE_LINE_SEPARATOR)
    .split(NOTIFICATION_SSE_MESSAGE_SEPARATOR);
  const rest = blocks.pop() ?? '';
  const messages = blocks
    .map(parseSseMessage)
    .filter((message): message is SseMessage => message !== null);

  return { messages, rest };
};

const isNotificationApiItem = (value: unknown): value is NotificationApiItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as NotificationApiItem).id === 'string' &&
  typeof (value as NotificationApiItem).shopId === 'string';

/** The notification carried by a `notification` event; heartbeats and malformed data give `null`. */
export const parseNotificationEvent = (message: SseMessage): NotificationApiItem | null => {
  if (message.event !== NOTIFICATION_SSE_EVENTS.NOTIFICATION) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(message.data);
    return isNotificationApiItem(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
