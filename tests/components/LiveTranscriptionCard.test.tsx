import { render } from '@testing-library/react-native';

import { LiveTranscriptionCard } from '@/features/voice/components/LiveTranscriptionCard';

describe('LiveTranscriptionCard', () => {
  it('shows the placeholder and listening status while recording', () => {
    const screen = render(
      <LiveTranscriptionCard
        listening
        placeholder="Your words will appear here once you stop speaking."
        reduceMotion
        statusLabel="Listening · 3s"
        transcript={null}
      />,
    );

    expect(screen.getByText('Live transcription')).toBeTruthy();
    expect(screen.getByText('Your words will appear here once you stop speaking.')).toBeTruthy();
    expect(screen.getByText('Listening · 3s')).toBeTruthy();
  });

  it('shows the transcript and drops the listening status once recording stops', () => {
    const screen = render(
      <LiveTranscriptionCard
        listening={false}
        placeholder="Your words will appear here once you stop speaking."
        reduceMotion
        statusLabel="Listening · 3s"
        transcript="Explique-moi comment je peux kobanda business."
      />,
    );

    expect(screen.getByText('Explique-moi comment je peux kobanda business.')).toBeTruthy();
    expect(screen.queryByText('Listening · 3s')).toBeNull();
  });
});
