# CLAUDE.md

soccer-app は、子どものサッカー活動（試合記録・自主トレーニング）を管理し、あわせて自主トレーニングの実施状況に応じたお小遣い管理を行うNext.js（App Router）アプリ。DynamoDBとS3をバックエンドに使う。

## 1. 機能一覧

| 機能 | パス | 用途 |
| --- | --- | --- |
| 試合記録 | `/match/entry`, `/match/history` | 試合結果・得点/アシスト・写真の記録 |
| リフティング | `/lifting`, `/lifting/history`, `/lifting/admin` | リフティング回数の記録→お小遣い換算→清算 |
| ストレッチ・自主練 | `/training`, `/training/history`, `/training/admin` | ストレッチ・自主練の実施記録→お小遣い換算（連続ボーナス付き）→清算 |

Home (`/`)は`create-next-app`の初期テンプレートのまま未使用。各機能はURLを直接開いて使う運用（共通ナビゲーションなし）。

## 2. アーキテクチャ

```
src/
  lib/
    dynamodb.ts        # DynamoDBDocumentClientの共通初期化(region/credentialsは.env.local)
    constants.ts        # テーブル名・USER_IDの定数（LIFTING_USER_ID等）
    types.ts             # Match / LiftingLog / LiftingStats / TrainingLog / TrainingStats 等の型
    rank.ts               # リフティングの累計回数→ランク称号・進捗バー用ヘルパー
    trainingPricing.ts     # ストレッチ・自主練の単価計算（下記4章参照）
  app/
    page.tsx                # 未使用（create-next-appの初期テンプレート）
    match/
      entry/page.tsx          # 試合結果の入力・編集フォーム（画像アップロード含む）
      history/page.tsx         # 試合結果の一覧
    lifting/
      page.tsx                  # リフティング記録画面
      history/page.tsx           # リフティング実績一覧
      admin/page.tsx              # リフティング清算画面
    training/
      page.tsx                     # ストレッチ・自主練 記録画面
      history/page.tsx              # ストレッチ・自主練 実績一覧
      admin/page.tsx                 # ストレッチ・自主練 清算画面
    api/
      save-match, get-matches, delete-match   # 試合結果CRUD（テーブル名は環境変数 DYNAMODB_TABLE_NAME）
      upload                                    # S3の署名付きアップロードURL発行
      save-lifting, get-lifting, getlifting-stats, settle-payment       # リフティングAPI
      save-training, get-training, get-training-stats, settle-training-payment  # ストレッチ・自主練API
```

**新しいDynamoDBテーブルを追加する場合**: `dynamodb.ts`の共通クライアントを使い、テーブル名は`constants.ts`に定数化する。テーブル自体の作成・IAM権限の追加はコードでは完結せず、AWSコンソール（またはCreateTable権限を一時的に借りたワンオフスクリプト）での作業が必要（8章参照）。

## 3. お小遣い連動機能の共通設計（Lifting / Training）

「日々の記録→お小遣い換算→未精算金額の蓄積→まとめて清算」という同じパターンを2つの独立した機能（Lifting, Training）で採用している。

- 各機能は「日次ログ用テーブル」（例: `LiftingLogs`, `TrainingLogs`。PKは`date`）と「累計ステータス用テーブル」（例: `LiftingStats`, `TrainingStats`。PKは`userId`、家族1人分の運用のため`LIFTING_USER_ID`定数を共用）の2テーブル構成
- 同じ日付への再送信は「上書き」として扱い、`unpaidMoney`は差分（新値−旧値）だけを加算する
- 清算(`settle-*-payment`)は、未精算ログを`paid`に一括更新し、Statsの`unpaidMoney`を0に戻すだけで、ログ自体は削除しない
- **金額計算はサーバー側で行う**: `save-training`はクライアントからの`stretchDone`/`practiceDone`の真偽値のみを受け取り、金額と連続日数はサーバーで計算する。既存の`save-lifting`はクライアント側で計算した`earnedMoney`をそのまま信用しており改ざん耐性がない点が既知の課題（TODO.md参照）。新規に同種の機能を追加する場合は`save-training`の方式（サーバー側計算）を踏襲すること。

## 4. ストレッチ・自主練の単価設計（`src/lib/trainingPricing.ts`）

その日「ストレッチ」「自主練」の**両方**ができて初めて満額。片方だけの日は固定額（連続ボーナスの対象外）。

```
BASE_PRICE   = 30   // 1〜6日目
STEP_AMOUNT  = 10   // 7日ごとに+10円
STEP_DAYS    = 7
MAX_PRICE    = 70   // 28日目以降の上限
PARTIAL_PRICE = 15  // 片方だけの日は固定（BASEの半額）。連続はリセットされる
```

- 両方できた日: `fullDayPrice(streakDay) = min(BASE_PRICE + STEP_AMOUNT * floor((streakDay-1)/STEP_DAYS), MAX_PRICE)`。連続日数(streak)が+1される
- 片方だけの日: 固定¥15、連続はリセット(0)
- どちらもなしの日: ¥0、連続はリセット(0)
- 毎日フル達成し続けた場合の月合計は概ね¥1,440〜1,510（目標の「月1,500円程度」に収まる設計）

**streak計算の実装上の注意**: `stats.lastDate`/`lastDayType`のような「最後に保存した日」ポインタだけを見て連続日数を判定すると、当日分のログを後から編集し直した際に古い判定のまま固定される不具合になる（実装時に発見・修正済み）。そのため`save-training`は毎回**「date-1日」のログを`TrainingLogs`から実際に取得**し、そのログの`dayType`/`streakDay`を根拠に当日のstreakを再計算する。各`TrainingLog`は自分の`streakDay`（"full"の日のみ意味を持つ）を保持しており、翌日の計算はこの値を参照する。

## 5. 環境変数・AWS

`.env.local`で管理（コード内にハードコードしない）:
- `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
- `DYNAMODB_TABLE_NAME`（試合結果テーブル名）
- `AWS_S3_BUCKET_NAME`

IAMは最小権限方針（テーブル・バケットのプレフィックス単位で許可）。運用中のテーブルごとに、必要なアクション（`Scan`/`GetItem`/`PutItem`/`UpdateItem`など）だけを許可するポリシーを組む。新しいテーブルを追加した際は、既存ポリシーを直接編集するリスクを避け、その機能専用の別ポリシー（例: `soccer-app-training`）を新規作成してアタッチする方式を採っている。

## 6. 動作確認

`npx tsc --noEmit` / `npm run lint` / `npx next build` を実行して確認する。UIの変更はローカルdevサーバー（`npm run dev`）で実際にブラウザから操作し、read/write系APIがDynamoDB/S3と正しく疎通するところまで確認する。
