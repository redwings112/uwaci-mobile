type VoiceTurnCanceller = () => void;

let activeCanceller: VoiceTurnCanceller | null = null;

export function registerVoiceTurnCanceller(canceller: VoiceTurnCanceller | null): void {
  activeCanceller = canceller;
}

export function requestVoiceTurnCancel(): void {
  activeCanceller?.();
}
