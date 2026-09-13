# 情報Ⅰ 単語帳

高校生向け「情報Ⅰ」一問一答フラッシュカードアプリ（Next.js App Router + Tailwind CSS）。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

- **学習**: 分野・出題数を選んでフラッシュカード学習
- **復習**: 不正解 / あやふやに記録した用語を復習
- **テスト**: 本番形式の択一問題を短時間で演習（`exam_questions.json`）
- **用語**: 検索付きの用語リスト（タップで意味を表示）
- 学習記録はブラウザの `localStorage` に保存

## データ

- 用語: `src/data/essentials_informatics_terms.json`
- テスト問題: `src/data/exams/` 配下の各JSON（河合塾第1〜4回、試作問題、令和7/8 本試・追試）
- 図版: `public/exam-figures/`（ファイル名一覧は同フォルダの `FIGURES.md`）

テストタブでは分野（テスト）を選び、その分野の問題がランダム順で出題されます（出題数の指定はありません）。
同じ親問に属する小問では、共通の問題文・図表・表・画像をすべてに表示します。
