# Fashion Runway Worlds — Hero pose fix

今回の修正では、ジャンプ・攻撃・飛行ポーズに残っていた青い矩形背景を透明化し、走行中に2枚の画像を交互表示するようにしました。

## 変更ファイル

次のファイルをMac側の同じ場所へ上書きしてください。

```text
client/src/game/scene.ts
client/public/assets/hero-jump.png
client/public/assets/hero-attack.png
client/public/assets/hero-fly.png
client/public/assets/hero-run-2.png
```

既存の`hero-run.png`と`hero-idle.png`はそのまま使用します。

## Macでの取り込み

転送用zipを展開したプロジェクトのルートで、次を実行します。

```bash
cd ~/Downloads/'fashion-runway-worlds 2'
unzip -o ~/Downloads/FRW_HERO_FIX.zip
pnpm check
pnpm build
npx cap sync android
```

`hero-run-2.png`がAndroid側へコピーされたことを確認します。

```bash
find android/app/src/main/assets/public/assets -maxdepth 1 -name 'hero-*.png' -print
```

次の6ファイルが表示されれば資産同期は成功です。

```text
hero-idle.png
hero-run.png
hero-run-2.png
hero-jump.png
hero-attack.png
hero-fly.png
```

その後、Android Studioで`android`フォルダを開き、`android/app/build.gradle`の`versionCode`が19であることを確認してから、Generate Signed BundleでAABを作成してください。

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

## 注意

この修正を反映したAABをGoogle Playのクローズドテストへアップロードするまで、実機には旧AABの画像が残ります。ブラウザとAndroidの両方で反映するには、Mac側で`pnpm build`と`npx cap sync android`を必ず実行してください。
