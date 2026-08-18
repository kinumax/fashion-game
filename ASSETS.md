# Assets

**Art direction:** Continental Editorial。NY・パリ・ミラノの都市レイヤー、木彫りの面構成、紙とインクの質感、Cork Chartreuse #C8D36B、深紅、コバルト、アイボリー。更新版ではクラシックな2Dプラットフォーマーとして、足場・敵・コイン・旗・ゴールを明快なシルエットで配置する。

## Backgrounds

| Name | Description | Size | URL |
|---|---|---|---|
| Visual target | 初回ゲーム画面の基準 | 1920x1080 fullscreen | `/manus-storage/visual-target_f5e53779.png` |
| Platformer anchor | 足場・敵・コイン・ゴールを含む新しいゲーム画面の基準 | 1920x1080 fullscreen | `/manus-storage/platformer-anchor_ac920c63.png` |
| City backgrounds | NY・パリ・ミラノの3層都市背景 | 2560x720, horizontal scroll | `/manus-storage/city-backgrounds_49cb0e3b.png` |

## Sprites and Kits

| Name | Description | Size | URL |
|---|---|---|---|
| Fashion model actions | サングラスのスレンダーなモデル。走行、ジャンプ、着地、ダメージ、ゴールの6ポーズ | 160x240 px per frame | `/manus-storage/runway-model-actions_85cdb521.png` |
| Enemy kit | 広告ドローン、石像ランナー、タクシー型障害物 | 96-160 px | `/manus-storage/runway-enemies_a3da46e6.png` |
| Platform kit | 石畳、移動床、箱、ポスター壁、斜面、旗、ゴールゲート | 128-420 px | `/manus-storage/runway-platform-kit_8b480a56.png` |
| Pickup kit | 年輪コイン、コンボバッジ、旗、紙吹雪、年輪パーティクル | 64-128 px | `/manus-storage/runway-pickups_f693297a.png` |
| Collectibles and UI | 初回の年輪コレクタブルとUIアセット | 64-128 px | `/manus-storage/collectibles-ui_492a2755.png` |
| Obstacles | 初回の都市障害物 | 96-180 px | `/manus-storage/obstacles_e3f0e6b1.png` |

## Procedural meshes

主人公の長い脚、サングラス、幾何学ヘア、テーラード衣装はBabylon.jsの平面・箱・低ポリゴン球を組み合わせた彫刻的メッシュとして描画する。足場、敵、チェックポイント、ゴールゲートも生成色面とファセット面を併用し、生成アセットの背景と同じ視認性を保つ。
