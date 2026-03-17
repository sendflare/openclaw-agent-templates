#!/bin/bash
# Sendflare Agent 安装脚本

set -e

WORKSPACE_DIR="$HOME/.openclaw/workspace/agents"
TEMPLATE_NAME="${2:-sendflare}"
AGENT_NAME="$1"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

if [ -z "$AGENT_NAME" ]; then
    echo "用法：$0 <agent-name> [template-name]"
    echo "示例：$0 my-email-agent sendflare"
    exit 1
fi

if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw 未安装"
    echo "   npm install -g openclaw"
    exit 1
fi

info "创建工作区：$WORKSPACE_DIR/$AGENT_NAME"
mkdir -p "$WORKSPACE_DIR"

if [ -d "$WORKSPACE_DIR/$AGENT_NAME" ]; then
    echo "⚠️  Agent '$AGENT_NAME' 已存在"
    read -p "是否覆盖？(y/N): " confirm
    if [ "$confirm" != "y" ]; then
        info "已取消"
        exit 0
    fi
    rm -rf "$WORKSPACE_DIR/$AGENT_NAME"
fi

info "复制模板 '$TEMPLATE_NAME'..."
cp -r "templates/$TEMPLATE_NAME" "$WORKSPACE_DIR/$AGENT_NAME"

if [ -d "templates/$TEMPLATE_NAME/skills" ]; then
    info "部署内置 skills..."
    mkdir -p "$HOME/.agents/skills"
    
    for skill_dir in "templates/$TEMPLATE_NAME/skills"/*; do
        if [ -d "$skill_dir" ]; then
            skill_name=$(basename "$skill_dir")
            info "  安装 skill: $skill_name"
            cp -r "$skill_dir" "$HOME/.agents/skills/"
        fi
    done
    
    success "内置 skills 已部署到 ~/.agents/skills/"
fi

TODAY=$(date +%Y-%m-%d)
mkdir -p "$WORKSPACE_DIR/$AGENT_NAME/memory"
cat > "$WORKSPACE_DIR/$AGENT_NAME/memory/$TODAY.md" << EOF
# $TODAY

## Agent Installed

- **Date:** $(date +%Y-%m-%d)
- **Template:** $TEMPLATE_NAME
- **Skills:** sendflare-skill (built-in)

## Next Steps

- [ ] Configure Sendflare API token in TOOLS.md
- [ ] Test email sending

---

_Raw notes from today._
EOF

success "Sendflare Agent '$AGENT_NAME' 创建完成！"
echo ""
echo "工作区位置：$WORKSPACE_DIR/$AGENT_NAME"
echo ""
echo "下一步："
echo "  1. 编辑 TOOLS.md 配置 Sendflare API Token"
echo "  2. 启动 OpenClaw: openclaw gateway start"
echo "  3. 测试发送：发送邮件给 test@example.com，主题：测试，内容：你好"
echo ""
