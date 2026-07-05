// i18n.js — UI文字列の一元管理(EN/JA)。HTMLへの文字列ハードコードを禁止し、
// 全てここの辞書を経由して表示する。指標名(Distance/Work Rate/T-Dominance/
// Coverage/Avg Speed)は国際的な用語のため言語によらず英語表記固定。
window.SQLab = window.SQLab || {};

window.SQLab.I18N = {
  en: {
    dropPrompt: "Drop your result.json here, or choose a file",
    chooseFile: "Choose File",
    demoButton: "View Demo Data",
    dataStaysNotice: "Your data stays on this device. Nothing is sent anywhere.",
    errorSchemaMismatch: "Unsupported schema version. Supported: {supported} / Loaded: {loaded}",
    errorMissingField: "Missing required field: {field}",
    errorParseFailed: "Could not read this file as valid JSON.",
    errorGeneric: "Something went wrong while loading this file.",
    matchInfoTitle: "Match Info",
    videoFileLabel: "Video file",
    analyzedFpsLabel: "Analyzed FPS",
    mainCameraDurationLabel: "Main-camera duration",
    generatorLabel: "Generator",
    metricDistance: "Distance",
    metricWorkRate: "Work Rate",
    metricTDominance: "T-Dominance",
    metricCoverage: "Coverage",
    metricAvgSpeed: "Avg Speed",
    tDominanceNote:
      "T-zone is an ellipse ({a}m × {b}m, centered {offset}m behind the T). " +
      "Denominator is total main-camera time, not rally time.",
    unassignedNote:
      "Some time ranges could not be confidently assigned to a player and are excluded (shown as unassigned).",
    footerText: "Analyzed by the Analyzer · Data stays on your device",
    footerKofi: "Support on Ko-fi",
    footerFeedback: "Feedback",
    backButton: "Load another file",
    demoBadge: "Demo data (synthetic)",
    analyzerName: "the Analyzer",
    summarySectionTitle: "Summary",
    resetNameLabel: "Reset",
    heatmapSectionTitle: "Analysis",
    modeSideBySide: "Side by Side",
    modeOverlay: "Overlay",
    modeReplay: "Replay",
    tZoneToggleLabel: "Show T-zone",
    trailToggleLabel: "Show Trail",
    legendDwellTime: "Dwell time",
    legendP1Only: "P1 only",
    legendP2Only: "P2 only",
    legendBoth: "Both",
    guideBack: "← Back to Squash Laboratory",
    guideTitle: "Guide",
    guideSummaryIntro: "P1/P2 summary cards show five metrics per player, computed from the loaded result.json.",
    guideDistance: "Total distance covered (m), excluding sudden jumps faster than the speed cap (a tracking glitch, not a real sprint).",
    guideWorkRate: "Distance divided by total main-camera minutes (not rally minutes) — a pace-of-movement figure comparable across matches of different lengths.",
    guideCoverage: "Percentage of court cells (0.5m squares) where the player spent at least a minimum dwell time — how much of the court they actually used.",
    guideAvgSpeed: "Average movement speed (m/s) while on court, i.e. distance divided by total on-court time.",
    guideUnassignedTitle: "Unassigned time ranges",
    guideHeatmapTitle: "Heatmap",
    guideHeatmapBody:
      "Side by Side shows each player's own court with a shared color scale, so the same dwell time always looks equally dark for both. " +
      "Overlay blends both players on one court: red where only P1 spent time, blue where only P2 did, and purple where both did — making each player's exclusive territory visible at a glance.",
    guideReplayTitle: "Replay",
    guideReplayBody:
      "Replay animates each player's position over time. When a player's position is genuinely missing (not just a normal gap between samples), their dot is hidden rather than frozen in place — the strip below the seek bar shows exactly which time ranges have data for each player, and which ranges were outside the main camera view. " +
      "Each position is the player's feet, not their head or torso — specifically, the bottom-center of their detection box, projected onto the court.",
    guideSchemaTitle: "Supported data format",
    guideSchemaBody: "This viewer only accepts result.json files matching schema version 0.2. Older or newer incompatible versions will show an error naming both the supported and the loaded version.",
    guideNamesTitle: "Player names",
    guideNamesBody: "Renaming a player only changes what this browser displays (saved locally per video file) — it never modifies the underlying data file.",
  },
  ja: {
    dropPrompt: "result.json をここにドロップ、またはファイルを選択",
    chooseFile: "ファイルを選択",
    demoButton: "デモデータを見る",
    dataStaysNotice: "データはこの端末内でのみ処理されます。外部へは送信されません。",
    errorSchemaMismatch:
      "対応していないスキーマバージョンです。対応バージョン: {supported} / 読み込まれたバージョン: {loaded}",
    errorMissingField: "必須フィールドが見つかりません: {field}",
    errorParseFailed: "このファイルをJSONとして読み込めませんでした。",
    errorGeneric: "ファイルの読み込み中に問題が発生しました。",
    matchInfoTitle: "試合情報",
    videoFileLabel: "動画ファイル",
    analyzedFpsLabel: "解析フレームレート",
    mainCameraDurationLabel: "主カメラ区間の合計時間",
    generatorLabel: "生成ツール",
    metricDistance: "Distance",
    metricWorkRate: "Work Rate",
    metricTDominance: "T-Dominance",
    metricCoverage: "Coverage",
    metricAvgSpeed: "Avg Speed",
    tDominanceNote:
      "Tゾーンは楕円({a}m×{b}m、T交点の{offset}m後方が中心)です。" +
      "分母はラリー時間ではなく主カメラ区間の合計時間です。",
    unassignedNote: "一部の時間帯は判定不能(未割当)として除外されています。",
    footerText: "動画解析ツールによる分析 / データは端末から出ません",
    footerKofi: "Ko-fiで応援する",
    footerFeedback: "フィードバック",
    backButton: "別のファイルを読み込む",
    demoBadge: "デモデータ(完全な合成データ)",
    analyzerName: "動画解析ツール",
    summarySectionTitle: "サマリー",
    resetNameLabel: "既定に戻す",
    heatmapSectionTitle: "分析",
    modeSideBySide: "Side by Side",
    modeOverlay: "Overlay",
    modeReplay: "Replay",
    tZoneToggleLabel: "Tゾーンを表示",
    trailToggleLabel: "軌跡を表示",
    legendDwellTime: "滞在時間",
    legendP1Only: "P1のみ",
    legendP2Only: "P2のみ",
    legendBoth: "両方",
    guideBack: "← Squash Laboratoryへ戻る",
    guideTitle: "ガイド",
    guideSummaryIntro: "サマリーカードは、読み込んだresult.jsonから算出したプレイヤーごとの5指標を表示します。",
    guideDistance: "総移動距離(m)。速度上限を超える急激な変位(トラッキングの飛びであり実際のダッシュではない)は除外しています。",
    guideWorkRate: "移動距離 ÷ 主カメラ区間の合計分数(ラリー時間ではない)。試合時間が異なる相手同士でも比較できる「動きのペース」の指標です。",
    guideCoverage: "コートを0.5m四方のセルに分割し、最低滞在時間以上そこにいたセルの割合。実際にコートをどれだけ広く使ったかを示します。",
    guideAvgSpeed: "コート上にいた時間に対する平均移動速度(m/s)。移動距離をコート上滞在時間で割った値です。",
    guideUnassignedTitle: "未割当の時間帯について",
    guideHeatmapTitle: "ヒートマップ",
    guideHeatmapBody:
      "Side by Sideは各プレイヤー自身のコートを共通の色スケールで表示するため、同じ滞在時間なら両者とも同じ濃さに見えます。" +
      "Overlayは1枚のコートに両者を重ねて表示します。赤=P1のみ、青=P2のみ、紫=両者ともに滞在した領域を示し、" +
      "それぞれの選手が実質的に支配しているエリアが一目でわかります。",
    guideReplayTitle: "リプレイ",
    guideReplayBody:
      "リプレイは各プレイヤーの位置を時間とともにアニメーション再生します。位置データが本当に存在しない" +
      "(通常のサンプル間隔ではなく実際の欠損)場合は、丸を最後の位置に留めるのではなく非表示にします。" +
      "シークバー下の帯は、各プレイヤーのデータがある時間帯と、主カメラ外だった時間帯を示します。" +
      "位置は頭や胴体ではなく足元(検出枠下辺中央のコート投影点)を基準としています。",
    guideSchemaTitle: "対応データ形式",
    guideSchemaBody: "本ビューアはスキーマバージョン0.2のresult.jsonのみに対応しています。それ以外のバージョンは、対応バージョンと読み込まれたバージョンを併記したエラーを表示します。",
    guideNamesTitle: "プレイヤー名について",
    guideNamesBody: "プレイヤー名の変更は、このブラウザでの表示のみを変更します(動画ファイルごとにローカル保存)。元のデータファイルを書き換えることはありません。",
  },
};

