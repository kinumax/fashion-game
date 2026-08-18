# GitHub / Vercel 公開手順

このプロジェクトはViteの静的フロントエンドとしてVercelへ公開できる。`vercel.json`で`pnpm build`、出力先`dist/public`、SPAルーティングを指定している。

## GitHub CLIを使う場合

```bash
cd /home/ubuntu/neon-beat-star

git status
git add .
git commit -m "Add hold notes and perspective rhythm stage"

gh auth login
gh repo create neon-beat-star --public --source=. --remote=origin --push
```

既存のGitHubリポジトリへ送る場合は、最後の行を次のように置き換える。

```bash
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git branch -M main
git push -u origin main
```

## Vercel CLIを使う場合

```bash
cd /home/ubuntu/neon-beat-star
npm i -g vercel
vercel login
vercel --prod
```

初回の質問では、Framework PresetをVite、Build Commandを`pnpm build`、Output Directoryを`dist/public`にする。GitHubリポジトリをVercelのImport画面から接続する場合も、`vercel.json`が設定を引き継ぐ。

## 注意

GitHubへpushする前に、`git status`で秘密情報や不要な生成物が含まれていないことを確認する。このプロジェクトの画像はWebDev管理下の`/manus-storage/` URLを参照しており、画像本体をリポジトリへコピーする必要はない。
