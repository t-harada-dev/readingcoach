# Batch 8 - Completion Remaining / CMP Remaining Gaps

目的:
アップロード済みの tsundoku_test_spec_20260310_v2.docx と既存 gap notes に沿って、
Completion Flow の残ギャップを取り切る。
今回は CMP の未完了部分を、Detox E2E と integration に適切に分担して実装する。

背景:
既に自動化済み:
- CMP-01: rehab 状態で SC-15 から閉じるでホーム復帰
- CMP-02/03: 追加 5分/15分セッション開始
- CMP-04/05/06/07: progress opt-in 表示 / 設定画面遷移 / skip / 保存ボタン押下可能
- CMP-08: daily_result_recomputed の upgrade only（integration）
- CMP-09: 読了導線から SC-19 遷移
- CMP-10: 次本指名時の翌日計画反映（integration）

残ギャップ:
- CMP-01 の normal / restart 分岐を明示的に取り切れていない
- CMP-07 の保存後結果を UI 遷移だけでなく integration で補完したい
- 読了保存失敗時の UI リカバリ導線が未自動化
- 次本指名後のホーム反映を E2E でも押さえたい
- Completion 関連 flaky の最終安定化をしたい

今回の作業範囲:
1. CMP-01 normal / restart 分岐を追加自動化
2. CMP-07 保存結果を integration で補完
3. finished_book 保存失敗時の UI/状態分岐を integration または最小 E2E で確認
4. CMP-10 を E2E でも最終ユーザー可視結果まで押さえる
5. 既存 Completion 系 flaky を最小修正で安定化
6. 不要なリファクタは禁止

今回カバーしたいケース:

## TC-CMP-01N
前提:
- normal state
- SC-15 表示
操作:
- 閉じる
期待:
- SC-04 へ戻る
主要確認点:
- normal 完了後の戻り先

## TC-CMP-01R
前提:
- restart state（continuous_missed_days >= 7）
- SC-15 表示
操作:
- 閉じる
期待:
- SC-07 へ戻る
主要確認点:
- restart 完了後の戻り先

## TC-CMP-07I
前提:
- progress tracking setup 保存可能状態
操作:
- 総ページ数 / 現在ページ 保存
期待:
- Book.pageCount / Book.currentPage 更新
- progressTrackingEnabled / promptShown の状態整合
主要確認点:
- UI 遷移ではなく保存結果の truth source を integration で担保

## TC-CMP-09F
前提:
- SC-15
- finished_book 保存で 1 回失敗を fault inject
操作:
- 読了した
- 必要なら retry
期待:
- セッション完了自体は巻き戻らない
- 読了状態更新のみ再試行対象
- 二重完了にならない
主要確認点:
- 読了保存失敗時の局所リカバリ

## TC-CMP-10E
前提:
- SC-19
- 次本候補あり
操作:
- 次の本を選ぶ
期待:
- ホームへ戻る
- FocusCore に次の本が反映
主要確認点:
- ユーザー可視結果まで E2E で確認

追加してほしい testID:
A. CompletionScreen / SC-15
- completion-screen
- completion-close
- completion-extra-5m
- completion-extra-15m
- completion-finished-book

B. ProgressTrackingSetupScreen / SC-17
- progress-setup-screen
- progress-setup-page-count
- progress-setup-current-page
- progress-setup-save

C. NextFocusNomination / SC-19
- next-focus-screen
- next-focus-book-row-<stable-id>
- next-focus-confirm

D. FocusCore
- focus-core-screen
- focus-core-book-title

推奨 test file:
- e2e/completion-return.e2e.js
- e2e/next-focus-visible.e2e.js
- src/useCases/__tests__/ProgressTrackingSave.integration.test.ts
- src/useCases/__tests__/FinishedBookFailure.integration.test.ts
- docs/testing/completion-final-gap-notes.md

重要な実装方針:
- 画面遷移は Detox
- 保存結果 / 冪等性 / fault injection は integration
- `prep_success` を progress 増分に使わない
- finished_book 保存失敗で session completion を巻き戻さない
- result upgrade only の前提を壊さない
- screen 層に test 用 if 分岐を増やさない

仕様の参照ポイント:
- SC-15: 閉じる / 5分 / 15分 / 読了
- SC-15 の戻り先は SC-04 / SC-06 / SC-07
- SC-16: 初回完了かつ progress tracking 未設定時のみ表示
- SC-17: 保存成功 -> SC-15 またはホーム
- SC-19: 次の本を選ぶ -> ホームへ
- `daily_result_recomputed`: result は格上げのみ
- progress tracking は opt-in
- `progress_self_reported` は finished_book のみ
- 読了保存失敗時もセッション完了自体は確定済み

受け入れ条件:
1. CMP-01 normal / restart の戻り先が自動化される
2. CMP-07 保存結果が integration で担保される
3. finished_book 保存失敗時の局所リカバリが確認できる
4. CMP-10 を E2E でホーム表示まで確認できる
5. 既存 CMP ケースを壊さない
6. flaky を増やさない

禁止事項:
- 文言依存を主軸にすること
- progress tracking を必須導線に変えること
- finished_book 保存失敗で session 完了を取り消すこと
- extra session の result を格下げすること

作業後に出してほしい内容:
- 変更差分要約
- 実装した TC ID 一覧
- 追加 testID 一覧
- integration で担保した保存結果一覧
- 残ったギャップ
- 実行コマンド
  - npm run e2e:build:ios
  - npm run e2e:test:ios
  - npm test

---

# Batch 8 - Test Case List

参照:
- tsundoku_test_spec_20260310_v2.docx
- 既存 completion-flow-gap-notes.md

## 対象 TC

### TC-CMP-01N
- 前提: normal state, SC-15
- 操作: 閉じる
- 期待: SC-04
- レイヤ: E2E
- 優先度: 高

### TC-CMP-01R
- 前提: restart state, SC-15
- 操作: 閉じる
- 期待: SC-07
- レイヤ: E2E
- 優先度: 高

### TC-CMP-07I
- 前提: SC-17 保存可能
- 操作: pageCount/currentPage 保存
- 期待:
  - Book.pageCount 更新
  - Book.currentPage 更新
  - progress tracking 状態整合
- レイヤ: integration
- 優先度: 高

### TC-CMP-09F
- 前提: finished_book 保存を1回失敗 inject
- 操作: 読了 -> retry
- 期待:
  - session completion は維持
  - 読了状態更新のみ再試行
  - 二重完了なし
- レイヤ: integration
- 優先度: 高

### TC-CMP-10E
- 前提: SC-19, 候補本あり
- 操作: 次の本を選ぶ
- 期待:
  - ホームへ戻る
  - FocusCore に次本反映
- レイヤ: E2E
- 優先度: 高

## 推奨実装順
1. TC-CMP-01N
2. TC-CMP-01R
3. TC-CMP-10E
4. TC-CMP-07I
5. TC-CMP-09F

## 補足
- CMP-07 の保存後戻り先 UI は flaky なら厳密確認を integration に寄せる
- CMP-09F は UI エラーメッセージ可視性より、完了の巻き戻しがないことを優先確認