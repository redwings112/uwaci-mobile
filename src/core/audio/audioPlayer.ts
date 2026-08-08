import { createAudioPlayer } from 'expo-audio';

export function playTemporaryAudio(uri: string): () => void {
  const player = createAudioPlayer(uri);
  player.play();
  return () => {
    player.pause();
    player.release();
  };
}
