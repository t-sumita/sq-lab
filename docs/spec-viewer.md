# sq-lab V1 仕様書

策定: 2026-07-05(S1) / 版: v0.1.0

## 目的

sq-lab は [squash-lab](https://github.com/t-sumita/squash-lab)(private)が
出力するプレイヤー分析データ(`result.json`)を閲覧するための、公開された
静的ビューアである。コーチが選手にデータを見せながら指導するための道具、
というユーザー像を想定している。

squash-lab 自体は動画解析を行うPCバッチツールであり、公開を前提としない。
sq-lab はその出力(JSON)だけを扱う、完全に分離された別リポジトリ・別サイト
として運用する。

## 設計原則

1. **データは端末から出ない**: 読み込んだ JSON はブラウザ内メモリ上でのみ
   処理する。drag&drop またはファイル選択で読み込み、外部へ送信する
   コードは書かない。fetch は同梱デモデータの読込用途にのみ許可される
   (実装上は file:// でも確実に動くよう、デモデータは JS 変数として
   同梱しており、fetch/XHR は現状コード全体で一切使用していない)。
2. **実データを入れない**: リポジトリに同梱するのは完全な合成デモデータ
   (架空のプレイヤー名・人工的な位置と指標値)のみ。実際の試合動画・
   実際の result.json・squash-lab の内部設計文書は混入させない。
3. **vanilla JS + Canvas、ビルドステップなし**: フレームワーク・バンドラ・
   npm 依存を使わない。`<script type="module">` は `file://` で CORS
   ブロックされるため使わず、`window.SQLab` 名前空間に吊るした通常の
   script で構成する。ヒートマップ・リプレイ(S2/S3)は Canvas で描画する。
4. **対象ユーザー像**: 「コーチが選手に見せながら教える道具」。専門用語は
   最小限にし、モバイル(スマホ縦画面)でも問題なく使えることを優先する。

## V1 スコープ

- **S1(本リリース)**: リポジトリ骨格、JSON読込+スキーマ検証、
  試合情報ヘッダ、P1/P2サマリーカード(距離/Work Rate/T支配率/
  カバレッジ/平均速度)、EN/JA多言語対応
- **S2**: ヒートマップ描画(P1/P2 並置表示、および重畳表示)
- **S3**: リプレイ(positions の時系列をアニメーション再生)
- **S4**: 公開(GitHub Pages + Cloudflare DNS で `sq-lab.subutomo.dev`、
  README/バッジ整備、最終チェック)

## 対応スキーマ

sq-lab は squash-lab の `docs/spec-schema.md` が定義する `result.json`
スキーマ **v0.2** にのみ対応する。`schema_version` フィールドがこれと
一致しない場合は、対応バージョンと読み込まれたバージョンを併記した
エラーを表示し、読込を中止する(v0.1 を含め、v0.2 以外は全て不可)。

sq-lab が実際に参照するトップレベルフィールド(S1時点):

| フィールド | 用途 |
|---|---|
| `schema_version` | バージョン検証 |
| `video.file` / `video.analyzed_fps` | 試合情報ヘッダ |
| `analyzed_segments` | 主カメラ区間の合計時間(試合情報ヘッダ) |
| `generator.name` / `generator.version` | 試合情報ヘッダ |
| `metrics_params.t_zone` | T支配率カードの定義注記(a_m/b_m/offset_m を動的表示) |
| `unassigned_track_ids` | 未割当断片がある場合の注記表示 |
| `players[].id` / `players[].metrics` | サマリーカード本体 |
| `players[].positions` | S2(ヒートマップ)/S3(リプレイ)で使用予定 |
| `players[].metrics.heatmap` | S2で使用予定 |

squash-lab 側でスキーマに加算的変更(新フィールド追加)があった場合、
sq-lab 側は無視して問題ない設計とする(未知フィールドは読み飛ばす)。
破壊的変更(既存フィールドの削除・型変更)があった場合のみ
`schema_version` を上げ、sq-lab 側も追随して `SUPPORTED_SCHEMA`
(js/config.js)を更新する。

## 画面構成(S1)

1. **ヘッダ**: サイト名 `sq-lab`、バージョン表示、言語切替ボタン(EN | JA)
2. **導入パネル**(初期表示):
   - 「データはこの端末内でのみ処理されます」の明記
   - drag&drop ゾーン + ファイル選択ボタン
   - 「デモデータを見る」ボタン
   - エラー表示欄(スキーマ不一致・フィールド欠落・パース失敗)
3. **結果パネル**(読込成功後):
   - 試合情報ヘッダ(動画ファイル名・解析フレームレート・主カメラ区間の
     合計時間・生成ツール名/バージョン)
   - P1(赤系)/P2(青系)サマリーカード
   - 「別のファイルを読み込む」ボタン
4. **フッタ**: `Analyzed by squash-lab / Data stays on your device` 相当の一文

言語切替は `localStorage` に保存され、リロード後も維持される。指標名
(Distance / Work Rate / T-Dominance / Coverage / Avg Speed)は国際的な
用語のため言語によらず英語表記で統一し、説明文・注記・エラーメッセージの
みを翻訳対象とする。
