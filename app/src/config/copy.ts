import type { SessionMode } from '../useCases/StartSessionUseCase';

export const copy = {
  focusCore: {
    headerMessage: 'さあ始めましょう。\n今日の15分が明日の知性になります。',
    todaySessionLabel: '今日のセッション',
    coverFallbackTitle: 'Today',
    changeBookLink: '本を切り替える',
    openLibraryLink: 'ライブラリを開く',
    supportCopyForIgnition: 'まずは1分。再点火だけで、流れは戻せます。',
    supportCopyForNormal: '今日の15分が、思考の筋力になります。',
    loading: '準備中…',
    initError: '初期化に失敗しました。再起動してください。',
    performanceMentorQuotes: [
      {
        text: 'すべての良書を精読することは、過去の最も優れた人々と会話をすることと同じである。',
        author: 'ルネ・デカルト',
      },
      {
        text: '私たちは、繰り返し行っていることそのものである。ゆえに卓越とは、単なる行為ではなく、習慣である。',
        author: 'アリストテレス',
      },
      {
        text: '山を動かす者は、まず小さな石を運び出すことから始める。',
        author: '孔子',
      },
      {
        text: '知るだけでは不十分だ。活用しなければならない。意志があるだけでは不十分だ。実行しなければならない。',
        author: 'ゲーテ',
      },
      {
        text: '他人の書いたもので自分を向上させなさい。他人が苦労して手に入れたものを、あなたは容易に手に入れることができる。',
        author: 'ソクラテス',
      },
      {
        text: '今から20年後、あなたは「やったこと」よりも「やらなかったこと」にずっと失望することになる。',
        author: 'マーク・トウェイン',
      },
      {
        text: '人生は短いのではない。私たちがそれを浪費しているのだ',
        author: 'セネカ',
      },
    ],
    cta: {
      startSession15m: '15分のセッション開始',
      ignition1m: '今日は1分だけにする',
    },
  },
  activeSession: {
    caption: '集中の時間',
    completed: '完了',
    backToHome: 'ホームへ戻る',
  },
  completion: {
    elapsedPrefix: '実行時間',
    ctaExtra5m: 'もう 5 分やる',
    ctaExtra15m: 'もう 15 分やる',
    ctaFinishedBook: '読了した',
    ctaClose: '閉じる / ホームへ戻る',
  },
  dueAction: {
    title: '今、どう始めますか',
    subtitle: '今日の1冊にすぐ戻れる選択だけを表示します',
    ctaStart: '開始',
    cta5m: '5分だけ',
    ctaSnooze: '30分延期',
  },
  focusBookPicker: {
    title: '本を切り替える',
    subtitle: '今日は「手元にある1冊」に寄せましょう',
    selectedMark: '選択中',
  },
  addBook: {
    labelTitle: 'タイトル',
    placeholderTitle: '本のタイトル',
    labelAuthorOptional: '著者（任意）',
    placeholderAuthor: '著者名',
    labelPageCountOptional: '総ページ数（任意）',
    placeholderPageCount: '例: 320',
    labelCoverUrlOptional: '表紙画像を追加（任意）',
    placeholderCoverUrl: 'https://...',
    ctaAddAndBack: '追加して戻る',
  },
  library: {
    title: 'ライブラリ',
    subtitle: '保存済みの本を編集・切り替えできます',
    ctaAddBook: '本を追加する',
    empty: 'まだ本がありません',
    focusBadge: 'Focus Book',
  },
  bookDetail: {
    subtitle: '保存後編集の主戦場',
    labelTitle: 'タイトル',
    labelAuthor: '著者',
    labelPageCount: '総ページ数',
    labelCurrentPage: '現在ページ',
    labelCoverUrl: '表紙画像URL',
    ctaSave: '保存する',
    ctaSetFocusBook: 'Focus Book にする',
    ctaEnableProgress: '進捗バーを有効化する',
    ctaDisableProgress: '進捗バーを無効化する',
    progressDisabled: '進捗バーは現在 OFF です（任意機能）',
    saved: '保存しました',
    saveError: '保存に失敗しました',
  },
  reserve: {
    emptyAddBookFirst: '本を先に追加してください',
    back: '戻る',
    labelTomorrowBook: '明日読む1冊',
    labelTime: '時刻',
    notifyAtSuffix: 'に通知',
    ctaReserve: '予約する',
    presets: [
      { label: '7:00', h: 7, m: 0 },
      { label: '12:00', h: 12, m: 0 },
      { label: '21:00', h: 21, m: 0 },
      { label: '22:00', h: 22, m: 0 },
    ],
  },
  notifications: {
    readNowTitle: '今すぐ読む',
  },
  navigation: {
    focusCoreTitle: '今日のセッション',
    focusBookPickerTitle: '本を切り替える',
    activeSessionTitle: '執行',
    completionTitle: '完了',
    nextFocusNominationTitle: '次の1冊',
    dueActionTitle: '開始オプション',
    reserveTitle: '明日の予約',
    addBookTitle: '本を追加',
    libraryTitle: 'ライブラリ',
    bookDetailTitle: '本詳細',
  },
  persistence: {
    mockSeedBooks: [
      {
        id: 'mock_book_1',
        title: '積読コーチ (Mock)',
        author: 'ReadingCoach',
        pageCount: 220,
        format: 'paper',
        status: 'active',
      },
      {
        id: 'mock_book_2',
        title: 'たった1分の再点火 (Mock)',
        author: 'ReadingCoach',
        pageCount: 120,
        format: 'paper',
        status: 'queued',
      },
    ],
  },
} as const;

export function sessionModeLabel(mode: SessionMode): string {
  switch (mode) {
    case 'ignition_1m':
      return copy.focusCore.cta.ignition1m;
    case 'rescue_5m':
      return '5分だけ読む';
    case 'rehab_3m':
      return '3分再開';
    case 'normal_15m':
    default:
      return copy.focusCore.cta.startSession15m;
  }
}

export function dailyPerformanceMentorQuote(dateISO: string): { text: string; author: string } {
  const quotes = copy.focusCore.performanceMentorQuotes;
  const seed = dateISO.split('-').join('');
  const numericSeed = Number(seed);
  const index = Number.isFinite(numericSeed) ? numericSeed % quotes.length : 0;
  return quotes[index];
}
