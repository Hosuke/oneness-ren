# 仁 · 二人 — oneness.ren

仁，親也。从人从二：仁在兩人之間。  
同行二人：一人上路，從來有相伴者；二而不二。  
倒轉巴別：諸語各保其聲，相遇而不相混。  
一張宣紙，沉石般的「仁」，及每個詞的真實出處。

## 本地閱覽

純靜態 HTML、CSS 與原生 ES modules；無建置步驟、無框架。須用 HTTP 讀取 modules，勿直接開 `file://`。

```sh
tmux new-session -d -s oneness-http 'python3 -m http.server 8765'
# 瀏覽 http://localhost:8765/
tmux capture-pane -pt oneness-http -S -80
tmux kill-session -t oneness-http
```

Google Fonts 須連網；字體未到時使用系統襯線字。按實際文字，以 CSS2 `text=` 子集載入 CJK 及各文字系統。

## 檔案

- `index.html`：沉石、三章與收尾；`sources.html`：同一詞庫生成的完整出處表。
- `css/style.css`：紙墨、明暗、雙語排版、手機抽屜及減動模式。
- `js/main.js`：啟動與生命週期；`float.js`：兩個獨立浮字場景；`card.js`：卡片與焦點；`chapters.js`：捲動敘事。
- `js/fonts.js`：按需字體；`entries.js`：共用詞條呈現；`glyph.js`：OFL 字體抽取的「亻」「二」輪廓。
- `data/words.js`：核實詞條；`data/pending.md`：候主人裁的待核表。
- `tools/shot.mjs`：四種設定、29 張截圖及錯誤統計；`tools/extract-glyph.py`：重現字形抽取。
- `fonts/LICENSES.md`：字體及輪廓的 OFL 全文；`LICENSE`：本站許可。
- `assets/og.png`：分享圖（1200×630），由 `node tools/og.mjs http://localhost:8765/` 自靜態首屏生成。
- `docs/hub-design.md`：oneness.ren 作為主站的設計草案。

## 詞條契約

`export const WORDS = [...]`；每項必有 `id`（唯一 ASCII/kebab）、`text`、`dir`（ltr/rtl）、`lang`（BCP 47）、`roman`、`langName: {zh,en}`、`gloss: {zh,en}`、`relation`、`weight`（1–3）、`sources`（至少一項）。可另有 `note: {zh,en}`。每一出處含 `title`、`url`（僅紙本可為空）及可選 `quote`。

關係只可為 `self` 本字、`translation` 對譯、`neighbour` 近義；不得混稱。首發 28 條（本字 1、對譯 13、近義 14），皆於 2026-09-26 逐條查證；未能核實者見 `data/pending.md`。浮字按權重取樣，足量時避重；單詞亦能完整運作。全頁繁體中文為主、英文為輔；原文保留 `lang` 與 `dir`。

## 自驗

```sh
for f in js/*.js data/*.js; do node --check "$f"; done
node tools/shot.mjs http://localhost:8765/ /tmp/oneness-shots
git status --short --untracked-files=all
```

`shot.mjs` 只從 `~/.cache/oneness-work/node_modules` 取 `playwright-core`；若尚未安裝，僅在該外部目錄執行 `npm init -y` 及 `npm i playwright-core`。瀏覽器優先取 `~/Library/Caches/ms-playwright/chromium_headless_shell-1228/`，否則取最新已裝版本。截圖含桌面、手機、暗色、減動四套，及出處表；遇 console error / pageerror 或截圖失敗即 exit 1。

字形重現：外部 venv 安裝 `fonttools brotli`，下載 [LXGW WenKai TC v1.522](https://github.com/lxgw/LxgwWenkaiTC/releases/tag/v1.522)，執行 `~/.cache/oneness-work/venv/bin/python tools/extract-glyph.py ~/.cache/oneness-work/LXGWWenKaiTC-Regular-v1.522.ttf`。這是維護工具，不是網站建置步驟。

## 許可

本站原創內容與程式：Copyright (c) 2026 Hosuke，CC BY-NC-SA 4.0，全文見 `LICENSE`。字體與衍生輪廓另循 SIL OFL 1.1，見 `fonts/LICENSES.md`。和合本及 KJV 引文為公有領域；古籍引文附原典出處。不部署、不更改 DNS。
