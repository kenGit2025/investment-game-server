const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// MongoDB 连接（优化连接池配置）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment-game';

mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err));

// 定义数据模型（添加索引优化查询）
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  nickName: String,
  avatarEmoji: String,
  avatarBg: String,
  coin: { type: Number, default: 900 },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: String,
  type: { type: String, index: true },
  price: Number, // 起投金额
  icon: String,
  desc: String,
  link: String,
  investors: [{
    username: { type: String, index: true },
    nickName: String,
    avatarEmoji: String,
    avatarBg: String,
    amount: { type: Number, default: 0 } // 实际投资金额
  }]
});

// 创建复合索引
projectSchema.index({ 'investors.username': 1 });

// 系统配置模型
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
});

const Settings = mongoose.model('Settings', settingsSchema);

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 默认项目数据
const defaultProjects = [
  { id: 1, name: "飞书项目 AI 版", type: "innovation", price: 120, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/CoyrwVqKqiQO4NkmkdXc7l0Yn9V", investors: [] },
  { id: 2, name: "飞书任务 AI 版", type: "innovation", price: 100, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/H8l9w7bw2i8dXgkPNOOcX1EInmQ", investors: [] },
  { id: 3, name: "Meego LTC 智能产品解决方案", type: "innovation", price: 150, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/SMCQwNkGtiqamrki8Q5cC2qhnwR", investors: [] },
  { id: 4, name: "开发者 AI 赋能", type: "innovation", price: 130, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/FfdmwcUY5iwqcpkL35qc1RNjnFg", investors: [] },
  { id: 5, name: "Meego AI 提效 2026", type: "innovation", price: 140, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/GHCXw2VIZiFSPykeLNuclI9Hnxd", investors: [] },
  { id: 6, name: "轻应用 2.0", type: "innovation", price: 110, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/P5COwtgcBisRwAkQe38cbvmOnVf", investors: [] },
  { id: 7, name: "AI friendly", type: "innovation", price: 90, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/QANDwdDWSiKrmKktyUsccC8wnRf", investors: [] },
  { id: 8, name: "AI赋能/Agent", type: "innovation", price: 160, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/VpsJwdOLWiyDgKk6AHqcSPyKnpb", investors: [] },
  { id: 9, name: "IPMS解决方案", type: "innovation", price: 120, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/ZHocwQT2ii6hoXkilGgcKfcvn9b", investors: [] },
  { id: 10, name: "经销商供应商管理", type: "innovation", price: 100, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/FybjwAQBciR7bjkYR0icSOEYndf", investors: [] },
  { id: 11, name: "Meego串联产业链上下游", type: "innovation", price: 130, icon: "💡", desc: "", link: "https://bytedance.larkoffice.com/wiki/Na3fwvZkGiqfZOkxBuJc5hjPnod", investors: [] },
  { id: 12, name: "移动端-私有化交付同构", type: "platform", price: 80, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/docx/HvCAdxLNxoFEmWxu3m9c6TounWc", investors: [] },
  { id: 13, name: "Meego 流量地图", type: "platform", price: 70, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/QZaFwm3fwiM5kgkajKtcoqr6nig", investors: [] },
  { id: 14, name: "空间配置 IDE 化", type: "platform", price: 90, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/EprSwtZZpiaLdqk3gWRc706mnye", investors: [] },
  { id: 15, name: "Meego 新用户引导与问答 Agent", type: "platform", price: 60, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/docx/ZupBd3PJTolJYNx30zCcmf8engg", investors: [] },
  { id: 16, name: "计算&自动化性能提升 10 倍", type: "platform", price: 100, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/WWo1wu7RdiRKoekO9NkcU807nze", investors: [] },
  { id: 17, name: "Meego 数据服务", type: "platform", price: 85, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/B1M3wQdceid7jgk9CTBcaP2pnoe", investors: [] },
  { id: 18, name: "更智能、更贴合业务的计划表", type: "platform", price: 75, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/ShqKwROxvigZTXkd1x9cCCUinjX", investors: [] },
  { id: 19, name: "业财融合", type: "platform", price: 95, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/BhKDwUSK2ircexkWRhJcrnybnx5", investors: [] },
  { id: 20, name: "流程智能化", type: "platform", price: 90, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/NgZNw0hfBi1lUZkU8SYcNyLGnWh", investors: [] },
  { id: 21, name: "插件助手", type: "platform", price: 65, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/ML58wcBBdiwzVzkWwXwcvoccn5f", investors: [] },
  { id: 22, name: "工作项模型改进", type: "platform", price: 80, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/S2ZfwIWzCiKGWHkAEKGc69cCnEf", investors: [] },
  { id: 23, name: "一站式能力与解决方案交易平台", type: "platform", price: 110, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/IfFcwyJYzitGslkTeLzcPLj1nSd", investors: [] },
  { id: 24, name: "跨境协作与企业级安全", type: "platform", price: 100, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/FgKOwaLfJiMfflk3yDoc3y8Hnjg", investors: [] },
  { id: 25, name: "Builder管业务", type: "platform", price: 85, icon: "🏗️", desc: "", link: "https://bytedance.larkoffice.com/wiki/XNAfwuHcNi91fKkEla6cDOnfnvd", investors: [] },
  { id: 26, name: "IPD全域协同", type: "unknown", price: 0, icon: "❓", desc: "", link: "https://bytedance.larkoffice.com/wiki/VOHAwoNp2iKMzzkIHKEcJ6x2nze", investors: [] },
  { id: 27, name: "工作台&导航3.0焕新", type: "unknown", price: 0, icon: "❓", desc: "", link: "https://bytedance.larkoffice.com/wiki/RakqwVOH9iA3hZkAE3zcfzEXnxf", investors: [] },
  { id: 28, name: "项目资产中心", type: "unknown", price: 0, icon: "❓", desc: "", link: "https://bytedance.larkoffice.com/wiki/AXs7w03qtiuSpMkKy9jcOTBZnkj", investors: [] },
  { id: 29, name: "人员与组织能力升级", type: "unknown", price: 0, icon: "❓", desc: "", link: "https://bytedance.larkoffice.com/wiki/Nkz6wOTXoiEmNekYhp0c4RwEnhf", investors: [] },
  { id: 30, name: "智能评论&知识沉淀", type: "unknown", price: 0, icon: "❓", desc: "", link: "https://bytedance.larkoffice.com/wiki/H5eCw1NTHiWN59kCmCecKMfvnDf", investors: [] }
];

const defaultCoin = 900;

// 获取初始货币配置
async function getInitialCoin() {
  try {
    const setting = await Settings.findOne({ key: 'initialCoin' }).lean();
    if (setting && setting.value) {
      return setting.value.coin ?? defaultCoin;
    }
  } catch (e) {
    console.error('获取配置失败:', e);
  }
  return defaultCoin;
}

// 初始化默认项目
async function initProjects() {
  const count = await Project.countDocuments();
  if (count === 0) {
    await Project.insertMany(defaultProjects);
    console.log('✅ 默认项目数据已初始化');
  }
}

// API: 登录/注册
app.post('/api/login', async (req, res) => {
  try {
    const { username, avatarEmoji, avatarBg } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: '用户名不能为空' });
    }

    if (username === 'meegoadmin') {
      return res.json({
        user: { username: 'meegoadmin', nickName: '管理员', isAdmin: true },
        isNew: false
      });
    }

    // 先查找用户
    let user = await User.findOne({ username }).lean();
    let isNew = false;

    if (!user) {
      // 获取配置的初始货币数量
      const initialCoin = await getInitialCoin();

      // 用户不存在，创建新用户
      const newUser = new User({
        username,
        nickName: username,
        avatarEmoji,
        avatarBg,
        coin: initialCoin
      });
      user = await newUser.save();
      user = user.toObject();
      isNew = true;
    }

    res.json({ user, isNew });
  } catch (e) {
    console.error('登录错误:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 获取游戏数据（优化：并行查询 + lean）
app.get('/api/game', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: '需要用户名' });
    }

    if (username === 'meegoadmin') {
      // 并行查询项目和用户
      const [projects, users] = await Promise.all([
        Project.find().sort({ id: 1 }).lean(),
        User.find().select('username nickName avatarEmoji avatarBg').lean()
      ]);

      return res.json({
        user: { username: 'meegoadmin', nickName: '管理员', isAdmin: true },
        projects,
        otherUsers: users
      });
    }

    // 并行查询当前用户、项目、其他用户
    const [user, projects, otherUsers] = await Promise.all([
      User.findOne({ username }).lean(),
      Project.find().sort({ id: 1 }).lean(),
      User.find({ username: { $ne: username } }).select('username nickName avatarEmoji avatarBg').lean()
    ]);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user, projects, otherUsers });
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 投资（优化：并行查询 + findOneAndUpdate）
app.post('/api/invest', async (req, res) => {
  try {
    const { username, projectId, amount } = req.body;

    // 并行查询用户和项目
    const [user, project] = await Promise.all([
      User.findOne({ username }).lean(),
      Project.findOne({ id: projectId }).lean()
    ]);

    if (!user || !project) {
      return res.status(400).json({ error: '无效请求' });
    }

    if (project.type === 'unknown') {
      return res.status(400).json({ error: '该项目暂不支持投资' });
    }

    if (project.investors.some(i => i.username === username)) {
      return res.status(400).json({ error: '已经投资过该项目' });
    }

    // 验证投资金额
    const investAmount = parseInt(amount) || project.price;
    if (investAmount < project.price) {
      return res.status(400).json({ error: `投资金额不能低于起投金额 ${project.price}` });
    }

    if (user.coin < investAmount) {
      return res.status(400).json({ error: '余额不足' });
    }

    // 并行更新用户和项目
    const [updatedUser, updatedProject] = await Promise.all([
      User.findOneAndUpdate(
        { username },
        { $inc: { coin: -investAmount } },
        { new: true, lean: true }
      ),
      Project.findOneAndUpdate(
        { id: projectId },
        { $push: { investors: { username: user.username, nickName: user.nickName, avatarEmoji: user.avatarEmoji, avatarBg: user.avatarBg, amount: investAmount } } },
        { new: true, lean: true }
      )
    ]);

    res.json({ success: true, user: updatedUser, project: updatedProject, investAmount });
    broadcastUpdate(); // 广播更新
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 取消投资（优化：并行查询 + findOneAndUpdate）
app.post('/api/cancel', async (req, res) => {
  try {
    const { username, projectId } = req.body;

    const project = await Project.findOne({ id: projectId }).lean();

    if (!project) {
      return res.status(400).json({ error: '无效请求' });
    }

    // 查找用户的投资记录，获取实际投资金额
    const investorRecord = project.investors.find(i => i.username === username);
    if (!investorRecord) {
      return res.status(400).json({ error: '未找到投资记录' });
    }

    // 退还实际投资的金额（兼容旧数据，如果没有 amount 字段则退还项目价格）
    const refundAmount = investorRecord.amount || project.price;

    // 并行更新用户和项目
    const [updatedUser, updatedProject] = await Promise.all([
      User.findOneAndUpdate(
        { username },
        { $inc: { coin: refundAmount } },
        { new: true, lean: true }
      ),
      Project.findOneAndUpdate(
        { id: projectId },
        { $pull: { investors: { username } } },
        { new: true, lean: true }
      )
    ]);

    if (!updatedUser) {
      return res.status(400).json({ error: '用户不存在' });
    }

    res.json({ success: true, user: updatedUser, project: updatedProject, refundAmount });
    broadcastUpdate(); // 广播更新
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 重置游戏（只清空用户和投资记录，保留项目配置）
app.post('/api/reset', async (req, res) => {
  try {
    // 清空所有用户
    await User.deleteMany({});
    // 清空所有项目的投资者列表，保留项目本身
    await Project.updateMany({}, { $set: { investors: [] } });
    res.json({ success: true, message: '游戏已重置' });
    broadcastUpdate(); // 广播更新
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 添加项目
app.post('/api/project', async (req, res) => {
  try {
    const { name, type, price, link } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: '项目名称和类型必填' });
    }

    const maxProject = await Project.findOne().sort({ id: -1 });
    const newId = maxProject ? maxProject.id + 1 : 1;

    const newProject = new Project({
      id: newId,
      name,
      type,
      price: parseInt(price) || 0,
      icon: type === 'innovation' ? '💡' : type === 'platform' ? '🏗️' : '❓',
      desc: '',
      link: link || '',
      investors: []
    });

    await newProject.save();
    res.json({ success: true, project: newProject });
    broadcastUpdate(); // 广播更新
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 修改项目
app.put('/api/project/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { name, type, price, link } = req.body;

    const project = await Project.findOne({ id: projectId });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    if (name) project.name = name;
    if (type) {
      project.type = type;
      project.icon = type === 'innovation' ? '💡' : type === 'platform' ? '🏗️' : '❓';
    }
    if (price !== undefined) project.price = parseInt(price) || 0;
    if (link !== undefined) project.link = link;

    await project.save();
    res.json({ success: true, project });
    broadcastUpdate(); // 广播更新
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 批量设置所有项目价格（管理员）
app.post('/api/admin/reset-prices', async (req, res) => {
  try {
    const { price } = req.body;
    const newPrice = parseInt(price) || 0;
    await Project.updateMany({}, { $set: { price: newPrice } });
    res.json({ success: true, message: '所有项目价格已更新' });
    broadcastUpdate();
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 获取所有用户投资情况（优化：并行查询 + lean）
app.get('/api/admin/users', async (req, res) => {
  try {
    // 并行查询用户和项目
    const [users, projects] = await Promise.all([
      User.find().lean(),
      Project.find().select('id name type price investors').lean()
    ]);

    // 预构建用户投资映射，避免重复遍历
    const userInvestments = new Map();
    projects.forEach(project => {
      project.investors.forEach(investor => {
        if (!userInvestments.has(investor.username)) {
          userInvestments.set(investor.username, []);
        }
        // 使用实际投资金额，兼容旧数据
        const investedAmount = investor.amount || project.price;
        userInvestments.get(investor.username).push({
          id: project.id,
          name: project.name,
          type: project.type,
          price: project.price, // 起投金额
          amount: investedAmount // 实际投资金额
        });
      });
    });

    const usersWithInvestments = users.map(user => {
      const investments = userInvestments.get(user.username) || [];
      const totalSpent = investments.reduce((sum, inv) => sum + inv.amount, 0);

      return {
        username: user.username,
        nickName: user.nickName,
        avatarEmoji: user.avatarEmoji,
        avatarBg: user.avatarBg,
        coin: user.coin,
        investments,
        totalSpent
      };
    });

    res.json({ users: usersWithInvestments });
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 获取系统配置
app.get('/api/settings', async (req, res) => {
  try {
    const initialCoin = await getInitialCoin();
    res.json({ initialCoin });
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 更新系统配置（管理员）
app.put('/api/settings', async (req, res) => {
  try {
    const { initialCoin } = req.body;

    if (initialCoin !== undefined) {
      await Settings.findOneAndUpdate(
        { key: 'initialCoin' },
        { value: { coin: parseInt(initialCoin) || 900 }},
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: '配置已更新' });
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('📱 用户连接:', socket.id);

  socket.on('disconnect', () => {
    console.log('👋 用户断开:', socket.id);
  });
});

// 广播数据更新
async function broadcastUpdate() {
  try {
    const projects = await Project.find().sort({ id: 1 }).lean();
    const users = await User.find().select('username nickName avatarEmoji avatarBg').lean();
    io.emit('dataUpdate', { projects, users });
  } catch (e) {
    console.error('广播失败:', e);
  }
}

// 启动服务器
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   🎯 如果我是洪师傅 服务器已启动！    ║
  ║                                       ║
  ║   本地访问: http://localhost:${PORT}      ║
  ║   WebSocket: 已启用 ✅                ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `);
  initProjects();
});
