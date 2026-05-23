// ============================================================
// shop.js  —— 肉鸽抽塔系统（3选1）
// ============================================================

var config = require('./config');
var renderer = require('./renderer');

var DAMAGE_TYPE_LABELS = {
  single: '单体',
  path: '穿透',
  aoe: '群体'
};

function Shop() {
  this.choices = [];
  this.selectedIndex = -1;
  this.cardWidth = 90;
  this.cardHeight = 140;
  this.cardGap = 12;
  this._skipRect = null;
}

Shop.prototype.generateChoices = function() {
  this.choices = [];
  this.selectedIndex = -1;

  var keys = Object.keys(config.TOWER_TYPES);
  for (var i = 0; i < 3; i++) {
    var key = keys[Math.floor(Math.random() * keys.length)];
    this.choices.push({
      key: key,
      cfg: config.TOWER_TYPES[key]
    });
  }
};

Shop.prototype.getCardRects = function() {
  var totalW = this.cardWidth * 3 + this.cardGap * 2;
  var startX = (config.SCREEN_W - totalW) / 2;
  var startY = config.SCREEN_H / 2 - this.cardHeight / 2;
  var rects = [];

  for (var i = 0; i < 3; i++) {
    rects.push({
      x: startX + i * (this.cardWidth + this.cardGap),
      y: startY,
      w: this.cardWidth,
      h: this.cardHeight
    });
  }
  return rects;
};

Shop.prototype.hitTest = function(tx, ty) {
  var rects = this.getCardRects();
  for (var i = 0; i < rects.length; i++) {
    var r = rects[i];
    if (tx >= r.x && tx <= r.x + r.w && ty >= r.y && ty <= r.y + r.h) {
      return i;
    }
  }
  if (this._skipRect) {
    var sr = this._skipRect;
    if (tx >= sr.x && tx <= sr.x + sr.w && ty >= sr.y && ty <= sr.y + sr.h) {
      return -2;
    }
  }
  return -1;
};

Shop.prototype.select = function(index) {
  if (index < 0 || index >= this.choices.length) return null;
  this.selectedIndex = index;
  return this.choices[index].key;
};

Shop.prototype.draw = function(ctx) {
  // 半透明遮罩
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, config.SCREEN_W, config.SCREEN_H);

  // 标题
  renderer.text(ctx, '选择奖励', config.SCREEN_W / 2, config.SCREEN_H / 2 - 110, '#FFD700', 24, 'center');

  var rects = this.getCardRects();

  for (var i = 0; i < this.choices.length; i++) {
    var choice = this.choices[i];
    var cfg = choice.cfg;
    var rect = rects[i];

    var isSelected = (i === this.selectedIndex);
    ctx.fillStyle = isSelected ? 'rgba(255,215,0,0.3)' : 'rgba(60,60,60,0.9)';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = isSelected ? '#FFD700' : '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

    // 塔图形
    var cx = rect.x + rect.w / 2;
    var cy = rect.y + 40;
    renderer.drawTowerShape(ctx, cx, cy, cfg, 20);

    // 名称
    renderer.text(ctx, cfg.name, cx, rect.y + 72, cfg.color, 13, 'center');

    // 属性信息
    var infoY = rect.y + 88;
    renderer.text(ctx, '伤害:' + cfg.damage, cx, infoY, '#ccc', 10, 'center');

    // 伤害类型标签
    var typeLabel = DAMAGE_TYPE_LABELS[cfg.damageType] || cfg.damageType;
    var typeColor = cfg.damageType === 'single' ? '#E74C3C' :
                    cfg.damageType === 'path' ? '#E67E22' : '#00CED1';
    renderer.text(ctx, typeLabel, cx, infoY + 14, typeColor, 11, 'center');

    // 费用
    renderer.text(ctx, '费用:' + cfg.cost + '金', cx, infoY + 28, '#F1C40F', 10, 'center');

    // 说明
    if (cfg.desc) {
      renderer.text(ctx, cfg.desc, cx, rect.y + rect.h - 16, '#aaa', 9, 'center');
    }
  }

  // 跳过按钮
  var sbw = 100, sbh = 36;
  var sbx = (config.SCREEN_W - sbw) / 2;
  var sby = config.SCREEN_H / 2 + this.cardHeight / 2 + 30;
  ctx.fillStyle = 'rgba(100,100,100,0.8)';
  ctx.fillRect(sbx, sby, sbw, sbh);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.strokeRect(sbx, sby, sbw, sbh);
  renderer.text(ctx, '跳过', config.SCREEN_W / 2, sby + sbh / 2, '#aaa', 14, 'center');

  this._skipRect = { x: sbx, y: sby, w: sbw, h: sbh };
};

module.exports = Shop;
