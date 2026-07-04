// heatmap.js — ヒートマップ描画(並置/重畳・補間・T-zone表示)。
// Court モジュール(court.js)を使ってコートを描き、その上にヒートマップを重ねる。
window.SQLab = window.SQLab || {};

window.SQLab.Heatmap = (function () {
  var MAX_ALPHA = 0.85;
  var COLOR_P1 = [197, 48, 48]; // --color-p1 (#c53030) と同一
  var COLOR_P2 = [43, 108, 176]; // --color-p2 (#2b6cb0) と同一

  // render() は言語切替のたびに再呼び出しされるため、resizeリスナーが
  // 積み重ならないよう直前のものを解除してから登録し直す。
  var currentResizeHandler = null;

  // 両プレイヤー共通の最大値(正規化の基準)。「同じ濃さ=同じ秒数」を保証する。
  function commonMax(gridP1, gridP2) {
    var max = 0;
    [gridP1, gridP2].forEach(function (grid) {
      if (!grid) return;
      grid.forEach(function (row) {
        row.forEach(function (v) {
          if (v > max) max = v;
        });
      });
    });
    return max > 0 ? max : 1;
  }

  function singleColor(rgb) {
    return function (v, maxVal) {
      var t = Math.min(1, v / maxVal);
      return [rgb[0], rgb[1], rgb[2], Math.round(t * MAX_ALPHA * 255)];
    };
  }

  // 重畳用: P1(赤)とP2(青)を加法的に合成し、重なりを紫系にする。
  // 片方だけが高い領域はその色が単独で浮き出る。
  function overlayColorFn(p1v, p2v, maxVal) {
    var t1 = Math.min(1, p1v / maxVal);
    var t2 = Math.min(1, p2v / maxVal);
    var r = Math.round(255 * t1);
    var b = Math.round(255 * t2);
    var a = Math.max(t1, t2);
    return [r, 0, b, Math.round(a * MAX_ALPHA * 255)];
  }

  // 小さなオフスクリーンcanvas(1セル=1px)にRGBAを書き込み、荒いグリッドの画像を作る。
  // 表示側で imageSmoothingEnabled=true により拡大時にバイリニア的な補間がかかる。
  function buildOffscreen(nx, ny, cellColorFn) {
    var off = document.createElement("canvas");
    off.width = nx;
    off.height = ny;
    var octx = off.getContext("2d");
    var imgData = octx.createImageData(nx, ny);
    for (var j = 0; j < ny; j++) {
      for (var i = 0; i < nx; i++) {
        var rgba = cellColorFn(i, j);
        var idx = (j * nx + i) * 4;
        imgData.data[idx] = rgba[0];
        imgData.data[idx + 1] = rgba[1];
        imgData.data[idx + 2] = rgba[2];
        imgData.data[idx + 3] = rgba[3];
      }
    }
    octx.putImageData(imgData, 0, 0);
    return off;
  }

  function drawHeatmapLayer(ctx, offCanvas, cssWidth, cssHeight) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
    ctx.drawImage(offCanvas, 0, 0, cssWidth, cssHeight);
    ctx.restore();
  }

  // 1枚のコートに単色ヒートマップ(P1またはP2)を描画する。
  function paintSingle(canvas, cssWidth, grid, maxVal, rgb, tZone, showTZone) {
    var Court = window.SQLab.Court;
    var setup = Court.setupCanvas(canvas, cssWidth);
    var ctx = setup.ctx;
    var ny = grid.length;
    var nx = grid[0].length;

    Court.drawFloor(ctx, setup.scale, "#ffffff");

    var colorFn = singleColor(rgb);
    var off = buildOffscreen(nx, ny, function (i, j) {
      return colorFn(grid[j][i], maxVal);
    });
    drawHeatmapLayer(ctx, off, setup.cssWidth, setup.cssHeight);

    Court.drawLines(ctx, setup.scale);
    if (showTZone && tZone) Court.drawTZone(ctx, setup.scale, tZone);

    return setup;
  }

  // 1枚のコートにP1(赤)+P2(青)を重畳描画する。
  function paintOverlay(canvas, cssWidth, gridP1, gridP2, maxVal, tZone, showTZone) {
    var Court = window.SQLab.Court;
    var setup = Court.setupCanvas(canvas, cssWidth);
    var ctx = setup.ctx;
    var ny = gridP1.length;
    var nx = gridP1[0].length;

    Court.drawFloor(ctx, setup.scale, "#ffffff");

    var off = buildOffscreen(nx, ny, function (i, j) {
      return overlayColorFn(gridP1[j][i], gridP2[j][i], maxVal);
    });
    drawHeatmapLayer(ctx, off, setup.cssWidth, setup.cssHeight);

    Court.drawLines(ctx, setup.scale);
    if (showTZone && tZone) Court.drawTZone(ctx, setup.scale, tZone);

    return setup;
  }

  // 0〜maxValのグラデーション凡例(単色)。
  function renderLegendBar(container, rgb, maxVal, labelText) {
    container.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "legend";

    var label = document.createElement("div");
    label.className = "legend__label";
    label.textContent = labelText;
    wrap.appendChild(label);

    var bar = document.createElement("div");
    bar.className = "legend__bar";
    bar.style.background =
      "linear-gradient(to right, rgba(" +
      rgb.join(",") +
      ",0), rgba(" +
      rgb.join(",") +
      "," +
      MAX_ALPHA +
      "))";
    wrap.appendChild(bar);

    var ticks = document.createElement("div");
    ticks.className = "legend__ticks";
    var t0 = document.createElement("span");
    t0.textContent = "0s";
    var t1 = document.createElement("span");
    t1.textContent = maxVal.toFixed(1) + "s";
    ticks.appendChild(t0);
    ticks.appendChild(t1);
    wrap.appendChild(ticks);

    container.appendChild(wrap);
  }

  // 重畳モードの凡例(色の意味: 赤=P1のみ, 青=P2のみ, 紫=両方)。
  function renderOverlayLegend(container) {
    container.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "legend legend--overlay";

    function chip(rgb, key) {
      var item = document.createElement("div");
      item.className = "legend__chip-item";
      var swatch = document.createElement("span");
      swatch.className = "legend__chip";
      swatch.style.background = "rgb(" + rgb.join(",") + ")";
      var text = document.createElement("span");
      text.textContent = window.SQLab.t(key);
      item.appendChild(swatch);
      item.appendChild(text);
      return item;
    }

    wrap.appendChild(chip(COLOR_P1, "legendP1Only"));
    wrap.appendChild(chip([128, 0, 128], "legendBoth"));
    wrap.appendChild(chip(COLOR_P2, "legendP2Only"));
    container.appendChild(wrap);
  }

  // ---------------------------------------------------------------------
  // 高レベルAPI: セクション全体(タブ・トグル・キャンバス・凡例)を構築する
  // ---------------------------------------------------------------------

  function render(container, data) {
    var p1 = data.players.find(function (p) {
      return p.id === "P1";
    });
    var p2 = data.players.find(function (p) {
      return p.id === "P2";
    });
    if (!p1 || !p2 || !p1.metrics.heatmap || !p2.metrics.heatmap) return;

    var gridP1 = p1.metrics.heatmap.grid;
    var gridP2 = p2.metrics.heatmap.grid;
    var maxVal = commonMax(gridP1, gridP2);
    var tZone = (data.metrics_params && data.metrics_params.t_zone) || null;

    var state = { mode: "side", showTZone: true };

    container.innerHTML = "";

    var title = document.createElement("h2");
    title.className = "heatmap__title";
    title.textContent = window.SQLab.t("heatmapSectionTitle");
    container.appendChild(title);

    // --- モード切替タブ ---
    var tabs = document.createElement("div");
    tabs.className = "heatmap__tabs";
    var sideTab = document.createElement("button");
    sideTab.type = "button";
    sideTab.className = "tab-btn tab-btn--active";
    sideTab.textContent = window.SQLab.t("modeSideBySide");
    var overlayTab = document.createElement("button");
    overlayTab.type = "button";
    overlayTab.className = "tab-btn";
    overlayTab.textContent = window.SQLab.t("modeOverlay");
    tabs.appendChild(sideTab);
    tabs.appendChild(overlayTab);
    container.appendChild(tabs);

    // --- T-zone トグル ---
    var tZoneRow = document.createElement("label");
    tZoneRow.className = "tzone-toggle";
    var tZoneCheckbox = document.createElement("input");
    tZoneCheckbox.type = "checkbox";
    tZoneCheckbox.checked = true;
    var tZoneLabelText = document.createElement("span");
    tZoneLabelText.textContent = window.SQLab.t("tZoneToggleLabel");
    tZoneRow.appendChild(tZoneCheckbox);
    tZoneRow.appendChild(tZoneLabelText);
    container.appendChild(tZoneRow);

    // --- キャンバスエリア ---
    var canvasArea = document.createElement("div");
    canvasArea.className = "heatmap__canvases";
    container.appendChild(canvasArea);

    // --- 凡例エリア ---
    var legendArea = document.createElement("div");
    legendArea.className = "heatmap__legend-area";
    container.appendChild(legendArea);

    function containerWidth() {
      var w = canvasArea.clientWidth || container.clientWidth || 320;
      return w;
    }

    function buildSideBySideDom() {
      canvasArea.innerHTML = "";
      canvasArea.classList.remove("heatmap__canvases--overlay");
      canvasArea.classList.add("heatmap__canvases--side");

      var p1Wrap = document.createElement("div");
      p1Wrap.className = "heatmap__court-wrap";
      var p1Label = document.createElement("div");
      p1Label.className = "heatmap__court-label heatmap__court-label--red";
      p1Label.textContent = (p1.display_name || p1.id) + " (P1)";
      var p1Canvas = document.createElement("canvas");
      p1Wrap.appendChild(p1Label);
      p1Wrap.appendChild(p1Canvas);

      var p2Wrap = document.createElement("div");
      p2Wrap.className = "heatmap__court-wrap";
      var p2Label = document.createElement("div");
      p2Label.className = "heatmap__court-label heatmap__court-label--blue";
      p2Label.textContent = (p2.display_name || p2.id) + " (P2)";
      var p2Canvas = document.createElement("canvas");
      p2Wrap.appendChild(p2Label);
      p2Wrap.appendChild(p2Canvas);

      canvasArea.appendChild(p1Wrap);
      canvasArea.appendChild(p2Wrap);

      return { p1Canvas: p1Canvas, p2Canvas: p2Canvas };
    }

    function buildOverlayDom() {
      canvasArea.innerHTML = "";
      canvasArea.classList.remove("heatmap__canvases--side");
      canvasArea.classList.add("heatmap__canvases--overlay");

      var wrap = document.createElement("div");
      wrap.className = "heatmap__court-wrap";
      var canvas = document.createElement("canvas");
      wrap.appendChild(canvas);
      canvasArea.appendChild(wrap);

      return { canvas: canvas };
    }

    function redraw() {
      if (state.mode === "side") {
        var refs = buildSideBySideDom();
        // 幅計算のため一旦レイアウトさせてから描画(2カラム/縦積みでも正しい幅になる)
        var w = refs.p1Canvas.parentElement.clientWidth || containerWidth();
        paintSingle(refs.p1Canvas, w, gridP1, maxVal, COLOR_P1, tZone, state.showTZone);
        paintSingle(refs.p2Canvas, w, gridP2, maxVal, COLOR_P2, tZone, state.showTZone);

        legendArea.innerHTML = "";
        var legendRow = document.createElement("div");
        legendRow.className = "heatmap__legend-row";
        var l1 = document.createElement("div");
        var l2 = document.createElement("div");
        legendRow.appendChild(l1);
        legendRow.appendChild(l2);
        legendArea.appendChild(legendRow);
        renderLegendBar(l1, COLOR_P1, maxVal, window.SQLab.t("legendDwellTime"));
        renderLegendBar(l2, COLOR_P2, maxVal, window.SQLab.t("legendDwellTime"));
      } else {
        var oref = buildOverlayDom();
        var ow = oref.canvas.parentElement.clientWidth || containerWidth();
        paintOverlay(oref.canvas, ow, gridP1, gridP2, maxVal, tZone, state.showTZone);

        legendArea.innerHTML = "";
        renderOverlayLegend(legendArea);
      }
    }

    sideTab.addEventListener("click", function () {
      state.mode = "side";
      sideTab.classList.add("tab-btn--active");
      overlayTab.classList.remove("tab-btn--active");
      redraw();
    });
    overlayTab.addEventListener("click", function () {
      state.mode = "overlay";
      overlayTab.classList.add("tab-btn--active");
      sideTab.classList.remove("tab-btn--active");
      redraw();
    });
    tZoneCheckbox.addEventListener("change", function () {
      state.showTZone = tZoneCheckbox.checked;
      redraw();
    });

    if (currentResizeHandler) {
      window.removeEventListener("resize", currentResizeHandler);
      currentResizeHandler = null;
    }
    var resizeTimer = null;
    currentResizeHandler = function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(redraw, 150);
    };
    window.addEventListener("resize", currentResizeHandler);

    redraw();
  }

  return {
    commonMax: commonMax,
    overlayColorFn: overlayColorFn,
    buildOffscreen: buildOffscreen,
    render: render,
  };
})();
