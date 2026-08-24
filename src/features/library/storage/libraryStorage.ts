import { File, Paths } from 'expo-file-system';

import { AppError } from '@/core/errors/AppError';
import { i18n } from '@/localization';

export interface SavedAnswer {
  id: string;
  conversationId: string;
  messageId: string;
  content: string;
  createdAt: string;
}

interface LibraryData {
  savedByUser: Record<string, SavedAnswer[]>;
}

const libraryFile = new File(Paths.document, 'uwaci-library.json');

function emptyLibrary(): LibraryData {
  return { savedByUser: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSavedAnswer(value: unknown): value is SavedAnswer {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.conversationId === 'string' &&
    typeof value.messageId === 'string' &&
    typeof value.content === 'string' &&
    typeof value.createdAt === 'string'
  );
}

async function readLibrary(): Promise<LibraryData> {
  try {
    if (!libraryFile.exists) return emptyLibrary();
    const value: unknown = await libraryFile.json();
    if (!isRecord(value) || !isRecord(value.savedByUser)) return emptyLibrary();
    const savedByUser: Record<string, SavedAnswer[]> = {};
    for (const [userId, entries] of Object.entries(value.savedByUser)) {
      if (Array.isArray(entries)) savedByUser[userId] = entries.filter(isSavedAnswer);
    }
    return { savedByUser };
  } catch (error: unknown) {
    throw new AppError('STORAGE_ERROR', i18n.t('errors.savedRead'), true, undefined, {
      cause: error instanceof Error ? error.name : 'unknown',
    });
  }
}

async function writeLibrary(data: LibraryData): Promise<void> {
  try {
    if (!libraryFile.exists) libraryFile.create({ intermediates: true });
    libraryFile.write(JSON.stringify(data));
  } catch (error: unknown) {
    throw new AppError('STORAGE_ERROR', i18n.t('errors.savedWrite'), true, undefined, {
      cause: error instanceof Error ? error.name : 'unknown',
    });
  }
}

export async function listSavedAnswers(userId: string): Promise<SavedAnswer[]> {
  return [...((await readLibrary()).savedByUser[userId] ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function isAnswerSaved(userId: string, messageId: string): Promise<boolean> {
  return ((await readLibrary()).savedByUser[userId] ?? []).some(
    (item) => item.messageId === messageId,
  );
}

export async function toggleSavedAnswer(
  userId: string,
  input: Omit<SavedAnswer, 'id'>,
): Promise<boolean> {
  const data = await readLibrary();
  const current = data.savedByUser[userId] ?? [];
  const existing = current.some((item) => item.messageId === input.messageId);
  const saved = existing
    ? current.filter((item) => item.messageId !== input.messageId)
    : [{ ...input, id: `saved-${input.messageId}` }, ...current].slice(0, 100);
  await writeLibrary({ savedByUser: { ...data.savedByUser, [userId]: saved } });
  return !existing;
}
