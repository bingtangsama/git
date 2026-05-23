# 肉鸽塔防小游戏 (Roguelike Tower Defense)

一款微信小游戏平台的肉鸽+塔防混合游戏。

## 玩法

- 消灭沿路径移动的敌人，保卫你的基地
- **每波结束后从3个随机塔中选择1个放置**（肉鸽机制）
- 合理搭配4种不同的防御塔，挑战10波敌人
- 生命值归零则游戏结束，无存档，每局独立

## 塔类型

| 塔 | 费用 | 特点 |
|----|------|------|
| 狙击塔 | 100金 | 单体高伤害，远射程 |
| 机枪塔 | 80金 | 快速射击，近射程 |
| 冰冻塔 | 120金 | 减速敌人50% |
| 炮塔 | 150金 | AOE范围伤害 |

## 敌人类型

- **普通兵**：基础敌人，均衡属性
- **快速兵**：移动速度快，血量低
- **重装兵**：血量高，到达终点扣2点生命

## 技术栈

- 微信小游戏原生 Canvas API
- 纯 JavaScript，无第三方依赖
- 几何图形风格，无需图片资源

## 使用方法

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本项目目录
3. 在模拟器中预览运行
4. 替换 `project.config.json` 中的 `appid` 为你的小游戏 AppID

## 项目结构

```
├── game.js              # 入口文件
├── game.json            # 游戏配置
├── project.config.json  # 开发者工具配置
└── js/
    ├── main.js          # 主控制器（状态机、游戏循环）
    ├── config.js        # 游戏配置数据
    ├── renderer.js      # Canvas 渲染引擎
    ├── map.js           # 地图系统
    ├── enemy.js         # 敌人系统
    ├── tower.js         # 塔系统
    ├── projectile.js    # 子弹系统
    ├── wave.js          # 波次管理
    ├── shop.js          # 肉鸽抽塔
    └── ui.js            # 界面渲染
```
