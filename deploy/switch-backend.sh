#!/bin/bash
#
# mcp-api 反代后端定时切换脚本
#
# 作用：在 3 个内网节点间循环切换 nginx 上游，每次切换一个节点并平滑 reload。
#       替代原来的轮询（round-robin）方案。
#
# 安装位置：/opt/mcp-api/switch-backend.sh
# 定时任务：/etc/cron.d/mcp-switch-backend
#   0 */8 * * * root /opt/mcp-api/switch-backend.sh >> /var/log/mcp-switch-backend.log 2>&1
#   —— 即每天 00:00 / 08:00 / 16:00 各切换一次
#
# 设计要点：
#   1. 先写临时内容并落位，nginx -t 校验通过才 reload，失败则回滚旧文件；
#   2. reload 平滑，不中断现有连接；
#   3. 当前节点索引持久化在 /opt/mcp-api/switch-backend.state。
#
set -euo pipefail

# 候选后端节点（内网 IP，均监听 18080）
NODES=(172.22.16.14 172.22.16.22 172.22.16.28)
PORT=18080

UPSTREAM_CONF=/etc/nginx/conf.d/mcp-api-upstream.conf
STATE_FILE=/opt/mcp-api/switch-backend.state

log() { echo "[$(date '+%F %T')] $*"; }

mkdir -p "$(dirname "$STATE_FILE")"

# 读取上一次的索引，+1 取模（首次为 -1 -> 0）
idx=$(cat "$STATE_FILE" 2>/dev/null || echo -1)
[[ "$idx" =~ ^[0-9]+$ ]] || idx=-1
idx=$(( (idx + 1) % ${#NODES[@]} ))
node=${NODES[$idx]}

# 备份旧配置用于回滚
backup=""
if [ -f "$UPSTREAM_CONF" ]; then
    backup="$(mktemp)"
    cp -f "$UPSTREAM_CONF" "$backup"
fi

cat > "$UPSTREAM_CONF" <<EOF
# 本文件由 switch-backend.sh 自动生成，请勿手工修改
# 生成时间：$(date '+%F %T')
upstream mcp_api_backend {
    server ${node}:${PORT};
    keepalive 32;
}
EOF

if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
    echo "$idx" > "$STATE_FILE"
    [ -n "$backup" ] && rm -f "$backup"
    log "后端已切换为 ${node}:${PORT}（index=${idx} / 共 ${#NODES[@]} 个），reload 成功"
else
    log "nginx -t 校验失败，回滚配置且不 reload：" >&2
    nginx -t || true
    if [ -n "$backup" ]; then
        cp -f "$backup" "$UPSTREAM_CONF"
        rm -f "$backup"
    fi
    exit 1
fi
