# 節約タイプ診断（setsuyaku-shindan）

5問の質問に答えるだけで、自分にぴったりの「家計改善ポイント」がわかる診断ツール。
インスタ・ブログ・一斉配信からの動線として使える静的サイト。

## 構成

- 純粋な HTML + Vanilla JavaScript + Tailwind CSS（CDN）
- ビルド不要、Node.js 不要
- 静的ホスティングならどこでもデプロイ可能（Cloudflare Pages 推奨）

## ファイル構成

```
setsuyaku-shindan/
├── index.html              # トップページ
├── diagnose.html           # 診断フロー
├── result.html             # 結果ページ
├── css/style.css           # 補助CSS
├── js/
│   ├── app.js              # データ読み込み・回答永続化
│   ├── diagnose.js         # 診断フローの描画・判定
│   └── result.js           # 結果ページの描画
├── data/
│   ├── questions.json      # 5問の質問・選択肢・重み
│   ├── types.json          # 5タイプの定義・改善ステップ
│   └── affiliates.json     # アフィリ案件（体験済みのみ・PR表記必須）
├── images/characters/
│   └── dacchooo.svg        # キャラクタープレースホルダー（後で実写に差し替え）
└── .claude/launch.json     # ローカルプレビュー設定
```

## 5タイプの判定軸

| ID | タイプ名 | 想定ペルソナ | 紐付けアフィリ |
|---|---|---|---|
| A | 固定費削減型 | まずは固定費から削りたい人 | マネキャリ / スキスキ |
| B | 投資デビュー型 | 節約は卒業、お金を増やしたい人 | GFS / マネキャリ新NISA |
| C | 不動産デビュー型 | 株以外の投資にも手を伸ばしたい人 | TORCHES / らくたま |
| D | 家計可視化型 | なんとなく不安、まず家計簿から | マネキャリ / GFS |
| E | 副業／学び型 | 削るより稼ぎたい人 | スキスキ / GFS |

判定は各質問の選択肢に持たせた `weights` の合計が最大のタイプ。同点はA→B→C→D→Eで先勝ち。

## ローカル動作確認

iCloudパス内に空白があるため、シンプルにPython のHTTPサーバーで起動するのが確実。

```bash
cd "/Users/nodahiroki/Library/Mobile Documents/com~apple~CloudDocs/Claud Code/setsuyaku-shindan"
/usr/bin/python3 -m http.server 8765
# → http://localhost:8765/
```

## データの編集

商材情報・キャラのセリフ・質問内容はすべて `data/*.json` を編集するだけで反映される（ビルド不要）。

- 商材を増やす：`data/affiliates.json` に追加 → `data/types.json` の `recommendedAffiliates` に id を追加
- 体験済みになった案件：`data/affiliates.json` の `experienced: true` を維持してそのまま掲載
- 体験前の案件：紹介NG（feedback_unexperienced_affiliate_priority ルール）。`affiliates.json` から削除

## 重要ルール（メモリ準拠）

- ✅ 全アフィリ案件カードに **PR 表記** を明示（feedback_pr_label_required）
- ✅ **体験済み案件のみ** 掲載（feedback_unexperienced_affiliate_priority）
- ✅ **数字・体験の創作は禁止**（feedback_no_hallucination_numbers）
  - data ファイル内の文言は、実体験ベースの汎用表現に統一済み
  - 具体的な節約額・収入額は、だっちょさんが実数値を入れる前提で空けてある
- ✅ **GFS 表記**（reference_gfs_buffessa_rename）：バフェッサ表記NG

## キャラクター画像の差し替え

`images/characters/dacchooo.svg` はプレースホルダー。インスタ用のキャラ画像（だっちょの実写またはイラスト）に差し替えると、結果ページの体験談がより自然になる。

```bash
# 実写に差し替える例
cp "/path/to/dacchooo-icon.png" \
  "/Users/nodahiroki/Library/Mobile Documents/com~apple~CloudDocs/Claud Code/setsuyaku-shindan/images/characters/dacchooo.png"
# その後、各HTML/JSの `dacchooo.svg` を `dacchooo.png` に置換
```

## デプロイ手順（Cloudflare Pages）

1. このディレクトリをGitHubリポジトリとして公開（プライベートでもOK）
2. [Cloudflare Pages](https://pages.cloudflare.com/) にログイン → 「Create a project」
3. GitHubと連携 → 該当リポジトリを選択
4. ビルド設定：
   - Framework preset：**None**
   - Build command：（空欄）
   - Build output directory：`/`（または `setsuyaku-shindan`）
5. 「Save and Deploy」→ `xxx.pages.dev` で公開
6. カスタムドメイン設定したい場合：「Custom domains」から追加

## 動線への組み込み

公開後、以下の動線にURLを設置：

- **インスタプロフィール**：Linktree などのリンク集に「節約タイプ診断」を追加
- **インスタ投稿のCTA**：「家計改善ポイントは診断で→プロフのリンクへ」
- **一斉配信**：本文に診断URLを直接貼る（feedback_broadcast_url_direct ルール）
- **ブログ記事**：関連記事内CTAに埋め込み

## 拡張アイデア

- [ ] 結果を画像で保存・SNS共有する機能（html2canvasなど）
- [ ] Q&Aのアコーディオン（よくある質問）
- [ ] 結果ページにアクセス解析タグ（GA4 / Cloudflare Web Analytics）
- [ ] 動的に商材データをスプシから読み込む（drive_tool.py 経由でJSON更新）
