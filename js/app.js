// app.js — 画面制御(イベント配線・言語切替・エラー表示)。
(function () {
  var lastData = null; // 言語切替・名前編集時に再描画するため保持

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

  // 読込中に予期しない例外が起きても「無反応に見える」状態にせず、
  // 必ずエラー表示か結果表示のどちらかに帰着させる(P0対応)。
  function showResult(data) {
    try {
      lastData = data;
      clearError();
      document.getElementById("intro-panel").hidden = true;
      document.getElementById("result-panel").hidden = false;
      renderAll();
    } catch (e) {
      lastData = null;
      document.getElementById("result-panel").hidden = true;
      document.getElementById("intro-panel").hidden = false;
      showError("errorGeneric", {});
    }
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

  function showIntro() {
    lastData = null;
    clearError();
    document.getElementById("result-panel").hidden = true;
    document.getElementById("intro-panel").hidden = false;
  }

  function handleFile(file) {
    if (!file) return;
    window.SQLab.Loader.loadFromFile(file, showResult, showError);
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
    renderAll(); // 現在表示中のサマリー/ヒートマップ/リプレイも言語を反映して再描画
  }

  function init() {
    var initialLang = window.SQLab.getLang();
    applyLanguage(initialLang);

    document.getElementById("app-version").textContent = "v" + window.SQLab.APP_VERSION;

    var introPanel = document.getElementById("intro-panel");
    var fileInput = document.getElementById("file-input");
    var chooseBtn = document.getElementById("choose-file-btn");
    var demoBtn = document.getElementById("demo-btn");
    var backBtn = document.getElementById("back-btn");
    var langToggle = document.getElementById("lang-toggle");

    chooseBtn.addEventListener("click", function () {
      fileInput.click();
    });

    // ファイル選択(change)で即読込。開くボタンは不要(P0対応)。
    fileInput.addEventListener("change", function (evt) {
      handleFile(evt.target.files[0]);
    });

    // イントロパネル全体をドロップ領域にする(P0対応: 点線枠の小さな
    // drop-zone div だけでなく、パネルのどこにドロップしても読み込める)。
    introPanel.addEventListener("dragover", function (evt) {
      evt.preventDefault();
      introPanel.classList.add("intro-panel--drag-active");
    });
    introPanel.addEventListener("dragleave", function (evt) {
      if (evt.target === introPanel) {
        introPanel.classList.remove("intro-panel--drag-active");
      }
    });
    introPanel.addEventListener("drop", function (evt) {
      evt.preventDefault();
      introPanel.classList.remove("intro-panel--drag-active");
      var file = evt.dataTransfer.files && evt.dataTransfer.files[0];
      handleFile(file);
    });

    var dropZone = document.getElementById("drop-zone");
    dropZone.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        fileInput.click();
      }
    });

    demoBtn.addEventListener("click", function () {
      window.SQLab.Loader.loadDemo(showResult, showError);
    });

    backBtn.addEventListener("click", showIntro);

    langToggle.addEventListener("click", function () {
      var next = (window.SQLab.currentLang === "ja") ? "en" : "ja";
      applyLanguage(next);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
