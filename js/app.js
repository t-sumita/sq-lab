// app.js — 画面制御(イベント配線・言語切替・エラー表示)。
(function () {
  var lastData = null; // 言語切替時にサマリーを再描画するため保持

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

  function showResult(data) {
    lastData = data;
    clearError();
    document.getElementById("intro-panel").hidden = true;
    var resultPanel = document.getElementById("result-panel");
    resultPanel.hidden = false;
    window.SQLab.Summary.render(
      document.getElementById("match-info"),
      document.getElementById("summary-cards"),
      data
    );
    window.SQLab.Views.render(document.getElementById("heatmap-section"), data);
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

  function updateLangButton() {
    var btn = document.getElementById("lang-toggle");
    var lang = window.SQLab.currentLang || window.SQLab.getLang();
    btn.textContent = lang === "ja" ? "EN | JA" : "EN | JA";
    btn.setAttribute("data-current-lang", lang);
    // 現在の言語を強調表示するクラスを付与
    btn.classList.toggle("lang-toggle--ja", lang === "ja");
    btn.classList.toggle("lang-toggle--en", lang === "en");
  }

  function applyLanguage(lang) {
    window.SQLab.setLang(lang);
    document.documentElement.lang = lang;
    window.SQLab.applyStaticI18n(document);
    updateLangButton();
    // 現在表示中のエラーやサマリー/ヒートマップも再描画して言語を反映する
    if (lastData) {
      window.SQLab.Summary.render(
        document.getElementById("match-info"),
        document.getElementById("summary-cards"),
        lastData
      );
      window.SQLab.Views.render(document.getElementById("heatmap-section"), lastData);
    }
  }

  function init() {
    var initialLang = window.SQLab.getLang();
    applyLanguage(initialLang);

    document.getElementById("app-version").textContent = "v" + window.SQLab.APP_VERSION;

    var dropZone = document.getElementById("drop-zone");
    var fileInput = document.getElementById("file-input");
    var chooseBtn = document.getElementById("choose-file-btn");
    var demoBtn = document.getElementById("demo-btn");
    var backBtn = document.getElementById("back-btn");
    var langToggle = document.getElementById("lang-toggle");

    chooseBtn.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", function (evt) {
      handleFile(evt.target.files[0]);
    });

    dropZone.addEventListener("dragover", function (evt) {
      evt.preventDefault();
      dropZone.classList.add("drop-zone--active");
    });
    dropZone.addEventListener("dragleave", function () {
      dropZone.classList.remove("drop-zone--active");
    });
    dropZone.addEventListener("drop", function (evt) {
      evt.preventDefault();
      dropZone.classList.remove("drop-zone--active");
      var file = evt.dataTransfer.files && evt.dataTransfer.files[0];
      handleFile(file);
    });
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
