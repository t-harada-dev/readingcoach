# Batch 7 - Onboarding / Add Book / Library / Book Detail

参照:
- tsundoku_test_spec_20260310_v2.docx
- 積読コーチ 画面一覧 兼 画面遷移 兼 画面定義
- 積読コーチ_異常系・縮退運転定義書_20260310

## 目的
初回利用導線と書籍管理導線を自動化し、最初の1冊登録から Focus 化、保存後編集までを固定する。

## 対象 TC
### ONB
- ONB-01 検索成功 -> 候補保存 -> SC-02
- ONB-02 検索0件 -> 手入力 -> SC-02
- ONB-03 オフライン -> 手入力 -> SC-02
- ONB-04 時刻保存 -> SC-03
- ONB-05 通知許可 -> SC-04
- ONB-06 あとで/拒否 -> SC-04

### BOOK
- BOOK-01 候補あり検索 -> 候補保存 -> 呼び出し元
- BOOK-02 timeout -> 手入力
- BOOK-03 429/5xx -> 手入力
- BOOK-04 書影欠損候補 -> 保存
- BOOK-05 ライブラリから本追加 -> SC-09
- BOOK-06 ライブラリから本詳細 -> SC-21
- BOOK-07 本詳細で Focus 化 -> ホーム
- BOOK-08 本詳細で現在ページ更新 -> 同画面反映
- BOOK-09 本詳細でタイトル/著者/ページ数更新 -> 同画面反映

## 推奨レイヤ
### Detox
- ONB-01〜06
- BOOK-01〜09

### モック / 補助
- 検索成功
- 0件
- timeout
- 429/5xx
- 通知許可/拒否 seed

## 必要 testID
- onboarding-add-book-screen
- onboarding-search-input
- onboarding-search-submit
- onboarding-time-screen
- onboarding-time-save
- onboarding-notification-screen
- onboarding-notification-enable
- onboarding-notification-later
- add-book-search-screen
- add-book-manual-screen
- add-book-candidate-screen
- library-screen
- library-add-book
- library-book-row-<stable-id>
- book-detail-screen
- book-detail-focus
- book-detail-current-page
- book-detail-page-count
- book-detail-title
- book-detail-author
- book-detail-save

## 実装順
1. ONB-01
2. ONB-04
3. ONB-06
4. BOOK-05
5. BOOK-06
6. BOOK-07
7. BOOK-01
8. BOOK-02
9. BOOK-03
10. BOOK-08
11. BOOK-09
12. ONB-02
13. ONB-03
14. ONB-05

## ギャップメモ
- 通知権限の本物のシステムUI押下は native acceptance へ委譲してよい
- 検索 API モックが無いと BOOK-01〜04 の安定化が難しい
- placeholder 画像有無の見た目最終確認は手動受入でもよい