// playernames.js — プレイヤー表示名の編集・保存(表示層のみ、エクスポートデータは書き換えない)。
// localStorage に video.file をキーとして保存し、同じJSONの再読込で復元する。
window.SQLab = window.SQLab || {};

window.SQLab.PlayerNames = (function () {
  function storageKey(videoFile) {
    return "sqlab_names:" + videoFile;
  }

  function getOverrides(videoFile) {
    try {
      var raw = localStorage.getItem(storageKey(videoFile));
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function setOverride(videoFile, playerId, name) {
    var overrides = getOverrides(videoFile);
    var trimmed = (name || "").trim();
    if (trimmed) {
      overrides[playerId] = trimmed;
    } else {
      delete overrides[playerId];
    }
    try {
      localStorage.setItem(storageKey(videoFile), JSON.stringify(overrides));
    } catch (e) {
      /* 保存できなくても致命的ではない */
    }
  }

  function resetOverride(videoFile, playerId) {
    var overrides = getOverrides(videoFile);
    delete overrides[playerId];
    try {
      localStorage.setItem(storageKey(videoFile), JSON.stringify(overrides));
    } catch (e) {
      /* noop */
    }
  }

  function hasOverride(videoFile, playerId) {
    var overrides = getOverrides(videoFile);
    return !!overrides[playerId];
  }

  // 表示名を解決する: 編集済み名 > result.jsonのdisplay_name > id(P1/P2)。
  function getName(videoFile, player) {
    var overrides = getOverrides(videoFile);
    if (overrides[player.id]) return overrides[player.id];
    return player.display_name || player.id;
  }

  return {
    getName: getName,
    setOverride: setOverride,
    resetOverride: resetOverride,
    hasOverride: hasOverride,
  };
})();
