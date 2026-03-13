# 積読コーチ テスト計画書（現況基準）

**更新日**: 2026-03-13  
**対象**: React Native Expo アプリ (iOS)  
**テストフレームワーク**: Vitest / Jest / Detox / Xcode UI Test

---

## 1. 完了判定ルール（今回）

今回の計画は「新規構築」ではなく、現行実装に合わせた**再基準化**と**未完了クローズ**を目的とする。

- `FocusBookPickerScreen` は再導入しない（既存導線へ統合済みのため `N/A`）
- CI 必須は `unit + typecheck + iOS E2E`（snapshot 差分必須化は今回は対象外）
- 手動テストは「実施そのもの」ではなく「運用可能状態の整備」をもって完了

---

## 2. 現況カバレッジとギャップ（再基準化後）

### 2.1 主要レイヤー

| レイヤー | 状態 | 実行コマンド |
|---|---|---|
| ユニット/ロジック (Vitest) | ✅ 運用中 | `cd app && npm run test` |
| 型チェック (TypeScript) | ✅ 運用中 | `cd app && npm run typecheck` |
| E2E フロー (Detox) | ✅ 運用中 | `cd app && npm run e2e:test:ios` |
| UI スナップショット (Detox + Native) | ✅ 構築済み | `cd app && npm run e2e:capture:flows` / `npm run e2e:capture:docs` |

### 2.2 旧ギャップ項目の再評価

| 項目 | ユニット | E2E | スナップショット | 判定 |
|---|---|---|---|---|
| ReserveScreen | - | N/A（専用E2E未作成） | - | 現行スコープ外 |
| TimeChangeScreen | - | N/A（専用E2E未作成） | - | 現行スコープ外 |
| FocusBookPickerScreen | - | N/A（legacy導線） | - | 監視のみ |
| RestartRecoveryScreen | ✅ (`RestartRecoveryScreen.test.ts`) | N/A（専用E2E未作成） | - | ユニット維持 |
| Onboarding / AddBook / Library導線 | - | ✅（`onboarding-flow`, `add-book-flow`, `library-detail`） | - | 完了 |
| Surface導線（通知/Widget/App Intent） | - | ✅（`surface-*`） | - | 完了 |

---

## 3. TASKステータス（TASK-01〜06）

| TASK | 内容 | 現在ステータス | 根拠 |
|---|---|---|---|
| TASK-01 | ReserveScreen E2E | N/A（再基準化） | 現行 `npm run e2e:test:ios` 対象外 |
| TASK-02 | TimeChangeScreen E2E | N/A（再基準化） | 現行 `npm run e2e:test:ios` 対象外 |
| TASK-03 | FocusBookPickerScreen E2E | N/A | legacy導線・監視のみ |
| TASK-04 | RestartRecoveryScreen E2E | N/A（再基準化） | 画面ユニットは `RestartRecoveryScreen.test.ts` で維持 |
| TASK-05 | 現行E2E基盤の安定運用 | ✅ 完了 | `npm run e2e:build:ios` / `npm run e2e:test:ios` 実測 pass |
| TASK-06 | 最低限の画面/導線回帰 | ✅ 完了 | `screenPolicy.test.ts` + `RestartRecoveryScreen.test.ts` + Detox 17 suites |

---

## 4. 完了エビデンス

| 区分 | コマンド | 日付 | 終了コード | 失敗件数 | 補足 |
|---|---|---|---:|---:|---|
| 型 + ユニット | `cd app && npm run check` | 2026-03-13 | 0 | 0 | Vitest `30 files / 79 tests` + typecheck pass |
| E2E ビルド | `cd app && npm run e2e:build:ios` | 2026-03-13 | 0 | 0 | `BUILD SUCCEEDED` |
| E2E 全体（最新） | `cd app && npm run e2e:test:ios` | 2026-03-13 | 0 | 0 | Detox `17 suites / 50 tests` pass |

---

## 5. 作業指示書（回帰運用版）

### Phase 1: ベースライン検証（継続運用）

1. `cd app && npm run check`
2. `cd app && npm run e2e:test:ios`
3. 失敗時は `.xcresult` / Detox artifacts で原因分類（実装回帰・テスト不安定・環境）

### Phase 2: E2E回帰維持（新規作成ではなく保守）

1. `onboarding-flow` / `add-book-flow` / `library-detail` / `home.*` を回帰対象として維持
2. 失敗時は testID 契約と launchArgs 契約を優先確認
3. `surface-*` と `due-*` は通知/ウィジェット導線の要として優先監視する

### Phase 3: testID契約維持

1. 既存 testID を変更する場合は E2E と snapshot を同一PRで更新
2. `onboarding-*`, `add-book-*`, `library-*`, `focus-core-*`, `due-*` は互換維持を原則とする

### Phase 4: スナップショット運用

1. `cd app && npm run e2e:capture:flows`
2. 必要時 `cd app && npm run e2e:capture:docs`
3. `cd app && npm run e2e:snapshot:manifest:check` で定義ずれを検知

### Phase 5: ユニット回帰維持

1. `screenPolicy.test.ts` / `RestartRecoveryScreen.test.ts` / `DueActionSheetScreen.test.ts` / `CompletionScreen.test.ts` を保守対象に維持
2. 画面仕様変更時は同PRで期待値更新

### Phase 6: CI運用（必須）

- PR 必須チェック
  - `check`（unit + typecheck）
  - `e2e-ios`（detox build + detox test）
- snapshot 差分は将来拡張（今回は必須化しない）

---

## 6. 手動テスト（運用完了）

### 6.1 位置づけ

手動検証は「自動化不可領域のリリース前ゲート」として運用する。  
**今回の完了条件は手順と記録テンプレート整備完了**であり、実施自体は各リリース時に行う。

### 6.2 リリース前ゲート対象

- アニメーション体感
- 触覚フィードバック（実機）
- 通知表示/遷移
- Live Activity / Dynamic Island
- ウィジェット遷移
- キーボード挙動
- 日付またぎ・時刻変更などのエッジケース

### 6.3 実施記録テンプレート

```md
## 手動テスト実施記録
- 実施日:
- 実施者:
- 端末/OS:
- 対象ビルド:
- 結果: PASS / FAIL / PARTIAL
- 失敗項目:
- 証跡リンク: (動画 / スクリーンショット / チケット)
- 備考:
```

---

## 7. 最終到達状態（この計画のDone）

- `TEST_PLAN.md` に未完了の旧前提が残っていない
- `N/A`（FocusBookPicker）と `運用完了`（手動テスト）の根拠が明記されている
- CI が `check` + `e2e-ios` の2必須ジョブで運用される
- ローカル判定コマンド
  - `cd app && npm run check` が `exit 0`
  - `cd app && npm run e2e:test:ios` が `exit 0` かつ failed 0

## 8. 未収束リスク（2026-03-13 時点）

- `npm run e2e:test:ios` は今回実行で失敗再現なし（17 suites / 50 tests, failed 0）
- CI 上では macOS ランナーの一時的な simulator 不安定化に備え、失敗時は artifacts / Detox ログで再実行判定する
