import React, { useCallback, useState } from 'react';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { LibraryView } from './LibraryView';
import type { LibraryItem, ScreenProps } from '../navigation/types';
import { useAsyncFocusEffect } from '../hooks/useAsyncFocusEffect';

export function LibraryScreen({ navigation, route }: ScreenProps<'Library'>) {
  const [books, setBooks] = useState<LibraryItem[]>([]);
  const manualChangePlanDate = route.params?.manualChangePlanDate;
  const manualChangeCurrentBookId = route.params?.manualChangeCurrentBookId;

  const refresh = useCallback(async () => {
    const today = toLocalISODateString(new Date());
    const [list, plan] = await Promise.all([
      persistenceBridge.getBooks(),
      persistenceBridge.getPlanForDate(today),
    ]);
    const rows = list.map((book) => ({
      ...book,
      isFocus: plan?.bookId === book.id,
    }));
    setBooks(rows);
  }, []);

  useAsyncFocusEffect(async (signal) => {
    await refresh();
    if (!signal.alive) return;
  }, [refresh]);

  return (
    <LibraryView
      books={books}
      onPressAddBook={() => navigation.navigate('AddBook')}
      onPressBook={(bookId) =>
        navigation.navigate('BookDetail', {
          bookId,
          manualChangePlanDate,
          manualChangeCurrentBookId,
        })
      }
    />
  );
}
