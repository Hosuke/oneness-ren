# AGENTS.md — Hosuke/oneness（仁 · 二人）

先完整閱讀根目錄 `PROMPT.md`。以當次 goal 為施工契約；立意與紅線不可偏離。本次止於本地驗收：**不 commit、不 deploy、不動 DNS**。

## 項目

純前端靜態小品：HTML、CSS、原生 ES modules，無建置步驟、npm、框架或 WebGL。
- `index.html`：沉石浮字、从人从二、同行二人、倒轉巴別與收尾。
- `sources.html` 與卡片皆從 `data/words.js` 呈現，不另藏詞庫。
- 浮字為 DOM，canvas 只畫紙紋與細線；兩場景按可見性停啟。
- 所有介面繁體中文為主、英文為輔；原文字形、方向與語言標記必須保留。

## 自驗（必跑並貼結果）

```sh
for f in js/*.js data/*.js; do node --check "$f"; done
tmux new-session -d -s oneness-http 'python3 -m http.server 8765'
node tools/shot.mjs http://localhost:8765/ /tmp/oneness-shots
tmux kill-session -t oneness-http
git status --short --untracked-files=all
```

舊 Node 如誤判 modules，可逐檔用 `node --input-type=module --check < file`。截圖須含桌面、手機、暗色、減動：零 console error、零 pageerror；親看至少兩輪。另驗 Tab、焦點圈限、Esc、抽屜滑下、點外關閉，以及 `N >= 1`。

依賴僅置 `~/.cache/oneness-work/`，不得在 repo 安裝 `node_modules`、建立 package manifest 或 lockfile。長驗證用 tmux，記錄 session 與日誌，交付前關閉本地 server；本機不作長期 runtime。

## 紅線

- 詞條必有可信出處，且如實標示 `self` / `translation` / `neighbour`。近義絕非等義，不憑機翻或印象加詞。
- 未查實者只入 `data/pending.md`，候主人裁。本版 `WORDS` 只准給定的「仁」；另候核實工序。
- 不引入 build tools、打包器、框架、WebGL 或不必要第三方程式。
- 不部署、不改 DNS、不自行提交推送；不覆寫使用者改動。
- 字體只用 OFL；圖像等資產只用 OFL / CC0 / CC BY，保留出處與完整許可。衍生字形仍留 OFL 通知。
- `assets/og.png` 由 `tools/og.mjs` 生成，不得手造佔位圖。
- 朱色只予「仁」靠近時的一線微光與小印章。禁 emoji、地球／握手／彩虹符號、卡片陰影、漸變按鈕。
- 尊重 `prefers-reduced-motion`；背景隱藏或場景出視口即停浮字 rAF，恢復須重置時間戳。

## 協作

可並行探索、實作、驗證，但先分清檔案 ownership；主線整合與視覺終驗。手工改檔用 `apply_patch`；勿清除既有檔案或作破壞式 git 操作。
