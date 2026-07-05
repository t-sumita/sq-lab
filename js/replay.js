// replay.js — リプレイビュー(再生・シーク・倍速・軌跡・欠損の可視化)。
// court.js を再利用してコートを描き、players[].positions を requestAnimationFrame
// で時間軸に沿って再生する。欠損(データが無い時刻)は正直に「表示しない」。
window.SQLab = window.SQLab || {};

window.SQLab.Replay = (function () {
  var COLOR_P1 = "#c53030";
  var COLOR_P2 = "#2b6cb0";
  var GAP_THRESHOLD_S = 0.3; // これを超える隣接サンプル間隔は「欠損」扱い
  var TRAIL_SECONDS = 5;
  var SPEEDS = [1, 2, 4, 8];

  var rafId = null;
  var resizeHandler = null;

  // タブ切替・言語切替・再render時に必ず呼ばれ、実行中のループとリスナーを止める。
  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
  }

  // 時刻tにおける位置を返す。隣接サンプル間隔がGAP_THRESHOLD_S以下なら線形補間、
  // 超える場合や範囲外は欠損としてnullを返す(最後の位置に留め置かない)。
  function samplePosition(positions, t) {
    if (!positions || !positions.length) return null;
    var n = positions.length;
    if (t < positions[0].t - 1e-9 || t > positions[n - 1].t + 1e-9) return null;

    var lo = 0, hi = n - 1;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (positions[mid].t <= t) lo = mid; else hi = mid;
    }
    var a = positions[lo], b = positions[hi];
    if (Math.abs(t - a.t) < 1e-9) return { x_m: a.x_m, y_m: a.y_m };
    if (Math.abs(t - b.t) < 1e-9) return { x_m: b.x_m, y_m: b.y_m };

    var gap = b.t - a.t;
    if (gap <= 0 || gap > GAP_THRESHOLD_S) return null;
    var alpha = (t - a.t) / gap;
    return {
      x_m: a.x_m + (b.x_m - a.x_m) * alpha,
      y_m: a.y_m + (b.y_m - a.y_m) * alpha,
    };
  }

  // [tNow-trailSeconds, tNow] の範囲を、間隔<=GAP_THRESHOLD_Sで連続する
  // 区間ごとに分けて返す(欠損をまたいで線を引かないため)。
  function trailSegments(positions, tNow, trailSeconds) {
    var tStart = tNow - trailSeconds;
    var segments = [];
    var current = [];
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      if (p.t < tStart || p.t > tNow) continue;
      if (current.length > 0 && p.t - current[current.length - 1].t > GAP_THRESHOLD_S) {
        if (current.length > 1) segments.push(current);
        current = [];
      }
      current.push(p);
    }
    if (current.length > 1) segments.push(current);
    return segments;
  }

  function computeTimeDomain(data) {
    var maxT = 0;
    (data.analyzed_segments || []).forEach(function (s) {
      if (s.end_s > maxT) maxT = s.end_s;
    });
    (data.players || []).forEach(function (p) {
      (p.positions || []).forEach(function (pt) {
        if (pt.t > maxT) maxT = pt.t;
      });
    });
    return { start: 0, end: maxT > 0 ? maxT : 1 };
  }

  function fmtTime(s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  // データ充足ストリップ: 主カメラ外(グレー)/ P1・P2のデータがある時間帯(赤・青の帯)。
  function drawCoverageStrip(canvas, cssWidth, domain, p1, p2, analyzedSegments) {
    var dpr = window.devicePixelRatio || 1;
    var cssHeight = 28;
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var span = domain.end - domain.start || 1;
    function xOf(t) {
      return ((t - domain.start) / span) * cssWidth;
    }

    // 背景をグレー(主カメラ外)にし、analyzed_segments の範囲だけ白で上書きする。
    ctx.fillStyle = "#d0d0d0";
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = "#ffffff";
    var segs = (analyzedSegments && analyzedSegments.length)
      ? analyzedSegments
      : [{ start_s: domain.start, end_s: domain.end }];
    segs.forEach(function (seg) {
      var x0 = xOf(seg.start_s);
      var x1 = xOf(seg.end_s);
      ctx.fillRect(x0, 0, Math.max(0, x1 - x0), cssHeight);
    });

    function band(positions, y, color) {
      ctx.fillStyle = color;
      var segsB = [];
      var cur = [];
      for (var i = 0; i < positions.length; i++) {
        var p = positions[i];
        if (cur.length && p.t - cur[cur.length - 1].t > GAP_THRESHOLD_S) {
          segsB.push(cur);
          cur = [];
        }
        cur.push(p);
      }
      if (cur.length) segsB.push(cur);
      segsB.forEach(function (seg) {
        var x0 = xOf(seg[0].t);
        var x1 = xOf(seg[seg.length - 1].t);
        ctx.fillRect(x0, y, Math.max(1, x1 - x0), 10);
      });
    }

    band(p1.positions || [], 3, COLOR_P1);
    band(p2.positions || [], 15, COLOR_P2);
  }

  function render(container, data, showTZone) {
    stop(); // 前回分(別モードからの切替・言語切替による再render)の後始末

    var p1 = data.players.find(function (p) { return p.id === "P1"; });
    var p2 = data.players.find(function (p) { return p.id === "P2"; });
    if (!p1 || !p2) return;

    var domain = computeTimeDomain(data);
    var tZone = (data.metrics_params && data.metrics_params.t_zone) || null;

    container.classList.add("replay");

    var legend = document.createElement("div");
    legend.className = "replay__legend";
    var p1LegendLabel = document.createElement("span");
    p1LegendLabel.className = "replay__legend-item replay__legend-item--red";
    p1LegendLabel.textContent = window.SQLab.PlayerNames.getName(data.video.file, p1) + " (P1)";
    var p2LegendLabel = document.createElement("span");
    p2LegendLabel.className = "replay__legend-item replay__legend-item--blue";
    p2LegendLabel.textContent = window.SQLab.PlayerNames.getName(data.video.file, p2) + " (P2)";
    legend.appendChild(p1LegendLabel);
    legend.appendChild(p2LegendLabel);
    container.appendChild(legend);

    var canvasWrap = document.createElement("div");
    canvasWrap.className = "heatmap__court-wrap replay__court-wrap";
    var canvas = document.createElement("canvas");
    canvasWrap.appendChild(canvas);
    container.appendChild(canvasWrap);

    var controls = document.createElement("div");
    controls.className = "replay__controls";
    container.appendChild(controls);

    var playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "replay__btn replay__playpause";
    playBtn.textContent = "▶"; // ▶ (記号、翻訳不要)
    controls.appendChild(playBtn);

    var timeLabel = document.createElement("span");
    timeLabel.className = "replay__time";
    controls.appendChild(timeLabel);

    var speedsWrap = document.createElement("div");
    speedsWrap.className = "replay__speeds";
    var speedButtons = SPEEDS.map(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "replay__btn tab-btn" + (s === 1 ? " tab-btn--active" : "");
      b.textContent = s + "x";
      speedsWrap.appendChild(b);
      return b;
    });
    controls.appendChild(speedsWrap);

    var trailRow = document.createElement("label");
    trailRow.className = "tzone-toggle";
    var trailCheckbox = document.createElement("input");
    trailCheckbox.type = "checkbox";
    trailCheckbox.checked = true;
    var trailLabelText = document.createElement("span");
    trailLabelText.textContent = window.SQLab.t("trailToggleLabel");
    trailRow.appendChild(trailCheckbox);
    trailRow.appendChild(trailLabelText);
    controls.appendChild(trailRow);

    var coverageCanvas = document.createElement("canvas");
    coverageCanvas.className = "replay__coverage";
    container.appendChild(coverageCanvas);

    var seek = document.createElement("input");
    seek.type = "range";
    seek.className = "replay__seek";
    seek.min = "0";
    seek.max = String(domain.end);
    seek.step = "0.05";
    seek.value = "0";
    container.appendChild(seek);

    var state = { isPlaying: false, t: 0, speed: 1, showTrail: true };

    var Court = window.SQLab.Court;
    var setup = null;

    function setupIfNeeded() {
      var w = canvasWrap.clientWidth || 320;
      setup = Court.setupCanvas(canvas, w);
    }
    setupIfNeeded();
    drawCoverageStrip(coverageCanvas, canvasWrap.clientWidth || 320, domain, p1, p2, data.analyzed_segments);

    function drawFrame() {
      var ctx = setup.ctx;
      Court.drawFloor(ctx, setup.scale, "#ffffff");

      if (state.showTrail) {
        [
          { player: p1, color: COLOR_P1 },
          { player: p2, color: COLOR_P2 },
        ].forEach(function (entry) {
          var segs = trailSegments(entry.player.positions || [], state.t, TRAIL_SECONDS);
          segs.forEach(function (seg) {
            for (var i = 1; i < seg.length; i++) {
              var age = state.t - seg[i].t;
              var alpha = Math.max(0, 1 - age / TRAIL_SECONDS) * 0.6;
              if (alpha <= 0) continue;
              ctx.save();
              ctx.strokeStyle = entry.color;
              ctx.globalAlpha = alpha;
              ctx.lineWidth = Math.max(1, setup.scale * 0.015);
              ctx.beginPath();
              ctx.moveTo(seg[i - 1].x_m * setup.scale, seg[i - 1].y_m * setup.scale);
              ctx.lineTo(seg[i].x_m * setup.scale, seg[i].y_m * setup.scale);
              ctx.stroke();
              ctx.restore();
            }
          });
        });
      }

      Court.drawLines(ctx, setup.scale);
      if (showTZone && tZone) Court.drawTZone(ctx, setup.scale, tZone);

      [
        { player: p1, color: COLOR_P1 },
        { player: p2, color: COLOR_P2 },
      ].forEach(function (entry) {
        var pos = samplePosition(entry.player.positions || [], state.t);
        if (!pos) return; // 欠損: 描画しない(いなかった場所に居させない)
        ctx.save();
        ctx.fillStyle = entry.color;
        ctx.beginPath();
        ctx.arc(pos.x_m * setup.scale, pos.y_m * setup.scale, Math.max(4, setup.scale * 0.05), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      timeLabel.textContent = fmtTime(state.t) + " / " + fmtTime(domain.end);
      seek.value = String(state.t);
    }

    var lastTs = null;
    function loop(ts) {
      if (lastTs === null) lastTs = ts;
      var dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if (state.isPlaying) {
        state.t += dt * state.speed;
        if (state.t >= domain.end) {
          state.t = domain.end;
          state.isPlaying = false;
          playBtn.textContent = "▶";
        }
      }
      drawFrame();
      rafId = requestAnimationFrame(loop);
    }

    playBtn.addEventListener("click", function () {
      state.isPlaying = !state.isPlaying;
      if (state.isPlaying && state.t >= domain.end) state.t = 0; // 末尾で再生押下→最初から
      playBtn.textContent = state.isPlaying ? "❚❚" : "▶"; // ❚❚ / ▶
      lastTs = null;
    });

    speedButtons.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        state.speed = SPEEDS[idx];
        speedButtons.forEach(function (b) { b.classList.remove("tab-btn--active"); });
        btn.classList.add("tab-btn--active");
      });
    });

    trailCheckbox.addEventListener("change", function () {
      state.showTrail = trailCheckbox.checked;
    });

    seek.addEventListener("input", function () {
      state.t = parseFloat(seek.value);
      lastTs = null;
      drawFrame();
    });

    resizeHandler = function () {
      clearTimeout(resizeHandler._t);
      resizeHandler._t = setTimeout(function () {
        setupIfNeeded();
        drawCoverageStrip(coverageCanvas, canvasWrap.clientWidth || 320, domain, p1, p2, data.analyzed_segments);
        drawFrame();
      }, 150);
    };
    window.addEventListener("resize", resizeHandler);

    drawFrame();
    rafId = requestAnimationFrame(loop);
  }

  return { render: render, stop: stop, samplePosition: samplePosition };
})();
