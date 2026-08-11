export const MAX_RECORDING_SECONDS = 120;
export const VOICE_FILE_NAME = 'uwaci-question.m4a';
// FastAPI validates this exact MIME for .m4a uploads. `audio/m4a` is common
// in clients but is not part of the backend allowlist.
export const VOICE_MIME_TYPE = 'audio/x-m4a';
