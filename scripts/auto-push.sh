#!/bin/bash

# 自动提交和推送更改到GitHub的脚本
# 使用方法: ./auto-push.sh [提交信息]

# 设置工作目录
REPO_DIR="/workspace/todo-app"
cd "$REPO_DIR" || { echo "无法进入目录 $REPO_DIR"; exit 1; }

# 默认提交信息
COMMIT_MSG=${1:-"自动更新: $(date '+%Y-%m-%d %H:%M:%S')"}

echo "检查更改..."

# 检查是否有更改
if git status --porcelain | grep -q .; then
    echo "发现更改，准备提交..."
    
    # 添加所有更改
    git add .
    
    # 提交更改
    git commit -m "$COMMIT_MSG"
    
    # 推送到GitHub
    git push origin main
    
    echo "更改已成功推送到GitHub!"
else
    echo "没有发现需要提交的更改。"
fi

echo "完成!"