import { useRouter } from 'expo-router';

import { ThinkingScreen } from '@/features/voice/components/ThinkingScreen';
import { requestVoiceTurnCancel } from '@/features/voice/voiceTurnControl';
import { useAppSelector } from '@/store/hooks';

export default function ThinkingRoute() {
  const router = useRouter();
  const thinking = useAppSelector((state) => state.voice.thinking);
  const activeStage =
    thinking.activeStage === 'transcribing'
      ? 0
      : thinking.activeStage === 'reasoning'
        ? 1
        : thinking.completed.reasoning != null
          ? 2
          : 0;
  const elapsedByStage = [
    thinking.completed.transcribing != null
      ? Math.round(thinking.completed.transcribing / 1000)
      : null,
    thinking.completed.reasoning != null ? Math.round(thinking.completed.reasoning / 1000) : null,
  ];
  return (
    <ThinkingScreen
      activeStage={activeStage}
      elapsedByStage={elapsedByStage}
      onCancel={() => {
        requestVoiceTurnCancel();
        if (router.canGoBack()) router.back();
      }}
    />
  );
}
