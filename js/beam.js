// ============================================================
// beam.js  —— 光束/射线特效系统
// ============================================================

var renderer = require('./renderer');

/**
 * 创建光束特效
 * @param {number} x1,y1  起点（塔位置）
 * @param {number} x2,y2  终点（目标位置）
 * @param {string} color  颜色
 * @param {string} type   'single'|'path'|'aoe'
 */
function Beam(x1, y1, x2, y2, color, type) {
  this.x1 = x1; this.y1 = y1;
  this.x2 = x2; this.y2 = y2;
  this.color = color;
  this.type = type;
  this.life = 0.25;     // 持续时间（秒）
  this.maxLife = 0.25;
  this.alive = true;

  // 路径穿透：延长射线到屏幕边缘
  if (type === 'path') {
    var dx = x2 - x1, dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      var extend = 800; // 延长长度
      this.x2 = x1 + (dx / dist) * extend;
      this.y2 = y1 + (dy / dist) * extend;
    }
  }

  // AOE：记录爆炸中心和半径
  if (type === 'aoe') {
    this.cx = x2;
    this.cy = y2;
    this.aoeRadius = 60;
  }
}

Beam.prototype.update = function(dt) {
  this.life -= dt;
  if (this.life <= 0) this.alive = false;
};

Beam.prototype.draw = function(ctx) {
  if (!this.alive) return;

  var alpha = this.life / this.maxLife;
  ctx.save();
  ctx.globalAlpha = alpha;

  switch (this.type) {
    case 'single':
      // 细射线
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      // 命中闪光点
      renderer.circle(ctx, this.x2, this.y2, 8 * alpha, this.color);
      break;

    case 'path':
      // 粗穿透射线
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 6 * alpha;
      ctx.stroke();
      // 内层亮线
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 * alpha;
      ctx.stroke();
      break;

    case 'aoe':
      // 从塔到目标的引导线
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.cx, this.cy);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = alpha * 0.5;
      ctx.stroke();
      // 爆炸圆环
      ctx.globalAlpha = alpha;
      var expandR = this.aoeRadius * (1 + (1 - alpha) * 0.5);
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, expandR, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3 * alpha;
      ctx.stroke();
      ctx.fillStyle = this.color.replace(')', ',0.15)').replace('rgb', 'rgba');
      // 用简单方式填充
      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = this.color;
      ctx.fill();
      break;
  }

  ctx.restore();
};

module.exports = Beam;
