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
    footerText: "Analyzed by squash-lab · Data stays on your device",
    backButton: "Load another file",
    demoBadge: "Demo data (synthetic)",
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
    footerText: "Analyzed by squash-lab / データは端末から出ません",
    backButton: "別のファイルを読み込む",
    demoBadge: "デモデータ(完全な合成データ)",
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
