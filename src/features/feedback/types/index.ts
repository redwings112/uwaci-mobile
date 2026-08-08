export type FeedbackCategory =
  | 'helpful'
  | 'not_helpful'
  | 'transcription_problem'
  | 'wrong_language'
  | 'incorrect_answer'
  | 'audio_problem';

export interface FeedbackRequest {
  conversation_id: string;
  message_id?: string;
  category: FeedbackCategory;
  comment?: string;
}
