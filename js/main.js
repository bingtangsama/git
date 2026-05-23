// ============================================================
// main.js  —— 游戏主控制器（状态机、游戏循环）
// ============================================================

var config = require('./config');
var renderer = require('./renderer');
var Map = require('./map');
var Tower = require('./tower');
var WaveManager = require('./wave');
var Shop = require('./shop');
var UI = require('./ui');

function Game(ctx) {
  this.ctx = ctx;
  this.state = config.STATE.START;
  this.gold = config.INIT_GOLD;
  this.life = config.INIT_LIFE;
  this.towers = [];
  this.enemies = [];
  this.beams = [];
  this.waveManager = new WaveManager();
  this.shop = new Shop();
  this.pendingTowerType = null;
  this.selectedTower = null;
  this.lastTime = 0;
  this.maxWaves = config.WAVES.length;
  this.nextWaveIndex = 0;

  Map.init();
}

Game.prototype.start = function() {
  this.bindTouch();
  this.lastTime = Date.now();
  this.loop();
};

Game.prototype.loop = function() {
  var self = this;
  var now = Date.now();
  var dt = (now - this.lastTime) / 1000;
  this.lastTime = now;

  if (dt > 0.1) dt = 0.016;

  this.update(dt);
  this.render();

  requestAnimationFrame(function() {
    self.loop();
  });
};

// ===================== 更新逻辑 =====================

Game.prototype.update = function(dt) {
  switch (this.state) {
    case config.STATE.START:
      break;

    case config.STATE.PLAYING:
      this.updatePlaying(dt);
      break;

    case config.STATE.SHOP:
    case config.STATE.PLACING:
      UI.updateFloatingTexts(dt);
      this.updateBeams(dt);
      break;

    case config.STATE.GAME_OVER:
    case config.STATE.WIN:
      break;
  }
};

Game.prototype.updateBeams = function(dt) {
  for (var i = this.beams.length - 1; i >= 0; i--) {
    this.beams[i].update(dt);
    if (!this.beams[i].alive) {
      this.beams.splice(i, 1);
    }
  }
};

Game.prototype.updatePlaying = function(dt) {
  this.waveManager.update(dt, this.enemies);

  // 更新敌人
  for (var i = this.enemies.length - 1; i >= 0; i--) {
    var e = this.enemies[i];
    e.update(dt);

    if (!e.alive && e.reachedEnd) {
      this.life -= e.lifeCost;
      this.enemies.splice(i, 1);
      if (this.life <= 0) {
        this.life = 0;
        this.state = config.STATE.GAME_OVER;
        return;
      }
      continue;
    }

    if (!e.alive && !e.reachedEnd) {
      this.gold += e.reward;
      UI.addFloatingText('+' + e.reward, e.pos.x, e.pos.y - 10, '#FFD700');
      this.enemies.splice(i, 1);
      continue;
    }
  }

  // 更新塔（即时伤害，生成光束）
  for (var t = 0; t < this.towers.length; t++) {
    this.towers[t].update(dt, this.enemies, this.beams);
  }

  // 更新光束特效
  this.updateBeams(dt);

  UI.updateFloatingTexts(dt);

  // 波次结束检测
  if (this.state !== config.STATE.GAME_OVER && this.waveManager.isWaveComplete()) {
    this.gold += config.WAVE_BONUS;
    UI.addFloatingText('波次奖励 +' + config.WAVE_BONUS, config.SCREEN_W / 2, config.SCREEN_H / 2, '#2ECC71');

    if (this.nextWaveIndex >= this.maxWaves) {
      this.state = config.STATE.WIN;
    } else {
      this.shop.generateChoices();
      this.state = config.STATE.SHOP;
    }
  }
};

Game.prototype.startNextWave = function() {
  if (this.nextWaveIndex < this.maxWaves) {
    this.waveManager.startWave(this.nextWaveIndex);
    this.nextWaveIndex++;
    this.state = config.STATE.PLAYING;
  }
};

Game.prototype.enterFirstShop = function() {
  this.shop.generateChoices();
  this.state = config.STATE.SHOP;
};

// ===================== 渲染 =====================

Game.prototype.render = function() {
  var ctx = this.ctx;

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, config.SCREEN_W, config.SCREEN_H);

  switch (this.state) {
    case config.STATE.START:
      UI.drawStartScreen(ctx);
      break;

    case config.STATE.PLAYING:
      this.renderGame(ctx);
      break;

    case config.STATE.PLACING:
      this.renderGame(ctx);
      this.renderPlacingOverlay(ctx);
      break;

    case config.STATE.SHOP:
      this.renderGame(ctx);
      this.shop.draw(ctx);
      break;

    case config.STATE.GAME_OVER:
      this.renderGame(ctx);
      UI.drawGameOver(ctx, false, this.nextWaveIndex, this.gold);
      break;

    case config.STATE.WIN:
      this.renderGame(ctx);
      UI.drawGameOver(ctx, true, this.maxWaves, this.gold);
      break;
  }
};

