// ============================================================
// map.js  —— 地图网格系统
// ============================================================

var config = require('./config');
var renderer = require('./renderer');

var Map = {
  // 用 MAP_DATA 的深拷贝记录建造状态（放置塔后标记为 2=已建造）
  grid: null,

  init: function() {
    this.grid = [];
    for (var r = 0; r < config.ROWS; r++) {
      this.grid[r] = [];
      for (var c = 0; c < config.COLS; c++) {
        this.grid[r][c] = config.MAP_DATA[r][c]; // 0 或 1
      }
    }
  },

  /** 判断某个格子是否可以建造塔 */
  isBuildable: function(row, col) {
    if (row < 0 || row >= config.ROWS || col < 0 || col >= config.COLS) return false;
    return this.grid[row][col] === 0;
  },

  /** 在格子上标记已建造 */
  markBuilt: function(row, col) {
    this.grid[row][col] = 2;
  },

  /** 绘制地图底色、路径、网格 */
  draw: function(ctx) {
    var ox = config.MAP_X, oy = config.MAP_Y;
    var cell = config.CELL;

    for (var r = 0; r < config.ROWS; r++) {
      for (var c = 0; c < config.COLS; c++) {
        var x = ox + c * cell;
        var y = oy + r * cell;
        var val = this.grid[r][c];

        if (val === 1) {
          // 路径 —— 土黄色
          ctx.fillStyle = '#D2B48C';
          ctx.fillRect(x, y, cell, cell);
          // 路径边线
          ctx.strokeStyle = '#C8A87C';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
        } else if (val === 2) {
          // 已建造 —— 深底色（塔会绘制在上面）
          ctx.fillStyle = '#1a3a1a';
          ctx.fillRect(x, y, cell, cell);
        } else {
          // 空地 —— 深绿色草地
          ctx.fillStyle = '#2d5a2d';
          ctx.fillRect(x, y, cell, cell);
          ctx.strokeStyle = '#245024';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
        }
      }
    }

    // 入口标记
    var entry = config.PATH[0];
    var ep = renderer.cellToWorld(entry.r, entry.c);
    ctx.fillStyle = '#2ECC71';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('入口', ep.x, ep.y);

    // 出口标记
    var exit = config.PATH[config.PATH.length - 1];
    var ex = renderer.cellToWorld(exit.r, exit.c);
    ctx.fillStyle = '#E74C3C';
    ctx.fillText('出口', ex.x, ex.y);
  },

  /** 高亮可建造格子（放置模式时） */
  highlightBuildable: function(ctx) {
    for (var r = 0; r < config.ROWS; r++) {
      for (var c = 0; c < config.COLS; c++) {
        if (this.grid[r][c] === 0) {
          var x = config.MAP_X + c * config.CELL;
          var y = config.MAP_Y + r * config.CELL;
          ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
          ctx.fillRect(x + 1, y + 1, config.CELL - 2, config.CELL - 2);
        }
      }
    }
  }
};

module.exports = Map;
