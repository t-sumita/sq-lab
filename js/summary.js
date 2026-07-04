// summary.js — 基本情報ヘッダ+P1/P2サマリーカードの描画。
window.SQLab = window.SQLab || {};

window.SQLab.Summary = (function () {
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function fmtDuration(totalSeconds) {
    var s = Math.round(totalSeconds);
    var m = Math.floor(s / 60);
    var rem = s % 60;
    return m + ":" + String(rem).padStart(2, "0");
  }

  function mainCameraSeconds(data) {
    var segs = data.analyzed_segments || [];
    var total = 0;
    segs.forEach(function (seg) {
      total += seg.end_s - seg.start_s;
    });
    return total;
  }

  function renderMatchInfo(container, data) {
    container.innerHTML = "";
    var title = el("h2", "match-info__title", window.SQLab.t("matchInfoTitle"));
    container.appendChild(title);

    var list = el("dl", "match-info__list");

    function row(labelKey, value) {
      var dt = el("dt", null, window.SQLab.t(labelKey));
      var dd = el("dd", null, value);
      list.appendChild(dt);
      list.appendChild(dd);
    }

    row("videoFileLabel", data.video.file);
    row("analyzedFpsLabel", data.video.analyzed_fps + " fps");
    row("mainCameraDurationLabel", fmtDuration(mainCameraSeconds(data)));
    row(
      "generatorLabel",
      (data.generator && data.generator.name) +
        " v" +
        (data.generator && data.generator.version) +
        " (schema " +
        data.schema_version +
        ")"
    );

    container.appendChild(list);

    if (data.unassigned_track_ids && data.unassigned_track_ids.length > 0) {
      var note = el("p", "notice notice--muted", window.SQLab.t("unassignedNote"));
      container.appendChild(note);
    }
  }

  function metricCard(labelKey, value, unit) {
    var card = el("div", "metric");
    card.appendChild(el("span", "metric__label", window.SQLab.t(labelKey)));
    card.appendChild(el("span", "metric__value", value + (unit ? " " + unit : "")));
    return card;
  }

  function renderPlayerCard(player, colorClass, data) {
    var card = el("div", "player-card " + colorClass);

    var header = el("div", "player-card__header");
    var name = (player.display_name ? player.display_name : player.id);
    header.appendChild(el("span", "player-card__name", name + " (" + player.id + ")"));
    card.appendChild(header);

    var m = player.metrics;
    var grid = el("div", "player-card__metrics");
    grid.appendChild(metricCard("metricDistance", m.distance_m, "m"));
    grid.appendChild(metricCard("metricWorkRate", m.work_rate_m_per_min, "m/min"));

    var tz = (data.metrics_params && data.metrics_params.t_zone) || {};
    var tCard = metricCard("metricTDominance", m.t_occupancy_pct, "%");
    var tNote = el(
      "p",
      "metric__note",
      window.SQLab.t("tDominanceNote", {
        a: tz.a_m,
        b: tz.b_m,
        offset: tz.offset_m,
      })
    );
    tCard.appendChild(tNote);
    grid.appendChild(tCard);

    grid.appendChild(metricCard("metricCoverage", m.coverage_pct, "%"));
    grid.appendChild(metricCard("metricAvgSpeed", m.avg_speed_mps, "m/s"));

    card.appendChild(grid);
    return card;
  }

  function render(matchInfoEl, cardsEl, data) {
    renderMatchInfo(matchInfoEl, data);

    cardsEl.innerHTML = "";
    var p1 = data.players.find(function (p) {
      return p.id === "P1";
    });
    var p2 = data.players.find(function (p) {
      return p.id === "P2";
    });
    if (p1) cardsEl.appendChild(renderPlayerCard(p1, "player-card--red", data));
    if (p2) cardsEl.appendChild(renderPlayerCard(p2, "player-card--blue", data));
  }

  return { render: render };
})();
