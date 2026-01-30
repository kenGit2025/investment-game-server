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
  // 创新业务
  { id: 1, name: "飞书项目 AI 版", type: "innovation", price: 120, icon: "🤖", desc: "AI 驱动的项目管理新体验", link: "https://bytedance.larkoffice.com/wiki/CoyrwVqKqiQO4NkmkdXc7l0Yn9V", investors: [] },
  { id: 2, name: "飞书任务 AI 版", type: "innovation", price: 100, icon: "✅", desc: "智能任务管理与自动化", link: "https://bytedance.larkoffice.com/wiki/H8l9w7bw2i8dXgkPNOOcX1EInmQ", investors: [] },
  { id: 3, name: "Meego LTC 智能产品解决方案", type: "innovation", price: 150, icon: "💼", desc: "打通 B2B 企业从线索到回款的端到端价值链", link: "https://bytedance.larkoffice.com/wiki/SMCQwNkGtiqamrki8Q5cC2qhnwR", investors: [] },
  { id: 4, name: "开发者 AI 赋能", type: "innovation", price: 130, icon: "👨‍💻", desc: "为开发者提供 AI 能力支持", link: "https://bytedance.larkoffice.com/wiki/FfdmwcUY5iwqcpkL35qc1RNjnFg", investors: [] },
  { id: 5, name: "Meego AI 提效 2026", type: "innovation", price: 140, icon: "⚡", desc: "AI 驱动效率提升计划", link: "https://bytedance.larkoffice.com/wiki/GHCXw2VIZiFSPykeLNuclI9Hnxd", investors: [] },
  { id: 6, name: "轻应用 2.0", type: "innovation", price: 110, icon: "📱", desc: "新一代轻量级应用平台", link: "https://bytedance.larkoffice.com/wiki/P5COwtgcBisRwAkQe38cbvmOnVf", investors: [] },
  { id: 7, name: "AI friendly", type: "innovation", price: 90, icon: "🤝", desc: "AI 友好型产品设计", link: "https://bytedance.larkoffice.com/wiki/QANDwdDWSiKrmKktyUsccC8wnRf", investors: [] },
  { id: 8, name: "AI赋能/Agent", type: "innovation", price: 160, icon: "🧠", desc: "智能 Agent 能力建设", link: "https://bytedance.larkoffice.com/wiki/VpsJwdOLWiyDgKk6AHqcSPyKnpb", investors: [] },
  { id: 9, name: "IPMS解决方案", type: "innovation", price: 120, icon: "📊", desc: "集成项目管理解决方案", link: "https://bytedance.larkoffice.com/wiki/ZHocwQT2ii6hoXkilGgcKfcvn9b", investors: [] },
  { id: 10, name: "经销商供应商管理", type: "innovation", price: 100, icon: "🏪", desc: "供应链管理数字化", link: "https://bytedance.larkoffice.com/wiki/FybjwAQBciR7bjkYR0icSOEYndf", investors: [] },
  { id: 11, name: "Meego串联产业链上下游", type: "innovation", price: 130, icon: "🔗", desc: "产业链协同平台", link: "https://bytedance.larkoffice.com/wiki/Na3fwvZkGiqfZOkxBuJc5hjPnod", investors: [] },
  // 平台能力升级
  { id: 12, name: "移动端-私有化交付同构", type: "platform", price: 80, icon: "📲", desc: "移动端私有化部署能力", link: "https://bytedance.larkoffice.com/docx/HvCAdxLNxoFEmWxu3m9c6TounWc", investors: [] },
  { id: 13, name: "Meego 流量地图", type: "platform", price: 70, icon: "🗺️", desc: "流量可视化分析平台", link: "https://bytedance.larkoffice.com/wiki/QZaFwm3fwiM5kgkajKtcoqr6nig", investors: [] },
  { id: 14, name: "空间配置 IDE 化", type: "platform", price: 90, icon: "⚙️", desc: "配置管理开发体验升级", link: "https://bytedance.larkoffice.com/wiki/EprSwtZZpiaLdqk3gWRc706mnye", investors: [] },
  { id: 15, name: "Meego 新用户引导与问答 Agent", type: "platform", price: 60, icon: "💡", desc: "智能用户引导系统", link: "https://bytedance.larkoffice.com/docx/ZupBd3PJTolJYNx30zCcmf8engg", investors: [] },
  { id: 16, name: "计算&自动化性能提升 10 倍", type: "platform", price: 100, icon: "🚀", desc: "核心计算能力大幅提升", link: "https://bytedance.larkoffice.com/wiki/WWo1wu7RdiRKoekO9NkcU807nze", investors: [] },
  { id: 17, name: "Meego 数据服务", type: "platform", price: 85, icon: "📈", desc: "数据服务能力建设", link: "https://bytedance.larkoffice.com/wiki/B1M3wQdceid7jgk9CTBcaP2pnoe", investors: [] },
  { id: 18, name: "更智能、更贴合业务的计划表", type: "platform", price: 75, icon: "📅", desc: "智能计划表升级", link: "https://bytedance.larkoffice.com/wiki/ShqKwROxvigZTXkd1x9cCCUinjX", investors: [] },
  { id: 19, name: "业财融合", type: "platform", price: 95, icon: "💰", desc: "建立项目财务中间件", link: "https://bytedance.larkoffice.com/wiki/BhKDwUSK2ircexkWRhJcrnybnx5", investors: [] },
  { id: 20, name: "流程智能化", type: "platform", price: 90, icon: "🔄", desc: "从流程数字化到业务生产一体化", link: "https://bytedance.larkoffice.com/wiki/NgZNw0hfBi1lUZkU8SYcNyLGnWh", investors: [] },
  { id: 21, name: "插件助手", type: "platform", price: 65, icon: "🔌", desc: "插件能力扩展平台", link: "https://bytedance.larkoffice.com/wiki/ML58wcBBdiwzVzkWwXwcvoccn5f", investors: [] },
  { id: 22, name: "工作项模型改进", type: "platform", price: 80, icon: "🛠️", desc: "工作项数据模型优化", link: "https://bytedance.larkoffice.com/wiki/S2ZfwIWzCiKGWHkAEKGc69cCnEf", investors: [] },
  { id: 23, name: "一站式能力与解决方案交易平台", type: "platform", price: 110, icon: "🏬", desc: "灵活可拓展的商业模型架构", link: "https://bytedance.larkoffice.com/wiki/IfFcwyJYzitGslkTeLzcPLj1nSd", investors: [] },
  { id: 24, name: "跨境协作与企业级安全", type: "platform", price: 100, icon: "🔐", desc: "高阶安全解决方案", link: "https://bytedance.larkoffice.com/wiki/FgKOwaLfJiMfflk3yDoc3y8Hnjg", investors: [] },
  { id: 25, name: "Builder管业务", type: "platform", price: 85, icon: "🏗️", desc: "业务构建能力升级", link: "https://bytedance.larkoffice.com/wiki/XNAfwuHcNi91fKkEla6cDOnfnvd", investors: [] },
  // 未知项目
  { id: 26, name: "IPD全域协同", type: "unknown", price: 0, icon: "❓", desc: "敬请期待", link: "https://bytedance.larkoffice.com/wiki/VOHAwoNp2iKMzzkIHKEcJ6x2nze", investors: [] },
  { id: 27, name: "工作台&导航3.0焕新", type: "unknown", price: 0, icon: "❓", desc: "敬请期待", link: "https://bytedance.larkoffice.com/wiki/RakqwVOH9iA3hZkAE3zcfzEXnxf", investors: [] },
  { id: 28, name: "项目资产中心", type: "unknown", price: 0, icon: "❓", desc: "敬请期待", link: "https://bytedance.larkoffice.com/wiki/AXs7w03qtiuSpMkKy9jcOTBZnkj", investors: [] },
  { id: 29, name: "人员与组织能力升级", type: "unknown", price: 0, icon: "❓", desc: "敬请期待", link: "https://bytedance.larkoffice.com/wiki/Nkz6wOTXoiEmNekYhp0c4RwEnhf", investors: [] },
  { id: 30, name: "智能评论&知识沉淀", type: "unknown", price: 0, icon: "❓", desc: "敬请期待", link: "https://bytedance.larkoffice.com/wiki/H5eCw1NTHiWN59kCmCecKMfvnDf", investors: [] }
];

