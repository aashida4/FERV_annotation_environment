# 表情アノテーションインターフェース

このWebアプリケーションは、動画の表情に対してアノテーション（ラベル付け）を行うためのインターフェースです。

## プロジェクト構成

```
annotation_interface/
├── index.html              # メインのアノテーションインターフェース
├── style.css               # スタイルシート
├── script.js               # JavaScript機能実装
├── setup.html              # セットアップガイドページ
├── sample_video_list.csv   # サンプルCSVファイル
├── README.md               # このファイル
├── .gitignore              # Git除外設定
└── specifications.txt      # 仕様書
```

## 機能

- **CSVファイルからの動画リスト読み込み**
- **7つの基本感情のアノテーション**：怒り、嫌悪、恐怖、幸福、悲しみ、驚き、中立
- **操作ボタン**：Previous、Pass、Next
- **詳細な感情説明ガイド**
- **進捗表示**
- **結果のCSV出力**
- **キーボードショートカット対応**

## クイックスタート

### 1. プロジェクトのクローン（Git使用時）
```bash
git clone <repository-url>
cd annotation_interface
```

### 2. セットアップガイドの確認
ブラウザで `setup.html` を開いて詳細なセットアップガイドを確認してください。

### 3. 環境準備
動画ファイルのリストをCSVファイルで準備してください。

**CSVファイルの形式例：**
```csv
ID,FilePath,Description
video_001,videos/sample1.mp4,Sample emotion video 1
video_002,videos/sample2.mp4,Sample emotion video 2
video_003,videos/sample3.mp4,Sample emotion video 3
```

### 3. アノテーション作業
1. `index.html`をWebブラウザで開きます
2. 「CSVファイルを選択」ボタンから動画リストのCSVファイルを読み込みます
3. 動画が自動的に読み込まれます
4. 動画を再生して表情を確認します
5. 適切な感情を選択します
6. 「Next」ボタンで次の動画に進みます
7. 判定が困難な場合は「Pass」ボタンを使用します

### 4. キーボードショートカット
- **左矢印キー**: 前の動画
- **右矢印キー**: 次の動画
- **スペースキー**: Pass
- **数字キー 1-7**: 各感情の選択
  - 1: 怒り (Angry)
  - 2: 嫌悪 (Disgust) 
  - 3: 恐怖 (Fear)
  - 4: 幸福 (Happy)
  - 5: 悲しみ (Sad)
  - 6: 驚き (Surprise)
  - 7: 中立 (Neutral)

### 5. 結果の保存
全てのアノテーション作業が完了したら、「結果をダウンロード」ボタンをクリックしてCSVファイルとして結果を保存します。

## 出力ファイル形式

結果のCSVファイルには以下の情報が含まれます：
- Video ID: 動画の識別子
- File Path: 動画ファイルのパス
- Emotion: 選択された感情（angry, disgust, fear, happy, sad, surprise, neutral, pass）
- Status: アノテーションの状態（annotated, passed, not_annotated）
- Timestamp: アノテーション実行時刻

## 技術仕様

### サポートされる動画形式
- MP4
- WebM
- OGV
- その他HTML5ビデオタグでサポートされる形式

### ブラウザ要件
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 注意事項

1. **動画ファイルのパス**: CSVファイルに記載する動画ファイルのパスは、HTMLファイルからの相対パスまたは絶対URLで指定してください。

2. **ローカルファイルアクセス**: ブラウザのセキュリティ制限により、ローカルファイルを直接読み込む場合は、ローカルサーバーを立ち上げることを推奨します。

3. **大きなファイル**: 大量の動画ファイルを扱う場合は、ブラウザのメモリ使用量にご注意ください。

## ローカルサーバーの起動方法

### Python 3を使用する場合：
```bash
python -m http.server 8000
```

### Node.jsを使用する場合：
```bash
npx http-server
```

その後、ブラウザで `http://localhost:8000` にアクセスしてください。

## カスタマイズ

### 感情カテゴリの変更
`script.js`の感情リストを変更することで、異なる感情カテゴリに対応できます。

## トラブルシューティング

### 動画が読み込まれない場合
1. 動画ファイルのパスが正しいか確認
2. 動画ファイルがサポートされる形式か確認
3. ブラウザの開発者ツールでエラーメッセージを確認

### CSVファイルが読み込まれない場合
1. CSVファイルの形式が正しいか確認
2. 文字エンコーディングがUTF-8か確認

## 開発・貢献

### Gitワークフロー
```bash
# 初期設定
git init
git add .
git commit -m "Initial commit: 表情アノテーションインターフェースの実装"

# 機能追加時
git add .
git commit -m "feat: 新機能の説明"

# バグ修正時
git add .
git commit -m "fix: 修正内容の説明"
```

### ブランチ戦略
- `main`: 安定版
- `develop`: 開発版
- `feature/*`: 機能追加
- `fix/*`: バグ修正
