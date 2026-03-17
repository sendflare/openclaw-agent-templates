# Sendflare Agent Templates 🦄

Sendflare 邮件发送 Agent 模板，内置 sendflare-skill，开箱即用。

## 🚀 快速开始

### 方式 1: 使用安装脚本

```bash
# 安装 Sendflare Agent
./scripts/install.sh my-email-agent sendflare

# 启动 OpenClaw
openclaw gateway start
```

### 方式 2: 手动安装

```bash
# 复制模板
cp -r templates/sendflare ~/.openclaw/workspace/agents/my-email-agent

# 启动 OpenClaw
openclaw gateway start
```

## 📦 包含内容

| 文件 | 说明 |
|------|------|
| `SOUL.md` | Agent 行为准则 |
| `IDENTITY.md` | Agent 身份定义 |
| `USER.md` | 用户配置模板 |
| `TOOLS.md` | 工具配置 |
| `AGENTS.md` | 工作区规则 |
| `MEMORY.md` | 长期记忆 |
| `HEARTBEAT.md` | 定期检查 |
| `BOOTSTRAP.md` | 首次启动引导 |
| `skills/sendflare-skill/` | 内置邮件发送技能 |

## 🔧 配置

### 1. 配置 Sendflare API Token

编辑 `~/.openclaw/workspace/agents/my-email-agent/TOOLS.md`:

```bash
SEND_FLARE_API_TOKEN="your-api-token-here"
SEND_FLARE_APP_ID="your-app-id-here"
```

### 2. 测试发送

```
发送邮件给 test@example.com，主题：测试，内容：你好
```

## 📧 使用示例

### 发送邮件

```
发送邮件给 john@example.com，主题：会议通知，内容：明天下午 3 点开会
```

### 管理联系人

```
保存联系人 jane@example.com，姓名：Jane Doe
获取联系人列表
```

## 🎯 功能特点

- ✅ 内置 sendflare-skill，无需单独安装
- ✅ 完整的 Agent 配置文件
- ✅ 支持邮件发送和联系人管理
- ✅ 自动记录发送历史
- ✅ 支持模板和批量发送

## 📁 目录结构

```
sendflare-agent-template/
├── README.md
├── templates/
│   └── sendflare/
│       ├── SOUL.md
│       ├── IDENTITY.md
│       ├── USER.md
│       ├── TOOLS.md
│       ├── AGENTS.md
│       ├── MEMORY.md
│       ├── HEARTBEAT.md
│       ├── BOOTSTRAP.md
│       └── skills/
│           └── sendflare-skill/
└── scripts/
    └── install.sh
```  

## 链接  
[Sendflare](https://sendflare.com)  
[sendflare-skill](https://clawhub.ai/keepchen/sendflare-skill)  
[Docs](https://docs.sendflare.com/docs/)  

## 📄 License

MIT
