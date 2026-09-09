# 情報Ⅰ 単語帳

高校生向け「情報Ⅰ」一問一答フラッシュカードアプリ（Next.js App Router + Tailwind CSS）。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

- **学習タブ**: 分野・出題数を選んでフラッシュカード学習
- **復習タブ**: 不正解 / あやふやに記録した用語を復習
- 学習記録はブラウザの `localStorage` に保存

## データ

用語データは `src/data/essentials_informatics_terms.json` から読み込みます。
