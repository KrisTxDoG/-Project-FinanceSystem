# Personal Finance System

個人財物系統 - 全棧應用

## 功能介紹
- 用戶認證與授權
- 收支記錄管理
- 預算設置與監控
- 支出分析與報表
- 交易分類統計

## 技術棧
- **後端**: Java Spring Boot
- **前端**: Angular
- **數據庫**: H2 (開發)/PostgreSQL (生產)
- **認證**: JWT

## 快速開始

### 後端
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
後端將運行在 http://localhost:8080

### 前端
```bash
cd frontend
npm install
ng serve
```
前端將運行在 http://localhost:4200

## 數據庫設置
### MySQL 配置
確保 MySQL 已安裝並運行。建立資料庫：
```bash
CREATE DATABASE FinanceSystem;
```

後端將自動創建所需的表。

### 後端配置

1. 複製配置模板：
```bash
cd backend/src/main/resources
cp application.yml.example application.yml
```

2. 編輯 `application.yml` 並填入你的配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:8889/FinanceSystem
    username: root
    password: your_password  # 改為你的 MySQL 密碼
  
jwt:
  secret: your_secret_key  # 改為你的 JWT 密鑰
```

> ⚠️ **注意**: `application.yml` 包含敏感信息，不會被上傳到 git。每個開發者需要自行配置。

## 項目結構
```
.
├── backend/              # Spring Boot 後端應用
├── frontend/             # Angular 前端應用
└── README.md
```
