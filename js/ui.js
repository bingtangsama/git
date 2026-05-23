// ============================================================
// ui.js  —— HUD 和界面渲染
// ============================================================

var config = require('./config');
var renderer = require('./renderer');

var UI = {
  // 按钮区域缓存
  _btnRect: null,
  _cancelRect: null,

  /** 绘制顶部 HUD */
  drawHUD: function(ctx, gold, life, wave, maxWaves) {
    // HUD 背景
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, config.SCREEN_W, 55);

    var y = 30;

    // 金币
    renderer.text(ctx, '💰 ' + gold, 15, y, '#FFD700', 16, 'left');

    // 生命
    renderer.text(ctx, '❤️ ' + life, config.SCREEN_W / 2, y, '#E74C3C', 16, 'center');

    // 波次
    renderer.text(ctx, '第 ' + wave + '/' + maxWaves + ' 波', config.SCREEN_W - 15, y, '#fff', 14, 'right');
  },

  /** 绘制底部待放置信息 */
  drawPlacingBar: function(ctx, towerTypeKey) {
    if (!towerTypeKey) return;
    var cfg = config.TOWER_TYPES[towerTypeKey];

    // 底部栏
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, config.SCREEN_H - 70, config.SCREEN_W, 70);

    renderer.text(ctx, '点击绿色格子放置: ' + cfg.name, config.SCREEN_W / 2, config.SCREEN_H - 50, cfg.color, 14, 'center');
    renderer.text(ctx, '费用: ' + cfg.cost + ' 金', config.SCREEN_W / 2, config.SCREEN_H - 30, '#F1C40F', 12, 'center');
  },

  /** 绘制取消按钮（放置模式） */
  drawCancelButton: function(ctx) {
    var bw = 80, bh = 36;
    var bx = config.SCREEN_W - bw - 15;
    var by = config.SCREEN_H - 110;

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    renderer.text(ctx, '取消', bx + bw/2, by + bh/2, '#fff', 14, 'center');

    this._cancelRect = { x: bx, y: by, w: bw, h: bh };
  },

  /** 判断点击是否在取消按钮上 */
  hitCancelButton: function(tx, ty) {
    if (!this._cancelRect) return false;
    var r = this._cancelRect;
    return tx >= r.x && tx <= r.x + r.w && ty >= r.y && ty <= r.y + r.h;
  },

  /** 绘制"开始下一波"按钮 */
  drawStartButton: function(ctx) {
    var bw = 160, bh = 50;
    var bx = (config.SCREEN_W - bw) / 2;
    var by = config.SCREEN_H / 2 - bh / 2;

    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#27AE60';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);
    renderer.text(ctx, '开始下一波', config.SCREEN_W / 2, by + bh / 2, '#fff', 18, 'center');

    this._btnRect = { x: bx, y: by, w: bw, h: bh };
    return this._btnRect;
  },

  /** 判断点击是否在开始按钮上 */
  hitStartButton: function(tx, ty) {
    if (!this._btnRect) return false;
    var r = this._btnRect;
    return tx >= r.x && tx <= r.x + r.w && ty >= r.y && ty <= r.y + r.h;
  },

  /** 绘制开始画面 */
  drawStartScreen: function(ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, config.SCREEN_W, config.SCREEN_H);

    // 标题
    renderer.text(ctx, '🎮 肉鸽塔防', config.SCREEN_W / 2, config.SCREEN_H / 3, '#FFD700', 32, 'center');
    renderer.text(ctx, 'Roguelike Tower Defense', config.SCREEN_W / 2, config.SCREEN_H / 3 + 40, '#aaa', 14, 'center');

    // 说明
    var sy = config.SCREEN_H / 2 + 20;
    var lines = [
      '消灭敌人，每波结束后',
      '从3个随机塔中选择1个',
      '合理搭配，挑战10波！'
    ];
    for (var i = 0; i < lines.length; i++) {
      renderer.text(ctx, lines[i], config.SCREEN_W / 2, sy + i * 24, '#ccc', 14, 'center');
    }

    // 开始按钮
    var bw = 160, bh = 50;
    var bx = (config.SCREEN_W - bw) / 2;
    var by = config.SCREEN_H * 0.72;
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);
    renderer.text(ctx, '开始游戏', config.SCREEN_W / 2, by + bh / 2, '#fff', 20, 'center');

    this._btnRect = { x: bx, y: by, w: bw, h: bh };
  },

  /** 绘制游戏结束画面 */
  drawGameOver: function(ctx, isWin, wave, gold) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, config.SCREEN_W, config.SCREEN_H);

    var title = isWin ? '🎉 胜利！' : '💀 游戏结束';
    var color = isWin ? '#FFD700' : '#E74C3C';
    renderer.text(ctx, title, config.SCREEN_W / 2, config.SCREEN_H / 3, color, 32, 'center');

    renderer.text(ctx, '坚持到第 ' + wave + ' 波', config.SCREEN_W / 2, config.SCREEN_H / 2 - 10, '#ccc', 16, 'center');
    renderer.text(ctx, '累计金币: ' + gold, config.SCREEN_W / 2, config.SCREEN_H / 2 + 20, '#FFD700', 14, 'center');

    // 重新开始按钮
    var bw = 160, bh = 50;
    var bx = (config.SCREEN_W - bw) / 2;
    var by = config.SCREEN_H * 0.65;
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#2980B9';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);
    renderer.text(ctx, '再来一局', config.SCREEN_W / 2, by + bh / 2, '#fff', 18, 'center');

    this._btnRect = { x: bx, y: by, w: bw, h: bh };
  },

  // ---- 飘字效果 ----
  floatingTexts: [],

  addFloatingText: function(text, x, y, color) {
    this.floatingTexts.push({
      text: text, x: x, y: y,
      color: color || '#FFD700',
      life: 1.0
    });
  },

  updateFloatingTexts: function(dt) {
    for (var i = this.floatingTexts.length - 1; i >= 0; i--) {
      var ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 30 * dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  },

  drawFloatingTexts: function(ctx) {
    for (var i = 0; i < this.floatingTexts.length; i++) {
      var ft = this.floatingTexts[i];
      ctx.globalAlpha = Math.max(0, ft.life);
      renderer.text(ctx, ft.text, ft.x, ft.y, ft.color, 14, 'center');
    }
    ctx.globalAlpha = 1;
  }
};

module.exports = UI;
