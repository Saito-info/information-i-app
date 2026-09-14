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
- **テスト**: 開発中
- **用語**: 検索付きの用語リスト（タップで意味を表示）
- 学習記録はブラウザの `localStorage` に保存

## データ

- 用語: `src/data/essentials_informatics_terms.json`
