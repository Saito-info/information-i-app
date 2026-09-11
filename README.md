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
- テスト問題: `src/data/exam_questions.json`

### テスト問題の追加形式

```json
{
  "id": "unique-id",
  "category": "情報社会",
  "question": "問題文",
  "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "answerIndex": 1,
  "explanation": "解説（任意）"
}
```

`answerIndex` は正解の選択肢の 0 始まりインデックスです。
