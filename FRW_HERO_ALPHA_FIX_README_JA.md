# Fashion Runway Worlds — Hero Alpha Fix

Android実機で確認された青緑色の矩形ハローと背景残像を除去したhero PNGです。

## 修正対象

- `hero-idle.png`
- `hero-run.png`
- `hero-run-2.png`
- `hero-jump.png`
- `hero-attack.png`
- `hero-fly.png`

背景はグリーンバックの色差で除去し、ジャンプ・攻撃・飛行画像に残っていた長い灰色バーも削除しました。ジーンズの青色を背景と誤認して消さないよう、青色全体を一括除去する処理は使っていません。

## Mac側への反映

このzipをプロジェクトのルートで展開してください。

```bash
cd ~/Downloads/'fashion-runway-worlds 2'
unzip -o ~/Downloads/FRW_HERO_ALPHA_FIX.zip
pnpm check
pnpm build
npx cap sync android
```

scene.tsはすでに次の6つのファイル名を参照しているため、参照パスの変更は不要です。

```text
/assets/hero-idle.png
/assets/hero-run.png
/assets/hero-run-2.png
/assets/hero-jump.png
/assets/hero-attack.png
/assets/hero-fly.png
```

## AAB

今回の修正版をGoogle Playへ出す場合は、使用済みの19ではなく`versionCode 20`を使用してください。

```bash
sed -i '' -E 's/versionCode [0-9]+/versionCode 20/' android/app/build.gradle
grep -n versionCode android/app/build.gradle
```

その後、Android StudioでSigned App Bundleを生成してください。`pnpm build`と`npx cap sync android`を省略すると、古いPNGがAABに残る可能性があります。
