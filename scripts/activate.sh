#!/bin/bash
# OpenClaw Agent 激活脚本
# 用法：./activate.sh [agent-name]

set -e

WORKSPACE_DIR="$HOME/.openclaw/workspace/agents"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

echo ""
echo "=========================================="
echo "  OpenClaw Agent 激活工具"
echo "=========================================="
echo ""

# 列出可用的 Agents
info "可用的 Agents:"
echo ""

if [ ! -d "$WORKSPACE_DIR" ]; then
    echo "❌ 工作区不存在：$WORKSPACE_DIR"
    echo ""
    echo "请先创建 Agent："
    echo "  ./scripts/install.sh my-assistant default"
    exit 1
fi

# 获取 Agent 列表
agents=()
while IFS= read -r dir; do
    if [ -d "$WORKSPACE_DIR/$dir" ] && [[ "$dir" != "current" ]]; then
        agents+=("$dir")
    fi
done < <(ls -1 "$WORKSPACE_DIR")

if [ ${#agents[@]} -eq 0 ]; then
    echo "  (空)"
    echo ""
    echo "请先创建 Agent："
    echo "  ./scripts/install.sh my-assistant default"
    exit 1
fi

# 显示 Agent 列表
for i in "${!agents[@]}"; do
    agent="${agents[$i]}"
    if [ -f "$WORKSPACE_DIR/$agent/IDENTITY.md" ]; then
        emoji=$(grep -m1 "Emoji:" "$WORKSPACE_DIR/$agent/IDENTITY.md" | cut -d':' -f2 | xargs || echo "🤖")
    else
        emoji="🤖"
    fi
    echo "  $((i+1)). $emoji $agent"
done

echo ""

# 如果提供了参数，直接激活
if [ -n "$1" ]; then
    AGENT_NAME="$1"
    if [ ! -d "$WORKSPACE_DIR/$AGENT_NAME" ]; then
        echo "❌ Agent '$AGENT_NAME' 不存在"
        exit 1
    fi
else
    # 交互式选择
    read -p "输入要激活的 Agent 名称或编号： " input
    
    # 检查是否是编号
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        index=$((input - 1))
        if [ $index -ge 0 ] && [ $index -lt ${#agents[@]} ]; then
            AGENT_NAME="${agents[$index]}"
        else
            echo "❌ 无效的选择"
            exit 1
        fi
    else
        AGENT_NAME="$input"
        if [ ! -d "$WORKSPACE_DIR/$AGENT_NAME" ]; then
            echo "❌ Agent '$AGENT_NAME' 不存在"
            exit 1
        fi
    fi
fi

# 创建或更新 current 符号链接
ln -sfn "$WORKSPACE_DIR/$AGENT_NAME" "$WORKSPACE_DIR/current"

success "已激活 Agent: $AGENT_NAME"
echo ""
echo "   路径：$WORKSPACE_DIR/$AGENT_NAME"
echo "   链接：$WORKSPACE_DIR/current"
echo ""
info "重启 OpenClaw 以应用更改："
echo "  openclaw gateway restart"
echo ""
