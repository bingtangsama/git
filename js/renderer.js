// ============================================================
// renderer.js  —— Canvas 几何图形绘制工具
// ============================================================

var config = require('./config');

var Renderer = {
  // --- 基础图形 ---

  /** 绘制圆形 */
  circle: function(ctx, x, y, r, fillColor, strokeColor, lineWidth) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 2; ctx.stroke(); }
  },

  /** 绘制方形（居中） */
  rect: function(ctx, x, y, w, h, fillColor, strokeColor) {
    ctx.beginPath();
    ctx.rect(x - w/2, y - h/2, w, h);
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke(); }
  },

  /** 绘制三角形（顶点朝上） */
  triangle: function(ctx, x, y, size, fillColor, strokeColor) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.866, y + size * 0.5);
    ctx.lineTo(x + size * 0.866, y + size * 0.5);
    ctx.closePath();
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke(); }
  },

  /** 绘制菱形 */
  diamond: function(ctx, x, y, size, fillColor, strokeColor) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke(); }
  },

  /** 绘制六边形 */
  hexagon: function(ctx, x, y, size, fillColor, strokeColor) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = Math.PI / 3 * i - Math.PI / 6;
      var px = x + size * Math.cos(angle);
      var py = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke(); }
  },

  // --- 游戏专用绘制 ---

  /** 绘制血条（在目标上方） */
  healthBar: function(ctx, x, y, width, ratio) {
    var h = 4;
    var bx = x - width / 2;
    var by = y;
    // 背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(bx, by, width, h);
    // 血量
    var c = ratio > 0.5 ? '#2ECC71' : (ratio > 0.25 ? '#F1C40F' : '#E74C3C');
    ctx.fillStyle = c;
    ctx.fillRect(bx, by, width * Math.max(0, ratio), h);
  },

  /** 绘制射程圈 */
  rangeCircle: function(ctx, x, y, range) {
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();
  },

  /** 绘制网格 */
  grid: function(ctx) {
    var ox = config.MAP_X, oy = config.MAP_Y;
    var w = config.MAP_W, h = config.MAP_H;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    // 垂直线
    for (var c = 0; c <= config.COLS; c++) {
      var x = ox + c * config.CELL;
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + h); ctx.stroke();
    }
    // 水平线
    for (var r = 0; r <= config.ROWS; r++) {
      var y = oy + r * config.CELL;
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + w, y); ctx.stroke();
    }
  },

  /** 格子坐标 → 世界像素坐标（格子中心） */
  cellToWorld: function(row, col) {
    return {
      x: config.MAP_X + col * config.CELL + config.CELL / 2,
      y: config.MAP_Y + row * config.CELL + config.CELL / 2
    };
  },

  /** 世界像素坐标 → 格子坐标 */
  worldToCell: function(wx, wy) {
    var col = Math.floor((wx - config.MAP_X) / config.CELL);
    var row = Math.floor((wy - config.MAP_Y) / config.CELL);
    return { r: row, c: col };
  },

  /** 绘制塔的图形（根据类型） */
  drawTowerShape: function(ctx, x, y, towerType, size) {
    var s = size || 16;
    var color = towerType.color;
    switch (towerType.shape) {
      case 'sniper':
        // 方形底座 + 三角炮管
        this.rect(ctx, x, y, s, s, '#444', color);
        this.triangle(ctx, x, y - s * 0.2, s * 0.5, color);
        break;
      case 'machine':
        // 方形底座 + 圆形炮管
        this.rect(ctx, x, y, s, s, '#444', color);
        this.circle(ctx, x, y, s * 0.35, color);
        break;
      case 'ice':
        // 菱形
        this.diamond(ctx, x, y, s * 0.7, color, '#fff');
        break;
      case 'cannon':
        // 六边形
        this.hexagon(ctx, x, y, s * 0.7, color, '#fff');
        break;
    }
  },

  /** 绘制敌人图形 */
  drawEnemyShape: function(ctx, enemy) {
    var pos = enemy.pos;
    var cfg = enemy.cfg;
    // 阴影
    this.circle(ctx, pos.x + 2, pos.y + 2, cfg.radius, 'rgba(0,0,0,0.3)');
    // 本体
    this.circle(ctx, pos.x, pos.y, cfg.radius, cfg.color, '#fff', 1.5);
    // 冰冻效果
    if (enemy.slowTimer > 0) {
      this.circle(ctx, pos.x, pos.y, cfg.radius + 3, null, '#00FFFF', 2);
    }
    // 血条
    this.healthBar(ctx, pos.x, pos.y - cfg.radius - 8, cfg.radius * 2.5, enemy.hp / enemy.maxHp);
  },

  /** 绘制子弹 */
  drawBullet: function(ctx, x, y, color, isAoe) {
    var r = isAoe ? 5 : 3;
    this.circle(ctx, x, y, r, color || '#fff');
  },

  /** 文字工具 */
  text: function(ctx, str, x, y, color, size, align) {
    ctx.fillStyle = color || '#fff';
    ctx.font = (size || 14) + 'px Arial';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }
};

module.exports = Renderer;
