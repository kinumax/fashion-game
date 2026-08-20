# Fashion Runway Worlds — Beginner Stages Update

最初の2ステージを、通常の横スクロールアクションとして整理しました。

## 実装内容

- Stage 01: NEON RUNWAY。走る、ジャンプする、敵を避ける、コインを集める、チェックポイントを越えてゴールする構成。
- Stage 02: MILANO STEP RUN。Stage 01とは異なる短い段差と敵配置を持つ横スクロール構成。
- Stage 01/02では二段ジャンプを無効化し、まず地上ジャンプを覚える設計。
- 左右入力は初心者ステージだけ加速・減速型に変更。前方向へ強制的に走り続けない。
- ジャンプは短押しで低く、長押しで高くなる可変ジャンプ。
- ステージ開始時に操作説明を表示。
- 初心者ステージのHUDをLIVES、COMBO、COINS、CHECKPOINT中心に縮小。
- クリア後は自動遷移せず、結果画面のNEXT SECTION/NEXT STAGEを押して進む方式。
- Stage 03以降の縦スクロール、地下、レース、飛行・ドッグファイトのモードは残しています。

## Mac側への反映

```bash
cd ~/Downloads/'fashion-runway-worlds 2'
unzip -o ~/Downloads/FRW_BEGINNER_STAGES_FIX.zip
pnpm check
pnpm build
npx cap sync android
```

Web確認後、Android Studioで`versionCode 19`を確認してAABを再生成してください。

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

## 操作の考え方

Babylon.js側では、初心者ステージだけ次の値にしています。

| 操作要素 | 実装方針 |
|---|---|
| 左右 | 入力時に加速し、入力を止めると減速 |
| 最高速度 | 通常時10.5、スピードブースト時13.5 |
| ジャンプ | 地上ジャンプのみ。二段ジャンプはStage 03以降 |
| ジャンプ高さ | JUMP長押し中、上昇中の重力を軽減 |
| 着地猶予 | 既存のcoyote time 0.11秒を維持 |
| 入力先行 | 既存のjump buffer 0.12秒を維持 |
