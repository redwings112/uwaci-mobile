import { getPipeConfig, PIPE_IDS } from '@/application/navigation/pipes/pipe.config';

describe('Pipe navigation registry', () => {
  it('uses Pipe 0 as the Core Home context', () => {
    const pipe0 = getPipeConfig('pipe0');
    expect(pipe0.defaultRoute).toBe('/(app)');
    expect(pipe0.footer.map((item) => item.id)).toEqual([
      'home',
      'history',
      'saved',
      'discover',
      'menu',
    ]);
  });

  it.each(PIPE_IDS.filter((pipe) => pipe !== 'pipe0'))(
    '%s has contextual navigation with intentional Home and Menu actions',
    (pipe) => {
      const config = getPipeConfig(pipe);
      expect(config.defaultRoute).toEqual({
        pathname: '/(app)/pipe/[pipeId]',
        params: { pipeId: pipe },
      });
      expect(config.footer.map((item) => item.id)).toEqual(['home', 'context', 'menu']);
      expect(config.footer[0]?.destination).toBe('home');
      expect(config.footer.at(-1)?.destination).toBe('menu');
    },
  );
});
