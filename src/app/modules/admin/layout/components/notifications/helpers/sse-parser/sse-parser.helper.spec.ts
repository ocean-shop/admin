import { NOTIFICATION_SSE_EVENTS } from '../../constants/notifications.constants';
import { parseNotificationEvent, parseSseMessage, splitSseBuffer } from './sse-parser.helper';

describe('sse-parser helper', () => {
  describe('parseSseMessage', () => {
    it('reads the event name and joins multi-line data', () => {
      expect(parseSseMessage('event: notification\nid: 1\ndata: {"a":\ndata: 1}')).toEqual({
        event: 'notification',
        data: '{"a":\n1}',
      });
    });

    it('defaults the event name to "message" and keeps values without a leading space', () => {
      expect(parseSseMessage('data:raw')).toEqual({ event: 'message', data: 'raw' });
    });

    it('skips comments and fields without a colon', () => {
      expect(parseSseMessage(': ping\nretry\ndata: x')).toEqual({ event: 'message', data: 'x' });
    });

    it('returns null when the block has no data', () => {
      expect(parseSseMessage(': keep-alive')).toBeNull();
      expect(parseSseMessage('event: heartbeat')).toBeNull();
    });
  });

  describe('splitSseBuffer', () => {
    it('returns complete messages and keeps the unfinished tail', () => {
      const chunk = splitSseBuffer('event: a\ndata: 1\n\nevent: b\ndata: 2\n\nevent: c\nda');

      expect(chunk.messages).toEqual([
        { event: 'a', data: '1' },
        { event: 'b', data: '2' },
      ]);
      expect(chunk.rest).toBe('event: c\nda');
    });

    it('normalizes CRLF line endings and drops empty blocks', () => {
      const chunk = splitSseBuffer('data: 1\r\n\r\n: comment\r\n\r\n');

      expect(chunk.messages).toEqual([{ event: 'message', data: '1' }]);
      expect(chunk.rest).toBe('');
    });
  });

  describe('parseNotificationEvent', () => {
    it('parses the notification payload', () => {
      const item = { id: 'n1', shopId: 's1', type: 'order_created' };

      expect(
        parseNotificationEvent({
          event: NOTIFICATION_SSE_EVENTS.NOTIFICATION,
          data: JSON.stringify(item),
        }),
      ).toEqual(item);
    });

    it('ignores other events', () => {
      expect(
        parseNotificationEvent({ event: NOTIFICATION_SSE_EVENTS.HEARTBEAT, data: '{}' }),
      ).toBeNull();
    });

    it('ignores malformed JSON and objects without id/shopId', () => {
      const event = NOTIFICATION_SSE_EVENTS.NOTIFICATION;

      expect(parseNotificationEvent({ event, data: '{oops' })).toBeNull();
      expect(parseNotificationEvent({ event, data: '{"id":"n1"}' })).toBeNull();
      expect(parseNotificationEvent({ event, data: 'null' })).toBeNull();
    });
  });
});
