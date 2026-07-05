// app.js — 画面制御(イベント配線・言語切替・エラー表示)。
// v0.5.0: 初回表示はデモデータを自動表示し、読込UIは上部ボタンから展開する方式へ変更。
(function () {
  var lastData = null; // 言語切替・名前編集時に再描画するため保持
  var isDemo = true; // 現在表示中がデモデータかどうか(上部バナー表示制御用)

  function showError(key, vars) {
    var box = document.getElementById("error-box");
    box.textContent = window.SQLab.t(key, vars);
    box.hidden = false;
  }

  function clearError() {
    var box = document.getElementById("error-box");
    box.hidden = true;
    box.textContent = "";
  }

  function updateTopNotice() {
    var textEl = document.getElementById("top-notice-text");
    var btn = document.getElementById("top-notice-btn");
    if (isDemo) {
      textEl.hidden = false;
      textEl.textContent = window.SQLab.t("demoBannerText");
    } else {
      textEl.hidden = true;
    }
    btn.textContent = window.SQLab.t("loadJsonButton");
  }

  function closeLoadPanel() {
    document.getElementById("load-panel").hidden = true;
  }

  function openLoadPanel() {
    document.getElementById("load-panel").hidden = false;
  }

  // 読込中に予期しない例外が起きても「無反応に見える」状態にせず、
  // 必ずエラー表示か結果表示のどちらかに帰着させる(P0対応、v0.4.0から継続)。
  function showResult(data, demo) {
    try {
      lastData = data;
      isDemo = !!demo;
      clearError();
      closeLoadPanel();
      document.getElementById("result-panel").hidden = false;
      updateTopNotice();
      renderAll();
    } catch (e) {
      lastData = null;
      document.getElementById("result-panel").hidden = true;
      openLoadPanel();
      showError("errorGeneric", {});
    }
  }

  function showResultFromFile(data) {
    showResult(data, false);
  }

  function renderAll() {
    if (!lastData) return;
    window.SQLab.Summary.render(
      document.getElementById("match-info"),
      document.getElementById("summary-cards"),
      lastData,
      renderAll // 名前編集後の再描画コールバックとして自分自身を渡す
    );
    window.SQLab.Views.render(document.getElementById("heatmap-section"), lastData);
  }

  function handleFile(file) {
    if (!file) return;
    window.SQLab.Loader.loadFromFile(file, showResultFromFile, showError);
  }

  // テンプレート準拠: ボタンには表示中の言語の2文字のみを表示する(EN/JA相互トグル)。
  function updateLangButton() {
    var btn = document.getElementById("lang-toggle");
    var lang = window.SQLab.currentLang || window.SQLab.getLang();
    btn.textContent = lang === "ja" ? "JA" : "EN";
    btn.setAttribute("data-current-lang", lang);
  }

  function applyLanguage(lang) {
    window.SQLab.setLang(lang);
    document.documentElement.lang = lang;
    window.SQLab.applyStaticI18n(document);
    updateLangButton();
    updateTopNotice();
    renderAll(); // 現在表示中のサマリー/ヒートマップ/リプレイも言語を反映して再描画
  }

  function init() {
    var initialLang = window.SQLab.getLang();
    applyLanguage(initialLang);

    document.getElementById("app-version").textContent = "v" + window.SQLab.APP_VERSION;

    var fileInput = document.getElementById("file-input");
    var chooseBtn = document.getElementById("choose-file-btn");
    var langToggle = document.getElementById("lang-toggle");
    var topNoticeBtn = document.getElementById("top-notice-btn");

    chooseBtn.addEventListener("click", function () {
      fileInput.click();
    });

    // ファイル選択(change)で即読込。開くボタンは不要(P0対応)。
    fileInput.addEventListener("change", function (evt) {
      handleFile(evt.target.files[0]);
    });

    var dropZone = document.getElementById("drop-zone");
    dropZone.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        fileInput.click();
      }
    });

    // ページ全体をドロップ領域にする(読込UIを開いていなくても、
    // どこにファイルをドロップしても読み込める)。
    document.body.addEventListener("dragover", function (evt) {
      evt.preventDefault();
      document.body.classList.add("body--drag-active");
    });
    document.body.addEventListener("dragleave", function (evt) {
      if (evt.target === document.body) {
        document.body.classList.remove("body--drag-active");
      }
    });
    document.body.addEventListener("drop", function (evt) {
      evt.preventDefault();
      document.body.classList.remove("body--drag-active");
      var file = evt.dataTransfer.files && evt.dataTransfer.files[0];
      if (file) {
        openLoadPanel();
        handleFile(file);
      }
    });

    topNoticeBtn.addEventListener("click", function () {
      var panel = document.getElementById("load-panel");
      panel.hidden = !panel.hidden;
    });

    langToggle.addEventListener("click", function () {
      var next = (window.SQLab.currentLang === "ja") ? "en" : "ja";
      applyLanguage(next);
    });

    // 初回表示はデモデータの分析結果を自動表示する(v0.5.0)。
    window.SQLab.Loader.loadDemo(function (data) {
      showResult(data, true);
    }, showError);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
