// i18n.js — UI文字列の一元管理(EN/JA)。HTMLへの文字列ハードコードを禁止し、
// 全てここの辞書を経由して表示する。v0.5.0でJA表示の自然な日本語化を行った
// (指標名も含め、対訳が指定されたものは翻訳する。国際的に定着した英字表記
// のみ据え置く場合はコード内コメントで理由を残す)。
window.SQLab = window.SQLab || {};

window.SQLab.I18N = {
  en: {
    dropPrompt: "Drop your result.json here, or choose a file",
    chooseFile: "Choose File",
    loadJsonButton: "Load JSON",
    demoBannerText: "This is sample data.",
    dataStaysNotice: "Your data stays on this device. Nothing is sent anywhere.",
    errorSchemaMismatch: "Unsupported schema version. Supported: {supported} / Loaded: {loaded}",
    errorMissingField: "Missing required field: {field}",
    errorParseFailed: "Could not read this file as valid JSON.",
    errorGeneric: "Something went wrong while loading this file.",
    headerTagline: "View squash match analysis — heatmaps, stats and movement.",
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
    unassignedShortLabel: "Includes unassigned time",
    footerKofi: "☕ Ko-fi",
    footerSponsors: "❤️ Sponsors",
    footerFeedback: "📣 Feedback",
    demoBadge: "Demo data (synthetic)",
    demoPlayerAName: "Player A (demo)",
    demoPlayerBName: "Player B (demo)",
    analyzerName: "the Analyzer",
    summarySectionTitle: "Summary",
    resetNameLabel: "Reset",
    heatmapSectionTitle: "Analysis",
    heatmapGroupLabel: "Heatmap",
    modeSideBySide: "Side by Side",
    modeOverlay: "Overlay",
    modeReplay: "Movement Replay",
    tZoneToggleLabel: "Show T-zone",
    trailOff: "Off",
    trailShort: "5s",
    trailAll: "All",
    trailLabel: "Trail",
    heatmapSizeLabel: "Size",
    legendDwellTime: "Dwell time",
    legendP1Only: "P1 only",
    legendP2Only: "P2 only",
    legendBoth: "Both",
    coverageP1Label: "P1 analyzed",
    coverageP2Label: "P2 analyzed",
    guideBack: "← Back to Squash Laboratory",
    guideTitle: "Guide",
    guideIntro: "Your data stays on this device — nothing here is ever sent anywhere.",
    guideSummaryIntro: "P1/P2 summary cards show five metrics per player, computed from the loaded result.json.",
    guideDistance: "Total distance covered (m), excluding sudden jumps faster than the speed cap (a tracking glitch, not a real sprint).",
    guideWorkRate: "Distance divided by total main-camera minutes (not rally minutes) — a pace-of-movement figure comparable across matches of different lengths.",
    guideCoverage: "Percentage of court cells (0.5m squares) where the player spent at least a minimum dwell time — how much of the court they actually used.",
    guideAvgSpeed: "Average movement speed (m/s) while on court, i.e. distance divided by total on-court time.",
    guideUnassignedTitle: "Unassigned time ranges",
    guideUnassignedBody: "Some time ranges could not be confidently assigned to a player (usually because the two players crossed paths) and are excluded rather than guessed at.",
    guideMainCameraBody: "The video may briefly cut to a replay or a crowd shot. Those moments are detected automatically and excluded — \"main-camera time\" means the time actually spent on the fixed back-court camera angle used for analysis.",
    guideHeatmapTitle: "Heatmap",
    guideHeatmapBody:
      "The darker a cell, the longer the player spent standing there (dwell time). " +
      "Side by Side shows each player's own court with a shared color scale, so the same dwell time always looks equally dark for both. " +
      "Overlay blends both players on one court: red where only P1 spent time, blue where only P2 did, and purple where both did — making each player's exclusive territory visible at a glance. " +
      "Use the size slider above the courts to zoom in or out, and the T-zone checkbox to overlay the T-zone outline.",
    guideReplayTitle: "Movement Replay",
    guideReplayBody:
      "Movement Replay animates each player's position over time. When a player's position is genuinely missing (not just a normal gap between samples), their dot is hidden rather than frozen in place — the strip below the seek bar shows exactly which time ranges have data for each player, and which ranges were outside the main camera view. " +
      "Each position is the player's feet, not their head or torso — specifically, the bottom-center of their detection box, projected onto the court.",
    guideSchemaTitle: "Supported data format",
    guideSchemaBody: "This viewer only accepts result.json files matching schema version 0.2. Older or newer incompatible versions will show an error naming both the supported and the loaded version.",
    guideNamesTitle: "Player names",
    guideNamesBody: "Renaming a player only changes what this browser displays (saved locally per video file) — it never modifies the underlying data file.",
    seeAlsoLabel: "See also:",
    guideTocTitle: "Contents",
    guideTocGroupStart: "Getting Started",
    guideTocGroupMetrics: "Summary Metrics",
    guideTocGroupViews: "Heatmap & Replay",
    guideTocGroupData: "Data & Terms",
    guideOverviewTitle: "Overview",
    guideOverviewBody: "sq-lab is a static viewer for squash-lab's result.json analysis output: heatmaps, summary stats, and a movement replay. It runs entirely in your browser — your data stays on this device and nothing is ever sent anywhere.",
    guideOverviewVideoNote: "Video analysis (creating the data) is not yet publicly available. This site is for viewing analysis data (result.json) that has been prepared for you.",
    guideFeaturesTitle: "Features",
    guideGlossaryTitle: "Glossary",
    glossaryMainCameraTerm: "Main-camera time",
    glossaryAnalyzedRangeTerm: "Analyzed range",
    glossaryAnalyzedRangeBody: "Time ranges where tracking and player assignment succeeded. Blanks are unassigned time or time outside the main-camera view.",
    glossaryTZoneTerm: "T-zone",
    glossaryTZoneBody: "An ellipse centered just behind the T intersection (the marked spot where the two service-box lines meet), representing the court's controlling position. T-Dominance measures the share of main-camera time each player spent inside it.",
  },
  ja: {
    dropPrompt: "result.json をここにドロップ、またはファイルを選択",
    chooseFile: "ファイルを選択",
    loadJsonButton: "ファイルを読み込む",
    demoBannerText: "これはサンプルデータです。",
    dataStaysNotice: "データはこの端末内でのみ処理されます。外部へは送信されません。",
    errorSchemaMismatch:
      "対応していないスキーマバージョンです。対応バージョン: {supported} / 読み込まれたバージョン: {loaded}",
    errorMissingField: "必須フィールドが見つかりません: {field}",
    errorParseFailed: "このファイルをJSONとして読み込めませんでした。",
    errorGeneric: "ファイルの読み込み中に問題が発生しました。",
    headerTagline: "試合の解析データから、配置・スタッツ・動きを確認できます。",
    matchInfoTitle: "試合情報",
    videoFileLabel: "動画ファイル",
    analyzedFpsLabel: "解析フレームレート",
    mainCameraDurationLabel: "主カメラ区間の合計時間",
    generatorLabel: "生成ツール",
    // 指標名は自然な日本語表記に統一(v0.5.0)。Work Rateのみ定着した外来語が
    // 無いため「ワークレート」とし、単位の意味は注記(guide.html)で補う。
    metricDistance: "移動距離",
    metricWorkRate: "ワークレート",
    metricTDominance: "T支配率",
    metricCoverage: "コートカバー率",
    metricAvgSpeed: "平均速度",
    tDominanceNote:
      "Tゾーンは楕円({a}m×{b}m、T交点の{offset}m後方が中心)です。" +
      "分母はラリー時間ではなく主カメラ区間の合計時間です。",
    unassignedNote: "一部の時間帯は判定不能(未割当)として除外されています。",
    unassignedShortLabel: "未割当あり",
    footerKofi: "☕ チップ",
    footerSponsors: "❤️ Sponsors",
    footerFeedback: "📣 ご意見・ご要望",
    demoBadge: "デモデータ(完全な合成データ)",
    demoPlayerAName: "選手A(デモ)",
    demoPlayerBName: "選手B(デモ)",
    analyzerName: "動画解析ツール",
    summarySectionTitle: "サマリー",
    resetNameLabel: "既定に戻す",
    heatmapSectionTitle: "分析",
    heatmapGroupLabel: "ヒートマップ",
    modeSideBySide: "Side by Side",
    modeOverlay: "Overlay",
    modeReplay: "移動軌跡",
    tZoneToggleLabel: "Tゾーンを表示",
    trailOff: "なし",
    trailShort: "5秒",
    trailAll: "全体",
    trailLabel: "軌跡の表示",
    heatmapSizeLabel: "表示サイズ",
    legendDwellTime: "滞在時間",
    legendP1Only: "P1のみ",
    legendP2Only: "P2のみ",
    legendBoth: "両方",
    coverageP1Label: "P1 解析済み範囲",
    coverageP2Label: "P2 解析済み範囲",
    guideBack: "← Squash Laboratoryへ戻る",
    guideTitle: "ガイド",
    guideIntro: "データはこの端末内でのみ処理されます。外部へは一切送信されません。",
    guideSummaryIntro: "サマリーカードは、読み込んだresult.jsonから算出したプレイヤーごとの5指標を表示します。",
    guideDistance: "総移動距離(m)。速度上限を超える急激な変位(トラッキングの飛びであり実際のダッシュではない)は除外しています。",
    guideWorkRate: "移動距離 ÷ 主カメラ区間の合計分数(ラリー時間ではない)。試合時間が異なる相手同士でも比較できる「動きのペース」の指標です。",
    guideCoverage: "コートを0.5m四方のセルに分割し、最低滞在時間以上そこにいたセルの割合。実際にコートをどれだけ広く使ったかを示します。",
    guideAvgSpeed: "コート上にいた時間に対する平均移動速度(m/s)。移動距離をコート上滞在時間で割った値です。",
    guideUnassignedTitle: "未割当の時間帯について",
    guideUnassignedBody: "一部の時間帯は(多くの場合、選手同士が交差したことが原因で)プレイヤーを確信を持って判定できず、推測で埋めるのではなく除外しています。",
    guideMainCameraBody: "動画中には一時的にリプレイ映像や観客席の映像に切り替わることがあります。これらは自動検出のうえ除外され、「主カメラ区間」は解析に使う背面固定カメラのアングルが実際に映っていた時間を指します。",
    guideHeatmapTitle: "ヒートマップ",
    guideHeatmapBody:
      "色が濃いセルほど、そこに長く滞在していたことを示します(滞在時間)。" +
      "Side by Sideは各プレイヤー自身のコートを共通の色スケールで表示するため、同じ滞在時間なら両者とも同じ濃さに見えます。" +
      "Overlayは1枚のコートに両者を重ねて表示します。赤=P1のみ、青=P2のみ、紫=両者ともに滞在した領域を示し、" +
      "それぞれの選手が実質的に支配しているエリアが一目でわかります。" +
      "コート上部の表示サイズスライダーで拡大縮小、Tゾーンのチェックボックスでゾーンの輪郭を重ねて表示できます。",
    guideReplayTitle: "移動軌跡",
    guideReplayBody:
      "移動軌跡(Movement Replay)は各プレイヤーの位置を時間とともにアニメーション再生します。位置データが本当に存在しない" +
      "(通常のサンプル間隔ではなく実際の欠損)場合は、丸を最後の位置に留めるのではなく非表示にします。" +
      "シークバー下の帯は、各プレイヤーのデータがある時間帯と、主カメラ外だった時間帯を示します。" +
      "位置は頭や胴体ではなく足元(検出枠下辺中央のコート投影点)を基準としています。",
    guideSchemaTitle: "対応データ形式",
    guideSchemaBody: "本ビューアはスキーマバージョン0.2のresult.jsonのみに対応しています。それ以外のバージョンは、対応バージョンと読み込まれたバージョンを併記したエラーを表示します。",
    guideNamesTitle: "プレイヤー名について",
    guideNamesBody: "プレイヤー名の変更は、このブラウザでの表示のみを変更します(動画ファイルごとにローカル保存)。元のデータファイルを書き換えることはありません。",
    seeAlsoLabel: "関連項目:",
    guideTocTitle: "目次",
    guideTocGroupStart: "はじめに",
    guideTocGroupMetrics: "サマリー指標",
    guideTocGroupViews: "ヒートマップ・リプレイ",
    guideTocGroupData: "データと用語",
    guideOverviewTitle: "概要",
    guideOverviewBody: "sq-labは、squash-labが出力するresult.jsonの解析結果(ヒートマップ・サマリー指標・移動軌跡)を表示する静的ビューアです。すべてブラウザ内で完結し、データはこの端末内でのみ処理されます。外部へは一切送信されません。",
    guideOverviewVideoNote: "動画の解析(データ作成)機能は現在準備中です。本サイトは、作成済みの解析データ(result.json)をお持ちの方のための閲覧ツールです。",
    guideFeaturesTitle: "機能説明",
    guideGlossaryTitle: "用語集",
    glossaryMainCameraTerm: "主カメラ区間",
    glossaryAnalyzedRangeTerm: "解析済み範囲",
    glossaryAnalyzedRangeBody: "トラッキングと選手割当が成立している時間帯です。空白は未割当の時間、または主カメラ外だった時間を示します。",
    glossaryTZoneTerm: "Tゾーン",
    glossaryTZoneBody: "T交点(2本のサービスボックスラインが交わる印)の少し後方を中心とした楕円で、コートを支配する位置取りを表します。T支配率は、各選手が主カメラ区間のうちこのゾーン内で過ごした時間の割合です。",
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
