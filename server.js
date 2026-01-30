const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json');

// 默认项目数据
const defaultProjects = [
  { id: 1, name: "量子计算芯片", type: "innovation", price: 150, icon: "🔬", desc: "下一代量子计算核心技术，突破传统计算极限", investors: [] },
  { id: 2, name: "智能物流网络", type: "basic", price: 80, icon: "🚚", desc: "全自动化物流配送系统，覆盖全国主要城市", investors: [] },
  { id: 3, name: "元宇宙社交平台", type: "innovation", price: 200, icon: "🌐", desc: "沉浸式虚拟社交空间，打造数字化生活新体验", investors: [] },
  { id: 4, name: "绿色能源电站", type: "basic", price: 120, icon: "⚡", desc: "太阳能与风能混合发电，清洁能源基础设施", investors: [] },
  { id: 5, name: "AI医疗诊断", type: "innovation", price: 180, icon: "🏥", desc: "人工智能辅助医疗诊断，精准医疗革命先锋", investors: [] }
];

const defaultCoins = { innovationCoin: 500, basicCoin: 400 };

// 初始化数据
function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: {},
      projects: JSON.parse(JSON.stringify(defaultProjects))
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 读取数据
function readData() {
  initData();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// 写入数据
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API: 登录/注册
app.post('/api/login', (req, res) => {
  const { username, avatarEmoji, avatarBg } = req.body;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: '用户名不能为空' });
  }

  const data = readData();
  let user = data.users[username];
  let isNew = false;

  if (!user) {
    // 新用户
    user = {
      username,
      nickName: username,
      avatarEmoji,
      avatarBg,
      innovationCoin: defaultCoins.innovationCoin,
      basicCoin: defaultCoins.basicCoin,
      createdAt: new Date().toISOString()
    };
    data.users[username] = user;
    writeData(data);
    isNew = true;
  }

  res.json({ user, isNew });
});

// API: 获取游戏数据
app.get('/api/game', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: '需要用户名' });
  }

  const data = readData();
  const user = data.users[username];

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  // 获取其他投资人
  const otherUsers = Object.values(data.users)
    .filter(u => u.username !== username)
    .map(u => ({
      username: u.username,
      nickName: u.nickName,
      avatarEmoji: u.avatarEmoji,
      avatarBg: u.avatarBg
    }));

  res.json({
    user,
    projects: data.projects,
    otherUsers
  });
});

// API: 投资
app.post('/api/invest', (req, res) => {
  const { username, projectId } = req.body;

  const data = readData();
  const user = data.users[username];
  const project = data.projects.find(p => p.id === projectId);

  if (!user || !project) {
    return res.status(400).json({ error: '无效请求' });
  }

  // 检查是否已投资
  if (project.investors.some(i => i.username === username)) {
    return res.status(400).json({ error: '已经投资过该项目' });
  }

  // 检查余额
  const coinType = project.type === 'innovation' ? 'innovationCoin' : 'basicCoin';
  if (user[coinType] < project.price) {
    return res.status(400).json({ error: '余额不足' });
  }

  // 扣款
  user[coinType] -= project.price;

  // 添加投资记录
  project.investors.push({
    username: user.username,
    nickName: user.nickName,
    avatarEmoji: user.avatarEmoji,
    avatarBg: user.avatarBg
  });

  writeData(data);

  res.json({ success: true, user, project });
});

// API: 取消投资
app.post('/api/cancel', (req, res) => {
  const { username, projectId } = req.body;

  const data = readData();
  const user = data.users[username];
  const project = data.projects.find(p => p.id === projectId);

  if (!user || !project) {
    return res.status(400).json({ error: '无效请求' });
  }

  // 查找投资记录
  const investorIndex = project.investors.findIndex(i => i.username === username);
  if (investorIndex === -1) {
    return res.status(400).json({ error: '未找到投资记录' });
  }

  // 退款
  const coinType = project.type === 'innovation' ? 'innovationCoin' : 'basicCoin';
  user[coinType] += project.price;

  // 移除投资记录
  project.investors.splice(investorIndex, 1);

  writeData(data);

  res.json({ success: true, user, project });
});

// API: 重置游戏（管理员用）
app.post('/api/reset', (req, res) => {
  const data = {
    users: {},
    projects: JSON.parse(JSON.stringify(defaultProjects))
  };
  writeData(data);
  res.json({ success: true, message: '游戏已重置' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   💰 投资大亨服务器已启动！           ║
  ║                                       ║
  ║   本地访问: http://localhost:${PORT}      ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `);
  initData();
});
