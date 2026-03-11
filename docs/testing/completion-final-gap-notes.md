# Completion Final Gap Notes (Batch 8)

## 対象
- `docs/testing/e2e_batch8_cr&cmp-remaining.md`
- CMP-01 / CMP-07 / CMP-09 / CMP-10 の残ギャップ

## 今回追加した自動化

### E2E
- `app/e2e/completion-return.e2e.js`
  - TC-CMP-01N: SC-15 `閉じる` -> SC-04（`focus-core-screen`）
  - TC-CMP-01R: restart 条件で SC-15 `閉じる` -> SC-07（`restart-recovery-screen`）
- `app/e2e/next-focus-visible.e2e.js`
  - TC-CMP-10E: SC-19 次本確定後にホーム可視（`focus-core-open-library`）かつ `focus-core-book-title` 反映を確認
- `app/e2e/finished-book-recovery.e2e.js`
  - TC-CMP-09F(UI): `finished_book` 保存1回失敗後に SC-15 残留 + エラー表示 + 再試行で SC-19 遷移を確認

### Integration
- `app/src/useCases/__tests__/ProgressTrackingSave.integration.test.ts`
  - TC-CMP-07I: 保存後に `settings` / `book(pageCount,currentPage)` が更新されることを検証
- `app/src/useCases/__tests__/FinishedBookFailure.integration.test.ts`
  - TC-CMP-09F: `finished_book` 保存失敗時も completion は巻き戻らず、読了更新のみ再試行対象であることを検証

## 追加した testID
- `restart-recovery-screen` (`RestartRecoveryScreen`)

## 実装メモ
- `FocusCoreScreen` は当日 plan が `finalized` の場合、翌日 plan（`state != finalized`）があれば表示対象を翌日へ切替
  - 目的: SC-19 次本確定直後にユーザー可視のホーム反映を担保

## 残ギャップ
- Completion Batch 8 対象（CMP-01N/01R/07I/09F/10E）としては追加ギャップなし
- Native Acceptance（割り込み通知、OS権限ダイアログ、バックグラウンド復帰競合）は Batch 9 ドキュメント管理範囲
