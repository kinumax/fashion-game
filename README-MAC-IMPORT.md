# Fashion Runway Worlds Mac Import

このアーカイブは、12ステージ・12曲BGM・プレミアム購入導線・START RUN簡素化・AndroidのFRWアイコン／スプラッシュをMac側へ反映するための差分ファイルです。

## 反映方法

既存プロジェクトを先にバックアップし、このアーカイブをプロジェクトのルートへ展開して、同名ファイルを上書きしてください。`.git`、`node_modules`、`dist`は含めていません。

展開後はプロジェクトのルートで次を実行します。

```bash
pnpm install
pnpm check
pnpm build
npx cap sync android
cd android
./gradlew clean
./gradlew bundleRelease
```

AABは`android/app/build/outputs/bundle/release/app-release.aab`に生成されます。versionCodeはMac側の最新値を確認し、Google Playで使用済みの値より大きい値に設定してください。
