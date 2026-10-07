#!/bin/bash
#
# mcp-api 接口服务 —— 启动管理脚本
#
# 用法（在应用根目录下执行）：
#   ./deploy/restart.sh start     启动
#   ./deploy/restart.sh stop      停止
#   ./deploy/restart.sh restart   重启（部署后调用这个）
#   ./deploy/restart.sh status    查看状态
#   ./deploy/restart.sh health    健康检查
#   ./deploy/restart.sh logs      实时日志
#   ./deploy/restart.sh install   安装到 $HOME/.space/script/ 方便全局调用
#
# 环境变量（一般无需设置）：
#   APP_DIR     应用根目录，默认 $HOME/.space/app/mcp-api
#   ENV_MASTER  主 .env 文件，默认 $HOME/.space/app/mcp-api.env
#   SCRIPT_INSTALL install 目标，默认 $HOME/.space/script/mcp-api.sh
#
# 目标环境：tmq01/tmq02/tmq03 三台服务器（登录账号 ubuntu），
# 应用部署在 /home/ubuntu/.space/app/mcp-api 并以 ubuntu 身份运行。
#
# 设计要点：.env 存放在应用目录之外（ENV_MASTER），
# 每次 start 前同步回 APP_DIR/.env，这样重新解压覆盖应用目录也不会丢配置。
#
set -uo pipefail

APP_NAME="mcp-api"
APP_DIR="${APP_DIR:-$HOME/.space/app/mcp-api}"
ENV_MASTER="${ENV_MASTER:-$HOME/.space/app/mcp-api.env}"
SCRIPT_INSTALL="${SCRIPT_INSTALL:-$HOME/.space/script/mcp-api.sh}"
DEFAULT_PORT=18080
ENTRY="app/server.js"

PID_FILE="$APP_DIR/logs/$APP_NAME.pid"
LOG_DIR="$APP_DIR/logs"
LOG_FILE="$LOG_DIR/server.log"
ERROR_LOG="$LOG_DIR/server-error.log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ---------------------------------------------------------------- 基础

# 载入 nvm 里的 node（nvm 初始化写在 ~/.bashrc，非交互 shell 不会加载）
ensure_node() {
    if command -v node >/dev/null 2>&1; then
        return 0
    fi
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        # shellcheck disable=SC1091
        . "$HOME/.nvm/nvm.sh"
    fi
    if ! command -v node >/dev/null 2>&1; then
        error "找不到 node，请确认已安装 Node.js（nvm 或 /usr/local/bin）"
        return 1
    fi
}

# 从主 .env 读取端口
read_port() {
    local p=""
    if [ -f "$ENV_MASTER" ]; then
        p=$(grep -E '^PORT=' "$ENV_MASTER" 2>/dev/null | tail -1 | cut -d= -f2 | tr -d '[:space:]')
    fi
    echo "${p:-$DEFAULT_PORT}"
}

# .env 不存在则从模板生成（首次部署自动完成）
ensure_env() {
    if [ -f "$ENV_MASTER" ]; then
        return 0
    fi

    mkdir -p "$(dirname "$ENV_MASTER")"
    local template="$APP_DIR/deploy/env.server.template"
    [ -f "$template" ] || template="$APP_DIR/.env.example"

    if [ ! -f "$template" ]; then
        error "找不到环境变量模板（deploy/env.server.template 或 .env.example）"
        return 1
    fi

    cp "$template" "$ENV_MASTER"
    chmod 600 "$ENV_MASTER"
    info "已生成主配置文件：$ENV_MASTER（如需调整请直接编辑此文件）"
}

# 把主配置同步到应用目录（应用通过 dotenv 读取 APP_DIR/.env）
sync_env() {
    ensure_env || return 1
    cp "$ENV_MASTER" "$APP_DIR/.env"
}

is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE" 2>/dev/null)
        if [ -n "$pid" ] && ps -p "$pid" >/dev/null 2>&1; then
            return 0
        fi
        rm -f "$PID_FILE"
    fi
    return 1
}

# 按端口兜底清理残留进程
kill_by_port() {
    local port="$1"
    local pids
    pids=$(lsof -ti:"$port" 2>/dev/null)
    [ -z "$pids" ] && return 0

    warn "端口 $port 被占用，正在停止残留进程：$pids"
    for pid in $pids; do
        kill "$pid" 2>/dev/null
    done
    local timeout=8
    while [ $timeout -gt 0 ]; do
        local alive=""
        for pid in $pids; do
            ps -p "$pid" >/dev/null 2>&1 && alive="yes"
        done
        [ -z "$alive" ] && break
        sleep 1
        timeout=$((timeout - 1))
    done
    for pid in $pids; do
        ps -p "$pid" >/dev/null 2>&1 && kill -9 "$pid" 2>/dev/null
    done
    info "端口 $port 已释放"
}

