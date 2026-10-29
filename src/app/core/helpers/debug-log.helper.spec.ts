import { logDebug } from './debug-log.helper';

describe('logDebug', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it('logs a scoped message without data', () => {
    logDebug('Scope', 'hello');

    expect(debugSpy).toHaveBeenCalledWith('[Scope] hello');
  });

  it('logs a scoped message with data', () => {
    const data = { status: 401 };

    logDebug('Scope', 'failed', data);

    expect(debugSpy).toHaveBeenCalledWith('[Scope] failed', data);
  });
});