Game.prototype.renderGame = function(ctx) {
  Map.draw(ctx);

  // 光束（塔和敌人之间）
  for (var b = 0; b < this.beams.length; b++) {
    this.beams[b].draw(ctx);
  }

  // 塔
  for (var t = 0; t < this.towers.length; t++) {
    this.towers[t].draw(ctx);
  }

  // 敌人
  for (var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].draw(ctx);
  }

  var displayWave = this.state === config.STATE.PLAYING ? this.nextWaveIndex : this.nextWaveIndex + 1;
  UI.drawHUD(ctx, this.gold, this.life, displayWave, this.maxWaves);
  UI.drawFloatingTexts(ctx);
};

Game.prototype.renderPlacingOverlay = function(ctx) {
  Map.highlightBuildable(ctx);
  UI.drawPlacingBar(ctx, this.pendingTowerType);
  UI.drawCancelButton(ctx);
};

// ===================== 触摸交互 =====================

Game.prototype.bindTouch = function() {
  var self = this;

  if (typeof wx !== 'undefined') {
    wx.onTouchStart(function(res) {
      var touch = res.touches[0];
      self.handleTap(touch.clientX, touch.clientY);
    });
  }
};

Game.prototype.handleTap = function(tx, ty) {
  switch (this.state) {
    case config.STATE.START:
      if (UI.hitStartButton(tx, ty)) {
        this.resetGame();
        this.enterFirstShop();
      }
      break;

    case config.STATE.PLAYING:
      this.handleTapGame(tx, ty);
      break;

    case config.STATE.PLACING:
      this.handleTapPlacing(tx, ty);
      break;

    case config.STATE.SHOP:
      this.handleTapShop(tx, ty);
      break;

    case config.STATE.GAME_OVER:
    case config.STATE.WIN:
      if (UI.hitStartButton(tx, ty)) {
        this.resetGame();
        this.state = config.STATE.START;
      }
      break;
  }
};

Game.prototype.handleTapGame = function(tx, ty) {
  var cell = renderer.worldToCell(tx, ty);
  for (var i = 0; i < this.towers.length; i++) {
    var tw = this.towers[i];
    if (tw.row === cell.r && tw.col === cell.c) {
      if (this.selectedTower) this.selectedTower.selected = false;
      if (tw === this.selectedTower) {
        tw.selected = false;
        this.selectedTower = null;
      } else {
        tw.selected = true;
        this.selectedTower = tw;
      }
      return;
    }
  }
  if (this.selectedTower) {
    this.selectedTower.selected = false;
    this.selectedTower = null;
  }
};

Game.prototype.handleTapPlacing = function(tx, ty) {
  if (UI.hitCancelButton(tx, ty)) {
    this.pendingTowerType = null;
    this.state = config.STATE.SHOP;
    return;
  }

  var cell = renderer.worldToCell(tx, ty);
  if (!Map.isBuildable(cell.r, cell.c)) return;

  var cfg = config.TOWER_TYPES[this.pendingTowerType];
  if (!cfg) return;

  if (this.gold < cfg.cost) {
    UI.addFloatingText('金币不足!', config.SCREEN_W / 2, config.SCREEN_H / 2, '#E74C3C');
    return;
  }

  this.gold -= cfg.cost;
  var tower = new Tower(this.pendingTowerType, cell.r, cell.c);
  this.towers.push(tower);
  Map.markBuilt(cell.r, cell.c);

  this.pendingTowerType = null;
  this.startNextWave();
};

Game.prototype.handleTapShop = function(tx, ty) {
  var idx = this.shop.hitTest(tx, ty);

  if (idx === -2) {
    this.startNextWave();
    return;
  }

  if (idx < 0) return;

  var towerKey = this.shop.select(idx);
  if (!towerKey) return;

  var cfg = config.TOWER_TYPES[towerKey];
  if (this.gold < cfg.cost) {
    UI.addFloatingText('金币不足，请选其他塔或跳过', config.SCREEN_W / 2, config.SCREEN_H * 0.78, '#E74C3C');
    return;
  }

  this.pendingTowerType = towerKey;
  this.state = config.STATE.PLACING;
};

// ===================== 重置 =====================

Game.prototype.resetGame = function() {
  this.gold = config.INIT_GOLD;
  this.life = config.INIT_LIFE;
  this.towers = [];
  this.enemies = [];
  this.beams = [];
  this.pendingTowerType = null;
  this.selectedTower = null;
  this.waveManager = new WaveManager();
  this.shop = new Shop();
  this.nextWaveIndex = 0;
  UI.floatingTexts = [];
  Map.init();
};

module.exports = Game;
