#!/bin/bash

# 一键启动小红蛋脚本
# 作者：小红蛋
# 创建日期：$(date +"%Y-%m-%d")

# 显示彩色输出的函数
print_green() {
    echo -e "\e[32m$1\e[0m"
}

print_yellow() {
    echo -e "\e[33m$1\e[0m"
}

print_blue() {
    echo -e "\e[34m$1\e[0m"
}

print_red() {
    echo -e "\e[31m$1\e[0m"
}

# 显示启动横幅
print_blue "=================================="
print_blue "      小红蛋一键启动脚本        "
print_blue "=================================="
echo ""

# 确保我们在正确的目录中
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || {
    print_red "错误：无法进入脚本所在目录！"
    exit 1
}

print_yellow "当前工作目录: $(pwd)"
echo ""

# 检查是否安装了Hexo
if ! command -v hexo &> /dev/null; then
    print_red "错误：未找到Hexo命令。请确保已全局安装Hexo或在当前项目中安装。"
    print_yellow "提示：可以使用 'npm install -g hexo-cli' 全局安装Hexo命令行工具。"
    exit 1
fi

# 清理之前生成的文件
print_yellow "步骤1: 清理之前生成的文件..."
hexo clean
if [ $? -ne 0 ]; then
    print_red "错误：清理过程中出现问题！"
    exit 1
fi
print_green "清理完成！"
echo ""

# 生成新的静态文件
print_yellow "步骤2: 生成新的静态文件..."
hexo generate
if [ $? -ne 0 ]; then
    print_red "错误：生成过程中出现问题！"
    exit 1
fi
print_green "生成完成！"
echo ""

# 启动本地服务器
print_yellow "步骤3: 启动本地服务器..."
print_green "小红蛋服务器正在启动，请稍候..."
echo ""
print_blue "=================================="
print_blue "  您的小红蛋将在以下地址可访问:    "
print_blue "  http://localhost:4000          "
print_blue "=================================="
print_yellow "按 Ctrl+C 可停止服务器"
echo ""

# 启动服务器
hexo server