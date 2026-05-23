// ============================================================
// enemy.js  —— 敌人实体类
// ============================================================

var config = require('./config');
var renderer = require('./renderer');

/**
 * 创建一个敌人实例
 * @param {string} type  敌人类型 key（normal/fast/tank）
 * @param {number} waveMultiplier  血量倍率（随波次增加）
 */
function Enemy(type, waveMultiplier) {
  var cfg = config.ENEMY_TYPES[type];
  this.cfg = cfg;
  this.type = type;

  // 位置：从路径第一个点开始
  var startPos = renderer.cellToWorld(config.PATH[0].r, config.PATH[0].c);
  this.pos = { x: startPos.x, y: startPos.y };

  // 属性
  this.maxHp = Math.floor(cfg.hp * (waveMultiplier || 1));
  this.hp = this.maxHp;
  this.speed = cfg.speed;
  this.baseSpeed = cfg.speed;
  this.reward = cfg.reward;
  this.lifeCost = cfg.lifeCost;

  // 路径追踪
  this.pathIndex = 0;
  this.alive = true;
  this.reachedEnd = false;

  // 减速效果
  this.slowTimer = 0;
  this.slowFactor = 1;

  // 死亡动画
  this.deathTimer = 0;
  this.dying = false;
}

Enemy.prototype.update = function(dt) {
  // 死亡动画
  if (this.dying) {
    this.deathTimer += dt;
    if (this.deathTimer > 0.3) {
      this.alive = false;
    }
    return;
  }

  // 减速计时
  if (this.slowTimer > 0) {
    this.slowTimer -= dt;
    this.speed = this.baseSpeed * this.slowFactor;
    if (this.slowTimer <= 0) {
      this.speed = this.baseSpeed;
      this.slowFactor = 1;
    }
  }

  // 沿路径移动
  var nextIdx = this.pathIndex + 1;
  if (nextIdx >= config.PATH.length) {
    this.reachedEnd = true;
    this.alive = false;
    return;
  }

  var target = renderer.cellToWorld(config.PATH[nextIdx].r, config.PATH[nextIdx].c);
  var dx = target.x - this.pos.x;
  var dy = target.y - this.pos.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  var moveStep = this.speed * dt;

  if (moveStep >= dist) {
    // 到达当前路径点
    this.pos.x = target.x;
    this.pos.y = target.y;
    this.pathIndex = nextIdx;
  } else {
    this.pos.x += (dx / dist) * moveStep;
    this.pos.y += (dy / dist) * moveStep;
  }
};

Enemy.prototype.takeDamage = function(amount) {
  if (this.dying) return;
  this.hp -= amount;
  if (this.hp <= 0) {
    this.hp = 0;
    this.dying = true;
  }
};

Enemy.prototype.applySlow = function(factor, duration) {
  this.slowFactor = factor;
  this.slowTimer = duration;
};

Enemy.prototype.draw = function(ctx) {
  if (!this.alive && !this.dying) return;

  ctx.save();
  if (this.dying) {
    // 死亡缩小动画
    var scale = 1 - this.deathTimer / 0.3;
    ctx.globalAlpha = scale;
    var r = this.cfg.radius * scale;
    renderer.circle(ctx, this.pos.x, this.pos.y, r, this.cfg.color);
  } else {
    renderer.drawEnemyShape(ctx, this);
  }
  ctx.restore();
};

/** 计算到某点的距离 */
Enemy.prototype.distTo = function(x, y) {
  var dx = this.pos.x - x;
  var dy = this.pos.y - y;
  return Math.sqrt(dx * dx + dy * dy);
};

module.exports = Enemy;
