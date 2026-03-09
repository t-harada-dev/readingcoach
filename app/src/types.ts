export type Book = {
  id: string;
  title: string;
  author?: string;
  createdAt: string; // ISO
};

export type Reservation = {
  bookId: string;
  scheduledAt: string; // ISO (date + time)
};

export type ExecutionMode = '15min' | '5min' | '1page';

export type ExecutionLogEntry = {
  id: string;
  bookId: string;
  mode: ExecutionMode;
  executedAt: string; // ISO
};
