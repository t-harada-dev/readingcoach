import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Book, ExecutionLogEntry, ExecutionMode, Reservation } from './types';
import * as storage from './storage';
import { selectTodayBook } from './selectTodayBook';

type State = {
  books: Book[];
  reservation: Reservation | null;
  log: ExecutionLogEntry[];
  todayBook: Book | null;
  reservedTime: Date | null; // today's or tomorrow's slot for display
};

type Actions = {
  refresh: () => Promise<void>;
  addBook: (title: string, author?: string) => Promise<Book>;
  setReservation: (bookId: string, scheduledAt: Date) => Promise<void>;
  clearReservation: () => Promise<void>;
  recordExecution: (bookId: string, mode: ExecutionMode) => Promise<void>;
};

const initialState: State = {
  books: [],
  reservation: null,
  log: [],
  todayBook: null,
  reservedTime: null,
};

const AppContext = createContext<State & Actions | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  const refresh = useCallback(async () => {
    const [books, reservation, log] = await Promise.all([
      storage.getBooks(),
      storage.getReservation(),
      storage.getExecutionLog(),
    ]);
    const todayBook = selectTodayBook(books, log, reservation?.bookId ?? null);
    const reservedTime = reservation ? new Date(reservation.scheduledAt) : null;
    setState({ books, reservation, log, todayBook, reservedTime });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBook = useCallback(async (title: string, author?: string) => {
    const book = await storage.addBook({ title, author });
    await refresh();
    return book;
  }, [refresh]);

  const setReservation = useCallback(async (bookId: string, scheduledAt: Date) => {
    await storage.saveReservation({ bookId, scheduledAt: scheduledAt.toISOString() });
    await refresh();
  }, [refresh]);

  const clearReservation = useCallback(async () => {
    await storage.saveReservation(null);
    await refresh();
  }, [refresh]);

  const recordExecution = useCallback(async (bookId: string, mode: ExecutionMode) => {
    await storage.appendExecutionLog({ bookId, mode, executedAt: new Date().toISOString() });
    await refresh();
  }, [refresh]);

  const value: State & Actions = {
    ...state,
    refresh,
    addBook,
    setReservation,
    clearReservation,
    recordExecution,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
