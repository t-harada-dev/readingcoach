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
  - TC-CMP-10E (minimal E2E): SC-19 次本確定操作（`next-focus-confirm`）が実行可能

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
- TC-CMP-10E の「確定後ホーム表示まで」のE2E確認は環境依存で不安定（confirm 後の遷移待機が flaky）
  - 今回は SC-19 の確定操作までを E2E で担保し、保存整合は integration で担保
- 読了保存失敗時の UI エラーメッセージ可視性（文言/表示位置）自体のE2E確認は未追加
  - 今回は状態整合（巻き戻し禁止・再試行対象の局所化）を優先