const defaultCoins = { innovationCoin: 500, platformCoin: 400 };

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

  // 管理员登录，不创建用户
  if (username === 'meegoadmin') {
    return res.json({
      user: { username: 'meegoadmin', nickName: '管理员', isAdmin: true },
      isNew: false
    });
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
      platformCoin: defaultCoins.platformCoin,
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

  // 管理员可以直接获取数据，不需要先注册
  if (username === 'meegoadmin') {
    const otherUsers = Object.values(data.users)
      .map(u => ({
        username: u.username,
        nickName: u.nickName,
        avatarEmoji: u.avatarEmoji,
        avatarBg: u.avatarBg
      }));

    return res.json({
      user: { username: 'meegoadmin', nickName: '管理员', isAdmin: true },
      projects: data.projects,
      otherUsers
    });
  }

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

  // 禁止投资未知项目
  if (project.type === 'unknown') {
    return res.status(400).json({ error: '该项目暂不支持投资' });
  }

  // 检查是否已投资
  if (project.investors.some(i => i.username === username)) {
    return res.status(400).json({ error: '已经投资过该项目' });
  }

  // 检查余额
  const coinType = project.type === 'innovation' ? 'innovationCoin' : 'platformCoin';
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
  const coinType = project.type === 'innovation' ? 'innovationCoin' : 'platformCoin';
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
