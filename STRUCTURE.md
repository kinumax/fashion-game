# Structure

## React layer

`client/src/App.tsx` はフルスクリーンの `GameCanvas` のみを表示する。Reactはゲームのフレームとして機能し、HUDの固定表示やスタート／リスタートUIだけを受け持つ。

## Game layer

`client/src/game/scene.ts` はBabylon.jsのシーンとゲームハンドルを生成する。ゲームロジックはReactから分離し、`GameWorld`、`Player`、`ObstacleManager`、`CollectibleManager`、`CityTheme` をプレーンなTypeScriptクラスまたは関数として配置する。

## Rendering

Babylon.jsのOrthographicCameraで2Dに近い横スクロール表現を作り、背景とゲームオブジェクトを平面メッシュに描画する。生成アセットはWebDevのmanus-storage URLをテクスチャとして利用する。

## Input

ポインター入力をcanvasに登録し、タップでジャンプ、左右スワイプでレーン変更、下部の画面ボタンでも同じ操作を提供する。キーボードのSpaceとArrowLeft／ArrowRightも用意する。
