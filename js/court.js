// court.js — コート描画の共通モジュール(Canvas、真上視点)。
// S2ヒートマップ・S3リプレイの両方から再利用する。
//
// 座標系(squash-lab規約と同一): x=0(左)〜6.4m(右)、y=0(前壁,上端)〜9.75m(後壁,下端)。
window.SQLab = window.SQLab || {};

window.SQLab.Court = (function () {
  var WIDTH_M = 6.4;
  var LENGTH_M = 9.75;
  var SHORT_LINE_Y = 5.44;
  var HALF_COURT_X = 3.2;
  var SERVICE_BOX_M = 1.6;

  // canvas要素をコンテナ幅とdevicePixelRatioに応じてセットアップする。
  // 戻り値の ctx はCSSピクセル単位で描画できるよう変換済み。
  function setupCanvas(canvas, cssWidth) {
    var aspect = LENGTH_M / WIDTH_M;
    var cssHeight = cssWidth * aspect;
    var dpr = window.devicePixelRatio || 1;

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));

    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var scale = cssWidth / WIDTH_M; // CSSピクセル / メートル
    return { ctx: ctx, cssWidth: cssWidth, cssHeight: cssHeight, scale: scale };
  }

  function drawFloor(ctx, scale, color) {
    ctx.save();
    ctx.fillStyle = color || "#ffffff";
    ctx.fillRect(0, 0, WIDTH_M * scale, LENGTH_M * scale);
    ctx.restore();
  }

  function drawLines(ctx, scale, options) {
    options = options || {};
    var color = options.color || "#333333";
    var lineWidth = options.lineWidth || Math.max(1, scale * 0.01);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    function line(x0, y0, x1, y1) {
      ctx.beginPath();
      ctx.moveTo(x0 * scale, y0 * scale);
      ctx.lineTo(x1 * scale, y1 * scale);
      ctx.stroke();
    }

    // 外周
    line(0, 0, WIDTH_M, 0);
    line(WIDTH_M, 0, WIDTH_M, LENGTH_M);
    line(WIDTH_M, LENGTH_M, 0, LENGTH_M);
    line(0, LENGTH_M, 0, 0);

    // ショートライン
    line(0, SHORT_LINE_Y, WIDTH_M, SHORT_LINE_Y);

    // ハーフコートライン(ショートライン後方のみ)
    line(HALF_COURT_X, SHORT_LINE_Y, HALF_COURT_X, LENGTH_M);

    // サービスボックス(左右、1.6m四方)
    ctx.strokeRect(0, SHORT_LINE_Y * scale, SERVICE_BOX_M * scale, SERVICE_BOX_M * scale);
    ctx.strokeRect(
      (WIDTH_M - SERVICE_BOX_M) * scale,
      SHORT_LINE_Y * scale,
      SERVICE_BOX_M * scale,
      SERVICE_BOX_M * scale
    );

    // T点マーカー(十字)
    var tX = HALF_COURT_X * scale;
    var tY = SHORT_LINE_Y * scale;
    var r = Math.max(3, scale * 0.03);
    ctx.beginPath();
    ctx.moveTo(tX - r, tY);
    ctx.lineTo(tX + r, tY);
    ctx.moveTo(tX, tY - r);
    ctx.lineTo(tX, tY + r);
    ctx.stroke();

    ctx.restore();
  }

  // T-zone楕円(点線)。tZone: {a_m, b_m, offset_m}
  function drawTZone(ctx, scale, tZone, options) {
    options = options || {};
    var cx = HALF_COURT_X * scale;
    var cy = (SHORT_LINE_Y + tZone.offset_m) * scale;
    var rx = tZone.a_m * scale;
    var ry = tZone.b_m * scale;

    ctx.save();
    ctx.strokeStyle = options.color || "#444444";
    ctx.lineWidth = options.lineWidth || Math.max(1, scale * 0.01);
    ctx.setLineDash([scale * 0.06, scale * 0.05]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  return {
    WIDTH_M: WIDTH_M,
    LENGTH_M: LENGTH_M,
    SHORT_LINE_Y: SHORT_LINE_Y,
    HALF_COURT_X: HALF_COURT_X,
    SERVICE_BOX_M: SERVICE_BOX_M,
    setupCanvas: setupCanvas,
    drawFloor: drawFloor,
    drawLines: drawLines,
    drawTZone: drawTZone,
  };
})();
