// views.js — 「Side by Side / Overlay / Replay」タブとT-zoneトグルを一元管理する
// 上位コントローラ。実際の描画は heatmap.js(ヒートマップ2モード)と
// replay.js(リプレイ)に委譲する。S2まではheatmap.js自身がタブを持っていたが、
// S3でReplayをHeatmapと同列のタブとして追加するためこちらへ引き上げた。
window.SQLab = window.SQLab || {};

window.SQLab.Views = (function () {
  var state = { mode: "side", showTZone: true };
  var currentResizeHandler = null;

  function tabBtn(text, active) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tab-btn" + (active ? " tab-btn--active" : "");
    b.textContent = text;
    return b;
  }

  function render(container, data) {
    // 別モード実行中のリプレイループ・リスナーを必ず止める(タブ切替・言語切替の両方で必要)。
    if (window.SQLab.Replay) window.SQLab.Replay.stop();
    if (currentResizeHandler) {
      window.removeEventListener("resize", currentResizeHandler);
      currentResizeHandler = null;
    }

    container.innerHTML = "";

    var title = document.createElement("h2");
    title.className = "heatmap__title";
    title.textContent = window.SQLab.t("heatmapSectionTitle");
    container.appendChild(title);

    var tabs = document.createElement("div");
    tabs.className = "heatmap__tabs";
    var sideTab = tabBtn(window.SQLab.t("modeSideBySide"), state.mode === "side");
    var overlayTab = tabBtn(window.SQLab.t("modeOverlay"), state.mode === "overlay");
    var replayTab = tabBtn(window.SQLab.t("modeReplay"), state.mode === "replay");
    tabs.appendChild(sideTab);
    tabs.appendChild(overlayTab);
    tabs.appendChild(replayTab);
    container.appendChild(tabs);

    var tZoneRow = document.createElement("label");
    tZoneRow.className = "tzone-toggle";
    var tZoneCheckbox = document.createElement("input");
    tZoneCheckbox.type = "checkbox";
    tZoneCheckbox.checked = state.showTZone;
    var tZoneLabelText = document.createElement("span");
    tZoneLabelText.textContent = window.SQLab.t("tZoneToggleLabel");
    tZoneRow.appendChild(tZoneCheckbox);
    tZoneRow.appendChild(tZoneLabelText);
    container.appendChild(tZoneRow);

    var canvasArea = document.createElement("div");
    container.appendChild(canvasArea);

    var legendArea = document.createElement("div");
    legendArea.className = "heatmap__legend-area";
    container.appendChild(legendArea);

    function setActiveTabs() {
      [sideTab, overlayTab, replayTab].forEach(function (b) {
        b.classList.remove("tab-btn--active");
      });
      if (state.mode === "side") sideTab.classList.add("tab-btn--active");
      else if (state.mode === "overlay") overlayTab.classList.add("tab-btn--active");
      else replayTab.classList.add("tab-btn--active");
    }

    function redraw() {
      if (window.SQLab.Replay) window.SQLab.Replay.stop();
      canvasArea.className = "heatmap__canvases"; // 前モードの修飾クラスをリセット
      canvasArea.innerHTML = "";
      legendArea.innerHTML = "";

      if (state.mode === "side") {
        window.SQLab.Heatmap.renderSideBySide(canvasArea, legendArea, data, state.showTZone);
      } else if (state.mode === "overlay") {
        window.SQLab.Heatmap.renderOverlay(canvasArea, legendArea, data, state.showTZone);
      } else {
        window.SQLab.Replay.render(canvasArea, data, state.showTZone);
      }
    }

    sideTab.addEventListener("click", function () {
      state.mode = "side";
      setActiveTabs();
      redraw();
    });
    overlayTab.addEventListener("click", function () {
      state.mode = "overlay";
      setActiveTabs();
      redraw();
    });
    replayTab.addEventListener("click", function () {
      state.mode = "replay";
      setActiveTabs();
      redraw();
    });
    tZoneCheckbox.addEventListener("change", function () {
      state.showTZone = tZoneCheckbox.checked;
      redraw();
    });

    var resizeTimer = null;
    currentResizeHandler = function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      // Replay自身も内部でリサイズ監視するため、モードがreplayの間はここでの
      // 再描画は不要(二重処理を避ける)。side/overlayのみ再描画する。
      resizeTimer = setTimeout(function () {
        if (state.mode !== "replay") redraw();
      }, 150);
    };
    window.addEventListener("resize", currentResizeHandler);

    redraw();
  }

  return { render: render };
})();
