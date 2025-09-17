# Linux/Mac SSH 金鑰設定指南

## 步驟 1: 生成 SSH 金鑰對

在終端中執行：

```bash
ssh-keygen -t rsa -b 4096 -C "你的email@example.com"
```

- 按 Enter 使用預設檔案位置 (`~/.ssh/id_rsa`)
- 可以設定密碼短語（推薦）或直接按 Enter 跳過
- 再按一次 Enter 確認

## 步驟 2: 查看公鑰內容

```bash
cat ~/.ssh/id_rsa.pub
```

## 步驟 3: 提供公鑰

將步驟 2 的完整輸出內容（以 `ssh-rsa` 開頭的一長串文字）提供給伺服器管理員。

## 步驟 4: 測試連線

管理員加入你的公鑰後，測試連線：

```bash
ssh b310ai@163.13.202.125 -p 2288 -i ~/.ssh/id_rsa
```

## 注意事項

- **絕對不要分享私鑰** (`id_rsa` 檔案)
- **只分享公鑰** (`id_rsa.pub` 檔案的內容)
- 確保私鑰檔案權限正確：`chmod 600 ~/.ssh/id_rsa`
