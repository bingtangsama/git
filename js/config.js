// ============================================================
// config.js  —— 所有游戏配置数据集中管理
// ============================================================

// --- 屏幕 & 网格 ---
var SCREEN_W = 375;
var SCREEN_H = 667;
var COLS = 8;
var ROWS = 12;
var CELL = 45;
var MAP_W = COLS * CELL;
var MAP_H = ROWS * CELL;
var MAP_X = (SCREEN_W - MAP_W) / 2;
var MAP_Y = 60;

// --- 游戏状态枚举 ---
var STATE = {
  START: 0,
  PLAYING: 1,
  SHOP: 2,
  PLACING: 3,
  GAME_OVER: 4,
  WIN: 5
};

// --- 地图布局 (0=空地, 1=路径) ---
var MAP_DATA = [
  [0,1,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,0],
  [0,1,1,1,1,1,0,0],
  [0,0,0,0,0,1,0,0],
  [0,0,1,1,1,1,0,0],
  [0,0,1,0,0,0,0,0],
  [0,0,1,1,1,1,1,0],
  [0,0,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0],
  [0,1,1,1,1,1,0,0],
  [0,0,0,0,0,1,0,0]
];

// 路径坐标序列
var PATH = [
  {r:0,c:1},{r:1,c:1},{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:5},
  {r:3,c:5},{r:4,c:5},{r:4,c:4},{r:4,c:3},{r:4,c:2},{r:5,c:2},{r:6,c:2},
  {r:6,c:3},{r:6,c:4},{r:6,c:5},{r:6,c:6},{r:7,c:6},{r:8,c:6},{r:8,c:5},
  {r:8,c:4},{r:8,c:3},{r:8,c:2},{r:8,c:1},{r:9,c:1},{r:10,c:1},{r:10,c:2},
  {r:10,c:3},{r:10,c:4},{r:10,c:5},{r:11,c:5}
];

// --- 敌人类型 ---
var ENEMY_TYPES = {
  normal: { name:'普通兵', color:'#888888', radius:10, hp:100, speed:60,  reward:10, lifeCost:1 },
  fast:   { name:'快速兵', color:'#FFD700', radius:8,  hp:60,  speed:110, reward:15, lifeCost:1 },
  tank:   { name:'重装兵', color:'#8B4513', radius:14, hp:300, speed:35,  reward:30, lifeCost:2 }
};

// --- 塔类型 ---
// damageType: 'single'=单体  'path'=路径(穿透)  'aoe'=群体
// 射程全局，伤害从塔位置即时发出
var TOWER_TYPES = {
  sniper:  { name:'狙击塔', color:'#E74C3C', damage:50, fireRate:1500, cost:100, damageType:'single', shape:'sniper',  desc:'单体高伤' },
  machine: { name:'机枪塔', color:'#3498DB', damage:10, fireRate:250,  cost:80,  damageType:'single', shape:'machine', desc:'快速连射' },
  ice:     { name:'冰冻塔', color:'#00CED1', damage:5,  fireRate:800,  cost:120, damageType:'aoe',    shape:'ice',     desc:'群体减速', slow:0.5 },
  cannon:  { name:'炮塔',   color:'#E67E22', damage:30, fireRate:1800, cost:150, damageType:'path',  shape:'cannon',  desc:'路径穿透' }
};

// --- 波次配置 ---
var WAVES = [
  [{ type:'normal', count:5, interval:1000 }],
  [{ type:'normal', count:6, interval:900 }],
  [{ type:'normal', count:4, interval:800 }, { type:'fast', count:3, interval:600 }],
  [{ type:'fast',   count:6, interval:500 }],
  [{ type:'normal', count:5, interval:800 }, { type:'tank', count:1, interval:2000 }],
  [{ type:'fast',   count:5, interval:500 }, { type:'normal', count:5, interval:700 }],
  [{ type:'tank',   count:3, interval:1500 }],
  [{ type:'normal', count:8, interval:600 }, { type:'fast', count:5, interval:400 }],
  [{ type:'tank',   count:2, interval:1500 }, { type:'fast', count:8, interval:400 }],
  [{ type:'tank',   count:4, interval:1200 }, { type:'normal', count:10, interval:500 }]
];

// --- 初始资源 ---
var INIT_GOLD = 200;
var INIT_LIFE = 10;
var WAVE_BONUS = 50;

module.exports = {
  SCREEN_W: SCREEN_W, SCREEN_H: SCREEN_H,
  COLS: COLS, ROWS: ROWS, CELL: CELL,
  MAP_W: MAP_W, MAP_H: MAP_H, MAP_X: MAP_X, MAP_Y: MAP_Y,
  STATE: STATE,
  MAP_DATA: MAP_DATA, PATH: PATH,
  ENEMY_TYPES: ENEMY_TYPES, TOWER_TYPES: TOWER_TYPES,
  WAVES: WAVES,
  INIT_GOLD: INIT_GOLD, INIT_LIFE: INIT_LIFE, WAVE_BONUS: WAVE_BONUS
};
