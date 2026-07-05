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

  // デモデータの display_name はマーカー文字列にしてあり、実際の表示名は
  // 言語に応じてi18n経由で解決する(実データのdisplay_nameは翻訳しない)。
  var DEMO_NAME_KEYS = {
    "__DEMO_A__": "demoPlayerAName",
    "__DEMO_B__": "demoPlayerBName",
  };

  // 表示名を解決する: 編集済み名 > デモ名マーカー(言語別) >
  // result.jsonのdisplay_name > id(P1/P2)。
  function getName(videoFile, player) {
    var overrides = getOverrides(videoFile);
    if (overrides[player.id]) return overrides[player.id];
    if (player.display_name && DEMO_NAME_KEYS[player.display_name]) {
      return window.SQLab.t(DEMO_NAME_KEYS[player.display_name]);
    }
    return player.display_name || player.id;
  }

  return {
    getName: getName,
    setOverride: setOverride,
    resetOverride: resetOverride,
    hasOverride: hasOverride,
  };
})();
