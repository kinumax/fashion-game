# NEON BEAT STAR — Structure

`client/src/App.tsx`はルートとテーマの薄い殻だけを持つ。`client/src/pages/Home.tsx`がゲーム画面を保持し、`client/src/components/RhythmGame.tsx`がHUD、入力パッド、Canvasを統合する。譜面時計・判定・音・描画は`client/src/game/`に分け、Reactの状態管理と結合しすぎない。

- `game/chart.ts`: 難易度ごとの譜面生成とノーツ型。
- `game/audio.ts`: Web Audio APIの初期化、ビート、ヒット音。
- `game/rhythmEngine.ts`: ノーツ時計、入力判定、スコア・コンボ・結果。
- `components/RhythmGame.tsx`: Canvas描画、pointer/keyboard入力、画面状態、HUD。
- `index.css`: Starlit Pulseのトークン、モバイル縦画面、アクセシビリティ。
