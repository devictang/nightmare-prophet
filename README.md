# 🌌 夢魘先知 (Nightmare Prophet)

暗黑風(Diablo-like) + 夢境主題 + 策略掛機與手操破局的雙軌點擊遊戲

**試玩：** https://nightmare-prophet.vercel.app
**自訂域名：** https://nightmare-prophet.oyx.app

---

## 🎮 遊戲系統

### 四維核心矩陣

| 系統 | 說明 |
|:--|:--|
| **⛏️ 採集** | 點擊/掛機獲取夢境原材料（鐵礦、晶石） |
| **🏋️ 訓練** | 提升等級，獲得天賦點解鎖職業天賦 |
| **⚔️ 戰鬥** | Tempo Bar 氣條系統，手操技能 vs 自動掛機 |
| **🔨 鍛造** | 雙軌裝備強化：等級(Lv) + 存在感(Presence) |

### 雙軌裝備系統
- **等級 (Level)** — 消耗採集資源，抗數值通脹
- **存在感 (Presence Lv.1-5)** — 消耗現實錨定劑，解鎖詞條
  - **Lv.5 現實錨點**：裝備永久保留，跨轉生繼承

### 轉生系統
- 每層夢境完成靈魂結算 → 獲得 **意志點**
- 抽取 **命運天賦** 帶入下一層
- 裝備存在感 Lv.5 = 現實錨點，不被轉生重置

### 職業四選一
⚔️ 戰士 · 🗡️ 刺客 · 🔮 法師 · 🏹 遊俠

---

## 🛠️ Tech Stack

| 層 | 技術 |
|:--|:--|
| **前端** | React 19, TypeScript, Vite 8, Tailwind CSS 4, Framer Motion |
| **狀態** | Zustand (client) + TanStack Query (server) |
| **後端** | Supabase (PostgreSQL + Auth + RLS) |
| **部署** | Vercel (frontend) |
| **PWA** | vite-plugin-pwa (Add to Home Screen) |

---

## 🚀 部署指南

### Vercel

1. 確保 GitHub repo 已 connect：`devictang/nightmare-prophet`
2. Vercel 會自動 detect Vite build
3. 加入 Environment Variables：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 自訂域名已設定：`nightmare-prophet.oyx.app`
   - 需要喺 DNS provider 加 CNAME：
   ```
   nightmare-prophet.oyx.app → cname.vercel-dns.com
   ```

### 本地開發

```bash
git clone https://github.com/devictang/nightmare-prophet.git
cd nightmare-prophet
cp .env.example .env    # 填入 Supabase credentials
npm install
npm run dev             # http://localhost:5173
```

---

## 🗄️ Supabase

完整 schema 喺 `supabase/migrations/001_schema.sql`。

執行方式：Supabase Dashboard → **SQL Editor** → 貼上執行。

### Tables
- `profiles` — 玩家資料（extends auth.users）
- `saves` — JSON save data
- `leaderboard` — 排行榜
- `willpower_cards` — 已購買的命運天賦
- `anchored_equipment` — 錨定裝備（存在感 Lv.5）

---

## 📁 專案結構

```
src/
├── lib/              # 遊戲引擎邏輯 + 常量 + 類型
│   ├── types.ts       # TypeScript 類型定義
│   ├── constants.ts   # 遊戲常量、天賦樹、技能、裝備模板
│   ├── gameEngine.ts  # 純函數（戰鬥公式、資源計算）
│   └── supabase.ts    # Supabase client
├── stores/
│   └── gameStore.ts   # Zustand 狀態管理（全部遊戲邏輯）
├── components/
│   ├── Camp.tsx       # 築夢前哨（主界面）
│   ├── CombatScreen.tsx  # 戰鬥系統
│   ├── ForgeScreen.tsx   # 鍛造工坊
│   ├── TrainingScreen.tsx # 天賦樹
│   ├── EquipmentScreen.tsx # 裝備檢視
│   ├── RebirthScreen.tsx  # 轉生/意志點
│   ├── ResourceBar.tsx   # 頂部資源條
│   └── GameLayout.tsx    # 遊戲布局容器
├── pages/
│   └── HomePage.tsx   # 登陸/選職業畫面
├── App.tsx            # Router
└── main.tsx           # Entry point
```

---

## 📝 License

Private project — © devictang
