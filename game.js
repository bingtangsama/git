// ============================================================
// game.js  —— 微信小游戏入口
// ============================================================

var Game = require('./js/main');

// 获取主屏画布（微信小游戏：第一次 createCanvas 返回主屏画布）
var canvas = wx.createCanvas();
var ctx = canvas.getContext('2d');

// 创建游戏实例并启动
var game = new Game(ctx);
game.start();
