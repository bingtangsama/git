// ============================================================
// projectile.js  —— 子弹/投射物
// ============================================================

var config = require('./config');
var renderer = require('./renderer');

/**
 * 创建子弹
 * @param {number} x       起始 x
 * @param {number} y       起始 y
 * @param {object} target  目标敌人引用
 * @param {number} damage  伤害值
 * @param {string} color   颜色
 * @param {number} aoe     AOE 范围（0=无）
 * @param {number} slow    减速比例（0=无）
 */
function Projectile(x, y, target, damage, color, aoe, slow) {
  this.x = x;
  this.y = y;
  this.target = target;
  this.damage = damage;
  this.color = color || '#fff';
  this.aoe = aoe || 0;
  this.slow = slow || 0;
  this.speed = config.BULLET_SPEED;
  this.alive = true;
}

Projectile.prototype.update = function(dt, enemies) {
  if (!this.alive) return;

  // 如果目标已死，子弹消失
  if (!this.target || !this.target.alive) {
    this.alive = false;
    return;
  }

  // 向目标移动
  var dx = this.target.pos.x - this.x;
  var dy = this.target.pos.y - this.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  var moveStep = this.speed * dt;

  if (moveStep >= dist) {
    // 命中！
    this.x = this.target.pos.x;
    this.y = this.target.pos.y;
    this.onHit(enemies);
  } else {
    this.x += (dx / dist) * moveStep;
    this.y += (dy / dist) * moveStep;
  }
};

Projectile.prototype.onHit = function(enemies) {
  this.alive = false;

  if (this.aoe > 0) {
    // AOE 伤害：对范围内所有敌人
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.alive || e.dying) continue;
      var d = e.distTo(this.x, this.y);
      if (d <= this.aoe) {
        e.takeDamage(this.damage);
        if (this.slow > 0) {
          e.applySlow(1 - this.slow, 2);
        }
      }
    }
  } else {
    // 单体伤害
    if (this.target && this.target.alive && !this.target.dying) {
      this.target.takeDamage(this.damage);
      if (this.slow > 0) {
        this.target.applySlow(1 - this.slow, 2);
      }
    }
  }
};

Projectile.prototype.draw = function(ctx) {
  if (!this.alive) return;
  renderer.drawBullet(ctx, this.x, this.y, this.color, this.aoe > 0);
};

module.exports = Projectile;
