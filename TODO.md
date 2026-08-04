# TODO

## 完了した作業 (2026-08-04)

### ストレッチ・自主練 記録機能（お小遣い連動）を新規実装
子どもが日々「ストレッチ」「自主練」ができたかを記録し、実績一覧でモチベーション継続を狙うインターフェースを追加。既存のLifting機能（記録→お小遣い換算→コンボ→清算）と同じ構成パターンを踏襲。

- **データモデル**: `TrainingLog` / `TrainingStats`（`src/lib/types.ts`）、新規DynamoDBテーブル`TrainingLogs`(PK: date) / `TrainingStats`(PK: userId)をオンデマンド課金で作成済み
- **単価ロジック**: `src/lib/trainingPricing.ts`。両方揃った日が連続するほど単価アップ（¥30スタート、7日ごとに+¥10、上限¥70）。毎日フル達成し続けた場合の月合計は概ね¥1,440〜1,510に収まる設計。片方だけの日は固定¥15（連続はリセット）。
  - streakは「前日分のログを実際に参照して都度再計算」する方式にした（`stats.lastDate`のようなポインタ方式だと、当日分を後から編集し直した際に誤った値のまま固定される不具合を実装中のテストで発見・修正した経緯あり）。各`TrainingLog`に`streakDay`を保持し、翌日の計算はそこを参照する。
- **APIルート**: `save-training`(POST, サーバー側でearnedMoney/streakを計算しクライアント値は信用しない) / `get-training` / `get-training-stats` / `settle-training-payment` を`src/app/api/`に追加
- **ページ**: `/training`(記録) / `/training/history`(実績一覧) / `/training/admin`(清算) を追加
- `npx tsc --noEmit` / `npm run lint` / `npx next build` すべて成功。ローカルdevサーバーで実際にDynamoDBへ読み書きし、連続日数の計算・上書き編集時の再計算・清算フローまで動作確認済み（確認用のテストデータは検証後にすべて削除しクリーンな状態に戻した）。

### AWS IAM
- 新規テーブル作成のため、`soccer-app-training`という別ポリシーを新規作成しIAMユーザー`soccer-app`にアタッチ（既存のLifting用ポリシーは変更していない）
- テーブル作成・動作確認・テストデータ削除のため一時的に`dynamodb:CreateTable` / `DescribeTable` / `DeleteItem`を付与した。**恒久運用に不要なこれらのアクションは削除し、`Scan`/`GetItem`/`PutItem`/`UpdateItem`のみに絞ることを推奨**（下記「未対応」参照）。

## 完了した作業 (2026-07-13)

### AWS IAM / 環境変数
- 新しいIAMユーザー用に最小権限ポリシーを設計
  - DynamoDB: `Scan` / `GetItem` / `PutItem` / `UpdateItem`(対象テーブル: `MatchResult`, `LiftingLogs`, `LiftingStats`)
  - S3: `soccer-app-photos-backet` の `uploads/*` に対して `PutObject` のみ
- 新しいアクセスキー・シークレットキーを発行し `.env.local` に反映
- `DYNAMODB_TABLE_NAME` を `MatchResult` に設定

### リファクタリング
1. DynamoDBクライアントの共通化 → `src/lib/dynamodb.ts`(6ファイルの重複初期化・region指定の不統一を解消)
2. テーブル名 / USER_ID の定数化 → `src/lib/constants.ts`
3. ランク計算ロジックの共通化 → `src/lib/rank.ts`(`lifting/page.tsx` と `lifting/history/page.tsx` の重複を解消)
4. 型定義の共通化 → `src/lib/types.ts`(`Match` / `LiftingLog` / `LiftingStats`、各ページの`any`を置換)

### バグ修正
- 存在しなかった `/api/delete-match` を新規実装し、試合削除ボタンの404を解消
- 削除失敗時にアラートが出ない問題も修正
- 既存の `catch (error: any)` パターンを `instanceof Error` ベースに統一(ESLintエラー 9→0)

### 動作確認・デプロイ
- `tsc --noEmit` / `next lint` / `next build` すべて成功
- ローカルdevサーバーで全ページ・read系APIの疎通確認済み
- コミット & push 済み(`f18a4c7`)

## 未対応・要フォローアップ
- [ ] チャットに平文で貼られた旧AWSアクセスキー(`AKIA5A44I3K4SNBGN7Q3`)は漏洩扱いとして、IAMコンソールで無効化→再発行する
- [ ] ESLint警告(優先度低)
  - [ ] 未使用の `err` 変数(lifting/admin, lifting/page, match/entry, match/history, training/admin, training/page)
  - [ ] `<img>` タグを `next/image` に置き換え(match/entry, match/history)
- [ ] `save-lifting` APIはクライアントから送られた `earnedMoney` をそのまま信頼しており、サーバー側で再計算・検証していない(改ざん耐性なし)。`save-training`は2026-08-04にサーバー側計算で新規実装済み。
- [ ] `soccer-app-training`ポリシーの`dynamodb:CreateTable` / `DescribeTable` / `DeleteItem`は、Trainingテーブル作成・検証用の一時権限。恒久運用には不要なのでIAMコンソールから削除する(`Scan`/`GetItem`/`PutItem`/`UpdateItem`のみ残す)
