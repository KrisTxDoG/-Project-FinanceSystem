# 用戶設置與偏好功能使用指南

## 📋 功能概述

本次新增的用戶設置與偏好功能包含以下內容：

### 1. 個人資料管理 👤
- 修改顯示名稱
- 更新電子郵件地址
- 查看用戶名（唯讀）

### 2. 偏好設置 🎨
- **優先貨幣** - 選擇交易中使用的默認貨幣（CNY、USD、EUR、JPY、GBP、HKD、TWD）
- **主題** - 選擇亮色或暗色模式
- **語言** - 選擇界面語言（繁體中文、English、簡體中文）
- **郵件通知** - 啟用/禁用電子郵件通知
- **預算告警** - 啟用/禁用預算超支告警

### 3. 密碼管理 🔐
- 安全地修改用戶密碼
- 密碼驗證和匹配檢查
- 修改後自動登出並重新登入

---

## 🚀 如何訪問設置

1. **登入系統後**，在導航欄中點擊 **⚙️ Settings** 鏈接
2. 或直接訪問：`http://localhost:4200/settings`

---

## 📖 功能詳細說明

### 個人資料標籤

#### 修改顯示名稱
1. 在「顯示名稱」輸入框中輸入新的名稱
2. 點擊「✅ 保存變更」按鈕
3. 系統會驗證名稱長度（至少2個字符）
4. 保存成功後會顯示「個人資料已更新」提示

#### 修改電子郵件
1. 在「電子郵件」輸入框中輸入新的郵箱地址
2. 系統會自動驗證郵箱格式
3. 點擊「✅ 保存變更」按鈕
4. 系統會檢查新郵箱是否被其他用戶使用

### 偏好設置標籤

#### 選擇優先貨幣
1. 在「優先貨幣」下拉菜單中選擇所需的貨幣
2. 點擊「✅ 保存偏好設置」按鈕
3. 所有交易和報表將使用選定的貨幣進行計算

#### 選擇主題
1. 在「主題」下拉菜單中選擇「亮色模式」或「暗色模式」
2. 點擊「✅ 保存偏好設置」按鈕
3. 界面將立即切換到選定的主題

#### 選擇語言
1. 在「語言」下拉菜單中選擇所需的語言
2. 點擊「✅ 保存偏好設置」按鈕
3. 界面語言將更新

#### 通知設置
- **📧 接收電子郵件通知** - 勾選此選項以接收系統郵件通知
- **🚨 接收預算告警** - 勾選此選項以在支出超過預算時接收告警

### 修改密碼標籤

#### 安全修改密碼
1. 在「當前密碼」輸入框中輸入您的當前密碼
2. 在「新密碼」輸入框中輸入新密碼（至少6個字符）
3. 在「確認新密碼」輸入框中再次輸入新密碼
4. 點擊「🔐 更改密碼」按鈕
5. 系統會進行以下檢查：
   - 當前密碼是否正確
   - 新密碼和確認密碼是否一致
   - 密碼長度是否至少6個字符

---

## 🔒 安全性說明

### 密碼政策
- 密碼必須至少包含 6 個字符
- 系統使用 bcrypt 加密存儲密碼
- 修改密碼時會驗證當前密碼

### 隱私保護
- 用戶名不可修改（用於唯一標識）
- 所有個人信息都存儲在加密的數據庫中
- 偏好設置與用戶賬戶綁定

---

## 🛠 技術實現

### 後端 API 端點

```
# 獲取個人資料
GET /api/settings/profile

# 更新個人資料
PUT /api/settings/profile
Content-Type: application/json
{
  "displayName": "新名稱",
  "email": "newemail@example.com"
}

# 獲取偏好設置
GET /api/settings/preferences

# 更新偏好設置
PUT /api/settings/preferences
Content-Type: application/json
{
  "preferredCurrency": "USD",
  "theme": "dark",
  "language": "en-US",
  "emailNotifications": true,
  "budgetAlerts": true
}

# 修改密碼
POST /api/settings/change-password
Content-Type: application/json
{
  "oldPassword": "currentPassword",
  "newPassword": "newPassword",
  "confirmPassword": "newPassword"
}
```

### 前端服務

#### PreferencesService
提供以下方法：
- `getUserProfile()` - 獲取用戶個人資料
- `updateUserProfile(profile)` - 更新個人資料
- `changePassword(request)` - 修改密碼
- `getUserPreferences()` - 獲取偏好設置
- `updateUserPreferences(preferences)` - 更新偏好設置

### 數據模型

#### UserPreferences 實體
```java
- id: Long
- user: User (OneToOne)
- preferredCurrency: String (默認: "CNY")
- theme: String (默認: "light")
- language: String (默認: "zh-TW")
- emailNotifications: Boolean (默認: true)
- budgetAlerts: Boolean (默認: true)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

---

## 🐛 常見問題

### Q1: 修改電子郵件後需要重新驗證嗎？
**A:** 不需要。新郵箱地址會立即生效。

### Q2: 修改密碼後需要重新登入嗎？
**A:** 需要。為了安全起見，系統會自動登出您並要求重新登入。

### Q3: 如果忘記密碼怎麼辦？
**A:** 目前系統不支持密碼重置功能。請聯繫管理員。

### Q4: 是否可以還原已保存的偏好設置？
**A:** 不可以。每次保存都會覆蓋之前的設置。建議在修改前記錄當前設置。

### Q5: 更改主題是否會影響其他用戶？
**A:** 不會。主題設置是個人的，只影響您登入後的界面顯示。

---

## 📝 未來改進計劃

- [ ] 添加雙因素認證 (2FA)
- [ ] 支持更多語言
- [ ] 添加密碼重置功能
- [ ] 支持社交媒體登入
- [ ] 添加賬戶活動日誌
- [ ] 支持多設備登入管理

---

## 📧 反饋與支持

如有任何問題或建議，請聯繫開發團隊。

**最後更新**: 2026年5月14日  
**版本**: 1.2.0
