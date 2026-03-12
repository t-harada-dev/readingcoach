import React, { useEffect, useState } from 'react';

import { persistenceBridge } from '../bridge/PersistenceBridge';
import { runFindPlanByIdUseCase } from '../useCases/FindPlanUseCase';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { runSnoozePlanUseCase } from '../useCases/SnoozePlanUseCase';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { DueActionSheetView } from './DueActionSheetView';

type Params = {
    planId: string;
    defaultMode: 'normal_15m' | 'ignition_1m';
    entryPoint?: 'notification' | 'app';
    dueActionScreenId?: 'SC-23';
};

export function DueActionSheetScreen({ navigation, route }: any) {
    const { planId, defaultMode, entryPoint } = (route.params ?? {}) as Params;
    const [busy, setBusy] = useState(false);
    const [bookTitle, setBookTitle] = useState('今日のFocus Book');
    const [bookAuthor, setBookAuthor] = useState<string | undefined>(undefined);
    const [bookThumbnailUrl, setBookThumbnailUrl] = useState<string | undefined>(undefined);
    const [bookCoverSource, setBookCoverSource] = useState<'manual' | 'google_books' | 'placeholder'>('placeholder');
    const [hasSelectedBook, setHasSelectedBook] = useState(true);

    useEffect(() => {
        let alive = true;
        if (!planId) return () => { alive = false; };

        void (async () => {
            const plan = await runFindPlanByIdUseCase(planId);
            if (!alive || !plan) {
                setHasSelectedBook(false);
                return;
            }
            const book = await persistenceBridge.getBook(plan.bookId);
            if (!alive || !book) {
                setHasSelectedBook(false);
                setBookTitle('読む本が未設定です');
                setBookAuthor(undefined);
                setBookThumbnailUrl(undefined);
                setBookCoverSource('placeholder');
                return;
            }
            setBookTitle(book.title || '今日のFocus Book');
            setBookAuthor(book.author);
            setBookThumbnailUrl(book.thumbnailUrl);
            setBookCoverSource(book.coverSource ?? (book.thumbnailUrl ? 'google_books' : 'placeholder'));
            setHasSelectedBook(true);
        })();

        return () => {
            alive = false;
        };
    }, [planId]);

    const onStart = async (mode: 'normal_15m' | 'ignition_1m' | 'rescue_5m') => {
        if (!planId || busy || !hasSelectedBook) return;
        setBusy(true);
        try {
            const started = await runStartSessionUseCase({
                planId,
                mode,
                entryPoint: entryPoint === 'notification' ? 'notification' : 'app',
            });
            navigation.replace('ActiveSession', buildActiveSessionRouteParams({ started, mode }));
        } finally {
            setBusy(false);
        }
    };

    return (
        <DueActionSheetView
            busy={busy}
            defaultMode={defaultMode ?? 'normal_15m'}
            bookTitle={bookTitle}
            bookAuthor={bookAuthor}
            bookThumbnailUrl={bookThumbnailUrl}
            bookCoverSource={bookCoverSource}
            hasSelectedBook={hasSelectedBook}
            onPressStart={onStart}
            onPressResolveBook={() => {
                navigation.navigate('Library');
            }}
            onPressSnooze={async () => {
                if (!planId || busy) return;
                setBusy(true);
                try {
                    await runSnoozePlanUseCase(planId, 30);
                    navigation.goBack();
                } finally {
                    setBusy(false);
                }
            }}
        />
    );
}
