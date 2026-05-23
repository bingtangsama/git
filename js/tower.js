// ============================================================
// tower.js  —— 塔实体类（即时伤害，全局射程）
// ============================================================

var config = require('./config');
var renderer = require('./renderer');
var Beam = require('./beam');

/**
 * 创建一个塔实例
 * @param {string} typeKey  塔类型 key
 * @param {number} row      格子行
 * @param {number} col      格子列
 */
function Tower(typeKey, row, col) {
  var cfg = config.TOWER_TYPES[typeKey];
  this.cfg = cfg;
  this.typeKey = typeKey;
  this.row = row;
  this.col = col;

  var wp = renderer.cellToWorld(row, col);
  this.x = wp.x;
  this.y = wp.y;

  this.damage = cfg.damage;
  this.fireRate = cfg.fireRate;
  this.damageType = cfg.damageType;
  this.color = cfg.color;
  this.shape = cfg.shape;
  this.slow = cfg.slow || 0;

  this.cooldown = 0;
  this.target = null;
  this.selected = false;
}

Tower.prototype.update = function(dt, enemies, beams) {
  if (this.cooldown > 0) {
    this.cooldown -= dt * 1000;
    return;
  }

  // 寻找目标（全局范围，优先攻击路径最前面的敌人）
  this.target = this.findTarget(enemies);
  if (!this.target) return;

  this.cooldown = this.fireRate;

  // 根据伤害类型执行攻击
  switch (this.damageType) {
    case 'single':
      this.attackSingle(this.target, beams);
      break;
    case 'path':
      this.attackPath(this.target, enemies, beams);
      break;
    case 'aoe':
      this.attackAoe(this.target, enemies, beams);
      break;
  }
};

/** 单体伤害：攻击一个敌人 */
Tower.prototype.attackSingle = function(enemy, beams) {
  enemy.takeDamage(this.damage);
  if (this.slow > 0) {
    enemy.applySlow(1 - this.slow, 2);
  }
  beams.push(new Beam(this.x, this.y, enemy.pos.x, enemy.pos.y, this.color, 'single'));
};

/** 路径伤害：穿透射线，伤害路径上所有敌人 */
Tower.prototype.attackPath = function(enemy, enemies, beams) {
  var tx = enemy.pos.x, ty = enemy.pos.y;
  var dx = tx - this.x, dy = ty - this.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  // 射线方向单位向量
  var nx = dx / dist, ny = dy / dist;

  // 命中宽度
  var hitWidth = 20;

  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    if (!e.alive || e.dying) continue;

    // 计算敌人到射线的垂直距离
    var ex = e.pos.x - this.x, ey = e.pos.y - this.y;
    // 投影长度
    var proj = ex * nx + ey * ny;
    if (proj < 0) continue; // 在塔背后

    // 垂直距离
    var perpX = ex - proj * nx, perpY = ey - proj * ny;
    var perpDist = Math.sqrt(perpX * perpX + perpY * perpY);

    if (perpDist <= hitWidth + e.cfg.radius) {
      e.takeDamage(this.damage);
    }
  }

  beams.push(new Beam(this.x, this.y, tx, ty, this.color, 'path'));
};

/** 群体伤害：以目标为中心的范围爆炸 */
Tower.prototype.attackAoe = function(enemy, enemies, beams) {
  var cx = enemy.pos.x, cy = enemy.pos.y;
  var aoeRadius = 60;

  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    if (!e.alive || e.dying) continue;

    var d = e.distTo(cx, cy);
    if (d <= aoeRadius) {
      e.takeDamage(this.damage);
      if (this.slow > 0) {
        e.applySlow(1 - this.slow, 2);
      }
    }
  }

  beams.push(new Beam(this.x, this.y, cx, cy, this.color, 'aoe'));
};

/** 寻找目标：全局范围，优先攻击路径最前面的敌人 */
Tower.prototype.findTarget = function(enemies) {
  var best = null;
  var bestProgress = -1; // pathIndex 越大 = 越靠近终点

  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    if (!e.alive || e.dying) continue;

    if (e.pathIndex > bestProgress) {
      bestProgress = e.pathIndex;
      best = e;
    }
  }
  return best;
};

Tower.prototype.draw = function(ctx) {
  // 选中时显示指示线
  if (this.selected && this.target && this.target.alive) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.target.pos.x, this.target.pos.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 绘制塔身
  renderer.drawTowerShape(ctx, this.x, this.y, this.cfg);

  // 冷却指示
  if (this.cooldown > 0) {
    var ratio = this.cooldown / this.fireRate;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - ratio));
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

module.exports = Tower;
