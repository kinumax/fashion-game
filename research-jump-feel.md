# ジャンプ操作リサーチメモ

## 調査日
2026-08-14

## 参照した知見

Game Developerの記事「Platformer controls: how to avoid limpness and rigidity feelings」では、空中制御は現実的でなくてもプラットフォーマーの操作性には必要であり、空中加速度が低すぎると軌道修正できず重く感じ、高すぎると操作が測りにくくなるため、重力と空中加速度を組み合わせて調整するべきだと説明されている。

Digraの研究論文「You Say Jump, I Say How High? Operationalising the Aesthetics of Jumping in 2D Platform Games」は、2Dプラットフォーマーのジャンプを高さ、軌道、入力、重力などの測定可能な特徴として扱う研究であり、ジャンプの印象を感覚だけでなくパラメータとして調整する根拠にする。

## 実装方針

今回のゲームでは、初回ジャンプを少し速く立ち上げ、頂点付近で短く滞空し、下降をやや強くして着地位置を読みやすくする。空中左右制御は地上より弱くしつつ、プレイヤーが足場へ戻せる程度にする。ジャンプ入力は押下ごとに一回だけ受け付け、二段目は別入力にする。着地時は回転を即座に0へ戻し、短い着地フラッシュと走行復帰を入れる。

再スタートでは、running=false、spin=0、rotation.z=0、vx=0、vy=0、jumps=0を設定し、STARTまたは最初の移動入力があるまで回転と自動走行を開始しない。キャラクター表示倍率は現状の0.6倍にする。

## 参照URL

- https://www.gamedeveloper.com/design/platformer-controls-how-to-avoid-limpness-and-rigidity-feelings
- https://dl.digra.org/index.php/dl/article/download/771/771/768
