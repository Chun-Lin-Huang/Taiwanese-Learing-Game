# SSH 金鑰生成範例

## 不同的標籤方式

### 1. 使用 Email（推薦）
```bash
ssh-keygen -t rsa -b 4096 -C "john@company.com"
```
生成的公鑰結尾：`...AAAAB john@company.com`

### 2. 使用描述性標籤
```bash
ssh-keygen -t rsa -b 4096 -C "John-MacBook-Pro"
```
生成的公鑰結尾：`...AAAAB John-MacBook-Pro`

### 3. 使用用戶名加設備
```bash
ssh-keygen -t rsa -b 4096 -C "張三-辦公室電腦"
```
生成的公鑰結尾：`...AAAAB 張三-辦公室電腦`

### 4. 不使用標籤（不推薦）
```bash
ssh-keygen -t rsa -b 4096
```
生成的公鑰結尾：`...AAAAB user@hostname`（系統自動生成）

## 管理員視角

當管理員查看授權金鑰時：

```bash
# 清楚的標籤
ssh-rsa AAAAB3NzaC1yc2EAAAA... john@company.com        ← 知道是 John
ssh-rsa AAAAB3NzaC1yc2EAAAA... mary@company.com        ← 知道是 Mary
ssh-rsa AAAAB3NzaC1yc2EAAAA... admin-server-backup     ← 知道是備份用途

# 不清楚的標籤
ssh-rsa AAAAB3NzaC1yc2EAAAA... user@desktop-abc123     ← 不知道是誰
```

## 結論

**Email 只是一個方便的標籤，讓管理更容易。你可以使用任何有意義的標籤。**
