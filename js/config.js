// config.js — バージョン単一情報源。ビルドステップなしのため plain script として
// window.SQLab 名前空間に値を吊るす(type="module" は file:// で CORS ブロックされるため不採用)。
window.SQLab = window.SQLab || {};

// このビューア自体のバージョン。
// 注意: index.html / guide.html の script/link タグの ?v= クエリと手動で
// 同期させること(README.md「キャッシュ対策」参照、コミット前チェック項目)。
window.SQLab.APP_VERSION = "0.6.0";

// 対応する result.json のスキーマバージョン(squash-lab docs/spec-schema.md 参照)。
// このバージョン以外は読込を拒否し、対応/読込バージョンを表示して停止する。
window.SQLab.SUPPORTED_SCHEMA = "0.2";
