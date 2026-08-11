import { File, Paths } from 'expo-file-system';

export interface HistoryEntry {
  conversationId: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface SavedAnswer {
  id: string;
  conversationId: string;
  messageId: string;
  content: string;
  createdAt: string;
}

interface LibraryData {
  history: HistoryEntry[];
  saved: SavedAnswer[];
}

const libraryFile = new File(Paths.document, 'uwaci-library.json');
const emptyLibrary: LibraryData = { history: [], saved: [] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    isRecord(value) &&
    typeof value.conversationId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.preview === 'string' &&
    typeof value.updatedAt === 'string'
  );
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
    if (!libraryFile.exists) return emptyLibrary;
    const value: unknown = await libraryFile.json();
    if (!isRecord(value)) return emptyLibrary;
    const history = Array.isArray(value.history) ? value.history.filter(isHistoryEntry) : [];
    const saved = Array.isArray(value.saved) ? value.saved.filter(isSavedAnswer) : [];
    return { history, saved };
  } catch {
    return emptyLibrary;
  }
}

async function writeLibrary(data: LibraryData): Promise<void> {
  try {
    if (!libraryFile.exists) libraryFile.create({ intermediates: true });
    libraryFile.write(JSON.stringify(data));
  } catch {
    // Local library is an enhancement; failed persistence must not block chat.
  }
}

export async function listHistory(): Promise<HistoryEntry[]> {
  return (await readLibrary()).history.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function recordHistory(entry: HistoryEntry): Promise<void> {
  const data = await readLibrary();
  const next = [entry, ...data.history.filter((item) => item.conversationId !== entry.conversationId)];
  await writeLibrary({ ...data, history: next.slice(0, 50) });
}

export async function listSavedAnswers(): Promise<SavedAnswer[]> {
  return (await readLibrary()).saved.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function isAnswerSaved(messageId: string): Promise<boolean> {
  return (await readLibrary()).saved.some((item) => item.messageId === messageId);
}

export async function toggleSavedAnswer(input: Omit<SavedAnswer, 'id'>): Promise<boolean> {
  const data = await readLibrary();
  const existing = data.saved.some((item) => item.messageId === input.messageId);
  const saved = existing
    ? data.saved.filter((item) => item.messageId !== input.messageId)
    : [{ ...input, id: `saved-${input.messageId}` }, ...data.saved].slice(0, 100);
  await writeLibrary({ ...data, saved });
  return !existing;
}