// 既定言語: localStorage優先、無ければブラウザ言語(ja系ならJA、他はEN)。
window.SQLab.getLang = function () {
  var saved = null;
  try {
    saved = localStorage.getItem("sqlab_lang");
  } catch (e) {
    /* localStorage不可の環境(一部プライベートモード等)は無視 */
  }
  if (saved === "en" || saved === "ja") return saved;
  var nav = (navigator.language || "en").toLowerCase();
  return nav.indexOf("ja") === 0 ? "ja" : "en";
};

window.SQLab.setLang = function (lang) {
  window.SQLab.currentLang = lang;
  try {
    localStorage.setItem("sqlab_lang", lang);
  } catch (e) {
    /* 保存できなくても致命的ではない */
  }
};

// t(key, vars): 現在の言語で文字列を取得し、{name} プレースホルダを置換する。
window.SQLab.t = function (key, vars) {
  var lang = window.SQLab.currentLang || window.SQLab.getLang();
  var dict = window.SQLab.I18N[lang] || window.SQLab.I18N.en;
  var str = dict[key] || window.SQLab.I18N.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      str = str.split("{" + k + "}").join(String(vars[k]));
    });
  }
  return str;
};

// data-i18n="key" を持つ要素の textContent を一括更新する。
window.SQLab.applyStaticI18n = function (root) {
  var scope = root || document;
  var nodes = scope.querySelectorAll("[data-i18n]");
  nodes.forEach(function (el) {
    el.textContent = window.SQLab.t(el.getAttribute("data-i18n"));
  });
};
