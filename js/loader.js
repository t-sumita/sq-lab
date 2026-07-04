// loader.js — JSON読込・スキーマ検証。
//
// 重要: このファイル(および sq-lab 全体)は fetch/XHR を一切使用しない。
// デモデータも js/demo-data.js に window.SQLab.DEMO_DATA として同梱済みの
// JS変数から読み込むため、ネットワーク通信は発生しない(file:// でも動作する)。
window.SQLab = window.SQLab || {};

window.SQLab.Loader = (function () {
  var REQUIRED_TOP_FIELDS = ["schema_version", "video", "metrics_params", "players"];

  function validate(data) {
    if (!data || typeof data !== "object") {
      return { ok: false, errorKey: "errorParseFailed", errorVars: {} };
    }

    for (var i = 0; i < REQUIRED_TOP_FIELDS.length; i++) {
      var field = REQUIRED_TOP_FIELDS[i];
      if (!(field in data)) {
        return { ok: false, errorKey: "errorMissingField", errorVars: { field: field } };
      }
    }

    if (!Array.isArray(data.players) || data.players.length === 0) {
      return { ok: false, errorKey: "errorMissingField", errorVars: { field: "players[]" } };
    }

    for (var p = 0; p < data.players.length; p++) {
      var player = data.players[p];
      if (!player || !player.metrics) {
        return { ok: false, errorKey: "errorMissingField", errorVars: { field: "players[].metrics" } };
      }
    }

    if (String(data.schema_version) !== window.SQLab.SUPPORTED_SCHEMA) {
      return {
        ok: false,
        errorKey: "errorSchemaMismatch",
        errorVars: {
          supported: window.SQLab.SUPPORTED_SCHEMA,
          loaded: String(data.schema_version),
        },
      };
    }

    return { ok: true };
  }

  function loadFromText(text, onSuccess, onError) {
    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      onError("errorParseFailed", {});
      return;
    }
    var result = validate(data);
    if (!result.ok) {
      onError(result.errorKey, result.errorVars);
      return;
    }
    onSuccess(data);
  }

  function loadFromFile(file, onSuccess, onError) {
    var reader = new FileReader();
    reader.onload = function (evt) {
      loadFromText(evt.target.result, onSuccess, onError);
    };
    reader.onerror = function () {
      onError("errorGeneric", {});
    };
    reader.readAsText(file);
  }

  function loadDemo(onSuccess, onError) {
    if (!window.SQLab.DEMO_DATA) {
      onError("errorGeneric", {});
      return;
    }
    var result = validate(window.SQLab.DEMO_DATA);
    if (!result.ok) {
      onError(result.errorKey, result.errorVars);
      return;
    }
    onSuccess(window.SQLab.DEMO_DATA);
  }

  return {
    validate: validate,
    loadFromFile: loadFromFile,
    loadDemo: loadDemo,
  };
})();
