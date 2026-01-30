# 投资大亨 - 联网Web版

多人在线投资模拟游戏，支持联网访问。

## 本地运行

```bash
# 1. 进入目录
cd investment-game-server

# 2. 安装依赖
npm install

# 3. 启动服务器
npm start

# 4. 浏览器访问
open http://localhost:3000
```

## 部署到服务器

### 方式一：部署到云服务器（阿里云/腾讯云等）

```bash
# 1. 上传代码到服务器
scp -r investment-game-server user@your-server:/path/to/

# 2. SSH 登录服务器
ssh user@your-server

# 3. 安装 Node.js（如未安装）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. 进入目录并安装依赖
cd /path/to/investment-game-server
npm install

# 5. 使用 PM2 后台运行（推荐）
npm install -g pm2
pm2 start server.js --name investment-game
pm2 save
pm2 startup

# 6. 配置 Nginx 反向代理（可选）
```

### 方式二：部署到 Railway（免费）

1. 注册 [Railway](https://railway.app)
2. 连接 GitHub 仓库
3. 新建项目 → Deploy from GitHub
4. 自动部署完成，获得访问链接

### 方式三：部署到 Render（免费）

1. 注册 [Render](https://render.com)
2. New → Web Service
3. 连接 GitHub 仓库
4. 设置：
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 部署完成获得链接

### 方式四：部署到 Vercel

需要将 Express 改为 Serverless 函数，或使用 `@vercel/node`。

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 登录/注册 |
| `/api/game` | GET | 获取游戏数据 |
| `/api/invest` | POST | 投资项目 |
| `/api/cancel` | POST | 取消投资 |
| `/api/reset` | POST | 重置游戏 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3000 | 服务器端口 |

## 数据存储

数据保存在 `data.json` 文件中，包含：
- 用户信息（用户名、头像、资金）
- 项目数据（项目信息、投资记录）

生产环境建议使用数据库（MongoDB/PostgreSQL）替代 JSON 文件。

## 功能特点

- 多人在线实时投资
- 数据持久化存储
- 每5秒自动刷新数据
- 响应式设计，支持移动端
