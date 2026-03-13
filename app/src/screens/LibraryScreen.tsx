import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { persistenceBridge, type BookDTO } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { LibraryView } from './LibraryView';

type LibraryItem = BookDTO & { isFocus: boolean };

export function LibraryScreen({ navigation, route }: any) {
  const [books, setBooks] = useState<LibraryItem[]>([]);
  const manualChangePlanDate = route?.params?.manualChangePlanDate as string | undefined;
  const manualChangeCurrentBookId = route?.params?.manualChangeCurrentBookId as string | undefined;

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

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await refresh();
        if (!alive) return;
      })();
      return () => {
        alive = false;
      };
    }, [refresh])
  );

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
