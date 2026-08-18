# NEON BEAT STAR — Implementation Plan

## Goal
Android縦画面で遊べる、オリジナル4レーン・タップ譜面リズムゲームを、ブラウザ上で快適に動かす。

## Risk slices

| Risk | Approach | Verification |
|---|---|---|
| タイミング判定 | `performance.now()`基準の譜面時計と、判定ラインからの距離による判定 | `?demo`で一定譜面を再生し、コンボと判定が更新されることを確認 |
| モバイル入力 | 4つの大きな`pointerdown`パッドとキーボードのD/F/J/Kを同じ入力経路へ統合 | Android幅のスクリーンショットとPCキー入力を確認 |
| 音の初回再生 | 最初のユーザー操作でAudioContextをresumeし、Web Audio APIで短い音を合成 | START操作後にBGMとヒット音が鳴ることを確認 |
| 表示負荷 | Canvas一本で背景・レーン・ノーツ・粒子を描画し、ReactはHUDだけを更新 | TypeScriptチェックとブラウザコンソール確認 |
| 視認性 | 深紺の背景、意味のある4色、固定判定ライン、大きな入力面 | 1280x720と375x812でレーンが読み取れることを確認 |

## Verification criteria

1. タイトル画面からSTARTでプレイ画面へ遷移する。
2. 4レーンのノーツが上から判定ラインへ移動する。
3. タップまたはD/F/J/KでPerfect / Great / Good / Missが表示され、スコアとコンボが更新される。
4. Web Audio APIの生成ビートとヒット音が動作する。
5. EASY / NORMAL / HARDを選択できる。
6. リザルト画面でスコア、最大コンボ、判定内訳を確認できる。
7. `?demo`で自動プレイ状態を表示できる。
8. `pnpm check`と`pnpm build`が成功する。
