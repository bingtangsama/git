// ============================================================
// wave.js  —— 波次管理器
// ============================================================

var config = require('./config');
var Enemy = require('./enemy');

function WaveManager() {
  this.currentWave = 0;
  this.spawning = false;
  this.spawnQueue = [];
  this.spawnTimer = 0;
  this.waveActive = false;
  this.enemies = [];
}

/** 开始第 waveIndex 波（0-based） */
WaveManager.prototype.startWave = function(waveIndex) {
  this.currentWave = waveIndex;
  this.waveActive = true;
  this.spawning = true;
  this.spawnQueue = [];

  var waveConfig = config.WAVES[waveIndex];
  // 血量倍率：每波增加 10%
  var hpMult = 1 + waveIndex * 0.1;

  // 将波次配置展开为逐个敌人的生成队列
  for (var g = 0; g < waveConfig.length; g++) {
    var group = waveConfig[g];
    for (var i = 0; i < group.count; i++) {
      this.spawnQueue.push({
        type: group.type,
        interval: group.interval,
        hpMult: hpMult
      });
    }
  }

  this.spawnTimer = 0; // 立即生成第一个
};

WaveManager.prototype.update = function(dt, gameEnemies) {
  // 生成阶段
  if (this.spawning && this.spawnQueue.length > 0) {
    this.spawnTimer -= dt * 1000;
    if (this.spawnTimer <= 0) {
      var info = this.spawnQueue.shift();
      var enemy = new Enemy(info.type, info.hpMult);
      gameEnemies.push(enemy);
      this.spawnTimer = info.interval;
    }
    if (this.spawnQueue.length === 0) {
      this.spawning = false;
    }
  }

  // 检测波次是否结束（所有敌人已消失）
  if (!this.spawning) {
    var anyAlive = false;
    for (var i = 0; i < gameEnemies.length; i++) {
      if (gameEnemies[i].alive || gameEnemies[i].dying) {
        anyAlive = true;
        break;
      }
    }
    if (!anyAlive) {
      this.waveActive = false;
    }
  }
};

WaveManager.prototype.isWaveComplete = function() {
  return !this.waveActive && !this.spawning;
};

WaveManager.prototype.isLastWave = function() {
  return this.currentWave >= config.WAVES.length - 1;
};

module.exports = WaveManager;
