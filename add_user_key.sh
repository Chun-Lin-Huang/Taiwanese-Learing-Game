#!/bin/bash

# SSH 金鑰管理腳本
# 使用方法: ./add_user_key.sh "用戶的公鑰內容" "用戶名稱(可選)"

if [ $# -eq 0 ]; then
    echo "使用方法: $0 \"用戶的公鑰內容\" [用戶名稱]"
    echo "範例: $0 \"ssh-rsa AAAAB3Nza... user@example.com\" \"張三\""
    exit 1
fi

PUBLIC_KEY="$1"
USER_NAME="${2:-未知用戶}"

# 檢查公鑰格式
if [[ ! "$PUBLIC_KEY" =~ ^ssh-(rsa|ed25519|ecdsa) ]]; then
    echo "錯誤: 無效的公鑰格式。公鑰應該以 ssh-rsa, ssh-ed25519, 或 ssh-ecdsa 開頭"
    exit 1
fi

# 備份現有的 authorized_keys
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup.$(date +%Y%m%d_%H%M%S)

# 加入新的公鑰
echo "# 用戶: $USER_NAME - 加入時間: $(date)" >> ~/.ssh/authorized_keys
echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys

echo "✅ 成功加入用戶 '$USER_NAME' 的公鑰"
echo "📁 authorized_keys 已備份"
echo "🔍 目前授權的金鑰數量: $(grep -c '^ssh-' ~/.ssh/authorized_keys)"
