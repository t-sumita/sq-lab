// heatmap.js — ヒートマップ描画(並置/重畳・補間・T-zone表示)。
// Court モジュール(court.js)を使ってコートを描き、その上にヒートマップを重ねる。
//
// S3でタブ構造(Side by Side / Overlay / Replay)を views.js に引き上げたため、
// このモジュールは「与えられた canvasArea/legendArea に描画する」低レベルAPI
// (renderSideBySide / renderOverlay)のみを提供する。タブ・T-zoneトグル・
// リサイズ監視は views.js が一元管理する。
window.SQLab = window.SQLab || {};

window.SQLab.Heatmap = (function () {
  var MAX_ALPHA = 0.85;
  var COLOR_P1 = [197, 48, 48]; // --color-p1 (#c53030) と同一
  var COLOR_P2 = [43, 108, 176]; // --color-p2 (#2b6cb0) と同一

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
  // views.js から呼ばれる描画API(タブ・トグル・リサイズ監視は持たない)
  // ---------------------------------------------------------------------

  function renderSideBySide(canvasArea, legendArea, data, showTZone) {
    var p1 = data.players.find(function (p) { return p.id === "P1"; });
    var p2 = data.players.find(function (p) { return p.id === "P2"; });
    if (!p1 || !p2 || !p1.metrics.heatmap || !p2.metrics.heatmap) return;

    var gridP1 = p1.metrics.heatmap.grid;
    var gridP2 = p2.metrics.heatmap.grid;
    var maxVal = commonMax(gridP1, gridP2);
    var tZone = (data.metrics_params && data.metrics_params.t_zone) || null;

    canvasArea.classList.add("heatmap__canvases--side");

    var p1Wrap = document.createElement("div");
    p1Wrap.className = "heatmap__court-wrap";
    var p1Label = document.createElement("div");
    p1Label.className = "heatmap__court-label heatmap__court-label--red";
    p1Label.textContent = window.SQLab.PlayerNames.getName(data.video.file, p1) + " (P1)";
    var p1Canvas = document.createElement("canvas");
    p1Wrap.appendChild(p1Label);
    p1Wrap.appendChild(p1Canvas);

    var p2Wrap = document.createElement("div");
    p2Wrap.className = "heatmap__court-wrap";
    var p2Label = document.createElement("div");
    p2Label.className = "heatmap__court-label heatmap__court-label--blue";
    p2Label.textContent = window.SQLab.PlayerNames.getName(data.video.file, p2) + " (P2)";
    var p2Canvas = document.createElement("canvas");
    p2Wrap.appendChild(p2Label);
    p2Wrap.appendChild(p2Canvas);

    canvasArea.appendChild(p1Wrap);
    canvasArea.appendChild(p2Wrap);

    var w = p1Wrap.clientWidth || canvasArea.clientWidth || 320;
    paintSingle(p1Canvas, w, gridP1, maxVal, COLOR_P1, tZone, showTZone);
    paintSingle(p2Canvas, w, gridP2, maxVal, COLOR_P2, tZone, showTZone);

    var legendRow = document.createElement("div");
    legendRow.className = "heatmap__legend-row";
    var l1 = document.createElement("div");
    var l2 = document.createElement("div");
    legendRow.appendChild(l1);
    legendRow.appendChild(l2);
    legendArea.appendChild(legendRow);
    renderLegendBar(l1, COLOR_P1, maxVal, window.SQLab.t("legendDwellTime"));
    renderLegendBar(l2, COLOR_P2, maxVal, window.SQLab.t("legendDwellTime"));
  }

  function renderOverlay(canvasArea, legendArea, data, showTZone) {
    var p1 = data.players.find(function (p) { return p.id === "P1"; });
    var p2 = data.players.find(function (p) { return p.id === "P2"; });
    if (!p1 || !p2 || !p1.metrics.heatmap || !p2.metrics.heatmap) return;

    var gridP1 = p1.metrics.heatmap.grid;
    var gridP2 = p2.metrics.heatmap.grid;
    var maxVal = commonMax(gridP1, gridP2);
    var tZone = (data.metrics_params && data.metrics_params.t_zone) || null;

    canvasArea.classList.add("heatmap__canvases--overlay");

    var wrap = document.createElement("div");
    wrap.className = "heatmap__court-wrap";
    var canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    canvasArea.appendChild(wrap);

    var w = wrap.clientWidth || canvasArea.clientWidth || 320;
    paintOverlay(canvas, w, gridP1, gridP2, maxVal, tZone, showTZone);

    renderOverlayLegend(legendArea);
  }

  return {
    commonMax: commonMax,
    overlayColorFn: overlayColorFn,
    buildOffscreen: buildOffscreen,
    renderSideBySide: renderSideBySide,
    renderOverlay: renderOverlay,
  };
})();
