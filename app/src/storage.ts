import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Book, Reservation, ExecutionLogEntry } from './types';

const KEYS = {
  books: '@readingcoach/books',
  reservation: '@readingcoach/reservation',
  executionLog: '@readingcoach/executionLog',
} as const;

export async function getBooks(): Promise<Book[]> {
  const raw = await AsyncStorage.getItem(KEYS.books);
  return raw ? JSON.parse(raw) : [];
}

export async function saveBooks(books: Book[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.books, JSON.stringify(books));
}

export async function addBook(book: Omit<Book, 'id' | 'createdAt'>): Promise<Book> {
  const list = await getBooks();
  const newBook: Book = {
    ...book,
    id: `book_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  list.push(newBook);
  await saveBooks(list);
  return newBook;
}

export async function getReservation(): Promise<Reservation | null> {
  const raw = await AsyncStorage.getItem(KEYS.reservation);
  return raw ? JSON.parse(raw) : null;
}

export async function saveReservation(r: Reservation | null): Promise<void> {
  await AsyncStorage.setItem(KEYS.reservation, r ? JSON.stringify(r) : '');
}

export async function getExecutionLog(): Promise<ExecutionLogEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.executionLog);
  return raw ? JSON.parse(raw) : [];
}

export async function appendExecutionLog(entry: Omit<ExecutionLogEntry, 'id'>): Promise<void> {
  const log = await getExecutionLog();
  log.push({ ...entry, id: `log_${Date.now()}` });
  await AsyncStorage.setItem(KEYS.executionLog, JSON.stringify(log));
}
