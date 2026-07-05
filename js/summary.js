// summary.js — 基本情報ヘッダ+P1/P2サマリーカードの描画+プレイヤー名編集。
window.SQLab = window.SQLab || {};

window.SQLab.Summary = (function () {
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function infoIcon(anchor) {
    var a = document.createElement("a");
    a.className = "info-icon";
    a.href = "guide.html#" + anchor;
    a.textContent = "ⓘ"; // ⓘ
    a.setAttribute("aria-label", "guide");
    return a;
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
    // 「squash-lab」という内部ツール名は利用者向け文言に出さない(the Analyzer に統一)。
    row(
      "generatorLabel",
      window.SQLab.t("analyzerName") +
        " v" + (data.generator && data.generator.version) +
        " (schema " + data.schema_version + ")"
    );

    container.appendChild(list);

    if (data.unassigned_track_ids && data.unassigned_track_ids.length > 0) {
      var note = el("p", "notice notice--muted", window.SQLab.t("unassignedNote"));
      var link = infoIcon("unassigned");
      note.appendChild(document.createTextNode(" "));
      note.appendChild(link);
      container.appendChild(note);
    }
  }

  function metricCard(labelKey, value, unit, anchor) {
    var card = el("div", "metric");
    var labelRow = el("span", "metric__label-row");
    labelRow.appendChild(el("span", "metric__label", window.SQLab.t(labelKey)));
    labelRow.appendChild(infoIcon(anchor));
    card.appendChild(labelRow);
    card.appendChild(el("span", "metric__value", value + (unit ? " " + unit : "")));
    return card;
  }

  // --- プレイヤー名編集 ---------------------------------------------------

  function renderNameEditor(nameEl, videoFile, player, onNameChange) {
    nameEl.innerHTML = "";

    var textSpan = el("span", "player-card__name-text", window.SQLab.PlayerNames.getName(videoFile, player));
    nameEl.appendChild(textSpan);

    var editBtn = el("button", "player-card__edit-btn", "✎"); // ✎
    editBtn.type = "button";
    editBtn.setAttribute("aria-label", "edit name");
    nameEl.appendChild(editBtn);

    if (window.SQLab.PlayerNames.hasOverride(videoFile, player.id)) {
      var resetBtn = el("button", "player-card__reset-btn", window.SQLab.t("resetNameLabel"));
      resetBtn.type = "button";
      resetBtn.addEventListener("click", function (evt) {
        evt.stopPropagation();
        window.SQLab.PlayerNames.resetOverride(videoFile, player.id);
        if (onNameChange) onNameChange();
      });
      nameEl.appendChild(resetBtn);
    }

    function startEdit() {
      var current = window.SQLab.PlayerNames.getName(videoFile, player);
      nameEl.innerHTML = "";
      var input = document.createElement("input");
      input.type = "text";
      input.className = "player-card__name-input";
      input.value = current;
      nameEl.appendChild(input);
      input.focus();
      input.select();

      function commit() {
        window.SQLab.PlayerNames.setOverride(videoFile, player.id, input.value);
        if (onNameChange) onNameChange();
      }
      function cancel() {
        renderNameEditor(nameEl, videoFile, player, onNameChange);
      }

      input.addEventListener("keydown", function (evt) {
        if (evt.key === "Enter") {
          evt.preventDefault();
          commit();
        } else if (evt.key === "Escape") {
          evt.preventDefault();
          cancel();
        }
      });
      input.addEventListener("blur", commit);
    }

    // PC: ダブルクリックで編集開始。タッチ端末: 誤操作を避けるため鉛筆アイコンのみで開始。
    textSpan.addEventListener("dblclick", startEdit);
    editBtn.addEventListener("click", startEdit);
  }

  function renderPlayerCard(player, colorClass, data, onNameChange) {
    var card = el("div", "player-card " + colorClass);

    var header = el("div", "player-card__header");
    var nameEl = el("span", "player-card__name");
    header.appendChild(nameEl);
    var idBadge = el("span", "player-card__id-badge", player.id);
    header.appendChild(idBadge);
    card.appendChild(header);

    renderNameEditor(nameEl, data.video.file, player, onNameChange);

    var m = player.metrics;
    var grid = el("div", "player-card__metrics");
    grid.appendChild(metricCard("metricDistance", m.distance_m, "m", "distance"));
    grid.appendChild(metricCard("metricWorkRate", m.work_rate_m_per_min, "m/min", "work-rate"));
    grid.appendChild(metricCard("metricTDominance", m.t_occupancy_pct, "%", "t-dominance"));
    grid.appendChild(metricCard("metricCoverage", m.coverage_pct, "%", "coverage"));
    grid.appendChild(metricCard("metricAvgSpeed", m.avg_speed_mps, "m/s", "avg-speed"));

    card.appendChild(grid);
    return card;
  }

  function render(matchInfoEl, cardsEl, data, onNameChange) {
    renderMatchInfo(matchInfoEl, data);

    var sectionTitle = cardsEl.previousElementSibling;
    // サマリー見出し(ⓘ付き)を挿入済みでなければ挿入する
    if (!sectionTitle || !sectionTitle.classList || !sectionTitle.classList.contains("summary-cards__title")) {
      var titleEl = el("h2", "summary-cards__title heatmap__title");
      titleEl.appendChild(document.createTextNode(window.SQLab.t("summarySectionTitle") + " "));
      titleEl.appendChild(infoIcon("summary"));
      cardsEl.parentNode.insertBefore(titleEl, cardsEl);
    } else {
      sectionTitle.innerHTML = "";
      sectionTitle.appendChild(document.createTextNode(window.SQLab.t("summarySectionTitle") + " "));
      sectionTitle.appendChild(infoIcon("summary"));
    }

    cardsEl.innerHTML = "";
    var p1 = data.players.find(function (p) {
      return p.id === "P1";
    });
    var p2 = data.players.find(function (p) {
      return p.id === "P2";
    });
    if (p1) cardsEl.appendChild(renderPlayerCard(p1, "player-card--red", data, onNameChange));
    if (p2) cardsEl.appendChild(renderPlayerCard(p2, "player-card--blue", data, onNameChange));
  }

  return { render: render };
})();