# ---------------------------------------------------------------- 动作

start() {
    if is_running; then
        warn "服务已在运行（PID: $(cat "$PID_FILE")），如需重载请用 restart"
        return 0
    fi

    if [ ! -f "$APP_DIR/$ENTRY" ]; then
        error "应用目录不完整（缺少 $ENTRY）：$APP_DIR"
        return 1
    fi

    ensure_node || return 1
    sync_env || return 1

    local port
    port=$(read_port)
    kill_by_port "$port"

    if [ ! -d "$APP_DIR/node_modules" ]; then
        warn "node_modules 缺失，正在安装生产依赖..."
        (cd "$APP_DIR" && npm install --omit=dev --no-audit --no-fund) || {
            error "依赖安装失败"
            return 1
        }
    fi

    mkdir -p "$LOG_DIR"
    cd "$APP_DIR" || return 1

    info "启动 $APP_NAME（端口 $port）..."
    nohup node "$ENTRY" >"$LOG_FILE" 2>"$ERROR_LOG" &
    local pid=$!
    echo "$pid" >"$PID_FILE"

    # 轮询健康检查，最多等 30 秒
    local waited=0
    while [ $waited -lt 30 ]; do
        sleep 1
        waited=$((waited + 1))
        if ! ps -p "$pid" >/dev/null 2>&1; then
            error "进程已退出，启动失败。错误日志："
            tail -30 "$ERROR_LOG" 2>/dev/null
            rm -f "$PID_FILE"
            return 1
        fi
        if curl -sf --max-time 2 "http://127.0.0.1:$port/health" >/dev/null 2>&1; then
            info "启动成功（PID: $pid，端口 $port，耗时 ${waited}s）"
            info "日志：tail -f $LOG_FILE"
            return 0
        fi
    done

    error "启动超时（30s 内未通过健康检查）"
    tail -30 "$LOG_FILE" 2>/dev/null
    return 1
}

stop() {
    local port
    port=$(read_port)

    if is_running; then
        local pid
        pid=$(cat "$PID_FILE")
        info "正在停止（PID: $pid）..."
        kill "$pid" 2>/dev/null
        local timeout=10
        while [ $timeout -gt 0 ] && ps -p "$pid" >/dev/null 2>&1; do
            sleep 1
            timeout=$((timeout - 1))
        done
        if ps -p "$pid" >/dev/null 2>&1; then
            warn "进程未响应 TERM，强制结束"
            kill -9 "$pid" 2>/dev/null
        fi
        rm -f "$PID_FILE"
        info "已停止"
    else
        info "服务未在运行"
    fi

    kill_by_port "$port"
}

restart() {
    info "===== 重启 $APP_NAME ====="
    stop
    start
}

status() {
    local port
    port=$(read_port)
    echo "应用目录 : $APP_DIR"
    echo "配置文件 : $ENV_MASTER"
    echo "监听端口 : $port"
    if is_running; then
        local pid
        pid=$(cat "$PID_FILE")
        info "运行中（PID: $pid）"
        echo "内存占用 : $(ps -o rss= -p "$pid" 2>/dev/null | awk '{printf "%.1f MB", $1/1024}')"
        echo "启动时间 : $(ps -o lstart= -p "$pid" 2>/dev/null)"
        echo "健康检查 : $(curl -s --max-time 3 "http://127.0.0.1:$port/health" || echo '无响应')"
    else
        warn "未运行"
    fi
}

health() {
    local port
    port=$(read_port)
    local out
    out=$(curl -s --max-time 5 "http://127.0.0.1:$port/health")
    if [ -n "$out" ]; then
        info "GET /health → $out"
        return 0
    fi
    error "GET /health 无响应（端口 $port）"
    return 1
}

logs() {
    mkdir -p "$LOG_DIR"
    tail -f "$LOG_FILE"
}

install_self() {
    mkdir -p "$(dirname "$SCRIPT_INSTALL")"
    cp "$0" "$SCRIPT_INSTALL"
    chmod +x "$SCRIPT_INSTALL"
    info "已安装：$SCRIPT_INSTALL"
    info "之后可直接执行：$SCRIPT_INSTALL {start|stop|restart|status|logs}"
}

# ---------------------------------------------------------------- 入口

case "${1:-restart}" in
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    status)  status ;;
    health)  health ;;
    logs)    logs ;;
    install) install_self ;;
    *)
        echo "用法: $0 {start|stop|restart|status|health|logs|install}"
        exit 1
        ;;
esac
