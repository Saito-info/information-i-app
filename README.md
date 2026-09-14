# 情報Ⅰ 単語帳

高校生向け「情報Ⅰ」一問一答フラッシュカード／共通テスト演習アプリ（Next.js App Router + Tailwind CSS）。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

- **学習**: 分野・出題数を選んでフラッシュカード学習
- **テスト**: 第1〜4問から分野を選び、14種の試験からランダム出題（PDF＋マーク解答）
- **復習**: 用語の苦手復習／テストで間違えた問題の復習
- **用語**: 検索付きの用語リスト
- **履歴**: 学習・テストの実施履歴（削除可）
- 学習記録はブラウザの `localStorage` に保存

## データ

- 用語: `src/data/essentials_informatics_terms.json`
- 試験: `src/data/exams/`（JSON + `catalog.json`）
- 問題ページ画像: `public/exam-pages/`
- 解答ページ画像: `public/exam-answers/`

PDFの再抽出:

```bash
python scripts/extract_exam_pages.py
```
