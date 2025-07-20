# Taiwanese-learning-robot
建立自己的分支， 確認沒問題後再傳到主頁 這樣比較不容易有衝突
### **建立自己的分支**　　　
```
git checkout -b feature/分支名稱
```
### 把程式碼上傳到分支
```
git add .
git commit -m "檔名"
git push origin  feature/ 分支名稱
```
- 上傳後可以到 GitHub 上看到這個分支

### 合併分支到主分支（main）
```
# 切換到 main
git checkout main

# 拉最新的 main（從 GitHub）
git pull origin main

# 合併你的分支到 main
git merge feature/about

# 把合併後的 main 推回 GitHub
git push origin main
```
