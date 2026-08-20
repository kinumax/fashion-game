# 公開版ゲーム修正 TODO

- [ ] 明るい背景アセットをローカルとVercelで必ず表示する
- [ ] 1面NY、2面ミラノ、3面パリ、4面東京の背景切替を確認する
- [ ] 1回目のジャンプは通常ジャンプにする
- [ ] 空中で2回目のジャンプ入力を受けた時だけ回転を開始する
- [ ] 3回目以降の入力では回転を増やさない
- [ ] 連続した安全床と正しい足元当たり判定に修正する
- [ ] 落下ペナルティを軽くし、簡単にクリアできる距離へ調整する
- [ ] 敵を開始直後から見える位置に配置する
- [ ] バッグを開始直後から取得・投擲できる状態にする
- [ ] バッグが敵へ当たった時に敵が消えることを確認する
- [ ] ローカルで確認後、正しいGitHub mainへ反映する
- [ ] Vercelで最新コミットのデプロイを確認する
- [ ] Mac側へビジュアル改修パッチを適用する
- [ ] Mac側で型チェックと本番ビルドを確認する
- [ ] ビジュアル改修をGitHub mainへcommit・pushする
- [ ] ジャンプ・飛行で画面上方向へ進む縦スクロール区間を追加する
- [ ] クリア後に巻き戻さず別ステージへ遷移する
- [ ] ステージごとの背景・ギミック・演出を追加する
- [ ] 着地エフェクト、攻撃軌跡、カメラ演出を追加する
- [ ] 縦スクロールと新ステージ遷移を型チェック・ビルド確認する
- [ ] ステージごとに敵のHP・速度・攻撃頻度・出現密度を強化する
- [ ] ステージごとにプレイヤーと敵の体格・サイズ演出を変化させる
- [ ] 着地衝撃・攻撃残像・ボス撃破演出を追加する
- [ ] 5種類のオリジナルBGMを生成する
- [ ] ステージ／都市変更時にBGMをクロスフェード切り替えする
- [ ] 敵強化・体格変化・BGM切り替えを型チェックとビルドで確認する
- [ ] ステージ数を8ステージ以上へ拡張する
- [ ] ステージ固有のギミックとボスを追加する
- [ ] パワーアップを選択・強化できるカスタム構成にする
- [ ] ボスに複数フェーズ、移動、召喚、弱点演出を追加する
- [ ] 仲間救出を鍵・スイッチ・護衛などのミッション型へ変更する
- [ ] 拡張後の型チェック・ビルド・プレイ確認を行う
- [ ] クリア後に先頭へ戻るループ原因を修正する
- [ ] 面ごとのゲームモード状態を追加する
- [ ] 2面をジャンプ中心の縦スクロールにする
- [ ] 3面を地下へ潜る下降ステージにする
- [ ] 4面を飛行シューティングにする
- [ ] 面ごとのBGM切り替えを確実にする
- [ ] 面構成変更後の型チェック・ビルド・実プレイ確認を行う
- [ ] Mac側のローカルHEADとorigin/mainを比較する
- [ ] WAVファイルが重複履歴として増えていないか確認する
- [ ] HTTP/1.1とpostBuffer設定後のpush結果を確認する
- [ ] Git LFSまたは外部アセット運用を決定する
- [ ] 1本コース再利用の生成処理を分離する
- [ ] 都市・面ごとの独立ステージデータ定義を作る
- [ ] ステージごとにplatforms/enemies/coins/itemsを再生成する
- [ ] restartを次ステージのロード処理へ置き換える
- [ ] 都市別レイアウト・ギミック・ボス配置を差別化する
- [ ] 最終面だけ完了画面へ到達することを確認する
- [ ] 独立ステージ方式の型チェック・ビルドを行う
- [ ] 添付files.zipの参考構成を確認する
- [ ] クリア時に次ステージのレイアウトをロードする
- [ ] 同一画面の再表示・巻き戻しを廃止する
- [ ] ステージ切り替えとBGM切り替えを連動させる
- [ ] 参考構成反映後の型チェック・ビルドを行う
- [ ] 巻き戻し型のrestart進行を廃止する
- [ ] ステージ入口・出口・ワープ遷移を実装する
- [ ] コイン収集専用ボーナス面を追加する
- [ ] ボス面の端・足場・背景を段階的に崩壊させる
- [ ] 仲間救出のカット演出と帰還演出を追加する
- [ ] キャラクターをセルルック調の輪郭・影・ハイライトへ強化する
- [ ] 本格化後の画面遷移・型チェック・ビルドを確認する
- [ ] 四角い敵の表示原因を特定する
- [ ] 動物の頭・胴体・翼・足を親ノードへ正しく統合する
- [ ] 敵のセルルック輪郭を維持する
- [ ] 全ステージで敵形状をビルド確認する
- [ ] 自動で次の面へ進む遷移を復旧する
- [ ] 2面を縦スクロールステージにする
- [ ] 3面を地下下降ステージにする
- [ ] 4面を車レースステージにする
- [ ] 5面を戦闘機でドローンと戦うステージにする
- [ ] 変更後の型チェック・ビルド・遷移を検証する
- [ ] GitHub mainへpushする
- [ ] 2面と車レース面の番号対応を確認する
- [ ] 車体表示条件を面遷移後にも再適用する
- [ ] 車体をプレイヤーの正しい位置・高さへ配置する
- [ ] 車レース面のHUDと自動遷移を確認する
- [ ] AndroidプロジェクトのversionCodeとversionNameを確認する
- [ ] 最新WebビルドをCapacitor Androidへ同期する
- [ ] release署名設定を確認する
- [ ] app-release.aabを生成する
- [ ] AABのversionCodeとファイル整合性を確認する
- [ ] Android applicationIdをcom.farwへ変更する
- [ ] Android namespaceをcom.farwへ変更する
- [ ] ManifestとCapacitor設定の識別子を確認する
- [ ] com.farwでAABを再生成する
- [ ] ウェブアンカーと糸の描画を追加する
- [ ] 糸を使った振り子スイングを追加する
- [ ] 壁面走行と壁ジャンプを追加する
- [ ] 主人公の慣性・補間・着地アニメーションを改善する
- [ ] セル／ピクセル調の高密度キャラクター表現を改善する
- [ ] ウェブ移動機能の型チェック・ビルド・操作確認を行う
- [ ] State：移動・スコア・ゲームオーバー・面遷移の受け入れ条件を定義する
- [ ] Action：機能実装と修正をState単位で行う
- [ ] Verify：ヘッドレスブラウザで起動・操作・遷移を検証する
- [ ] Verify：コンソールエラーとネットワークエラーを確認する
- [ ] Verify：スクリーンショットでプレイヤー・敵・UIを確認する
- [ ] 不具合発見時に修正して再検証する
- [ ] ウェブアンカーをステージ内に生成する
- [ ] ウェブラインの描画・接続・切断を実装する
- [ ] 振り子の張力と加速を実装する
- [ ] 切断後の飛距離と壁面着地を実装する
- [ ] 主人公の速度補間・空中姿勢・着地ブレンドを実装する
- [ ] ウェブ移動をState・Action・Verifyで検証する
- [ ] versionCodeを7へ更新する
- [ ] versionNameを1.5.1へ更新する
- [ ] ターミナルからrelease AABを再生成する
- [ ] Gradle実行時にコメント記号を混入させない
- [ ] `bundleRelease`を単独タスクとして実行する
- [ ] 生成AABのパス・package名・versionCodeを確認する
- [ ] Mac側のgit statusとremoteを確認する
- [ ] AAB・バックアップ・重複WAVをcommit対象から除外する
- [ ] 最新コードとAndroid設定をcommitする
- [ ] origin/mainへpushして到達を確認する


## Android実機起動クラッシュ調査

- [ ] 実機の Logcat で FATAL EXCEPTION / AndroidRuntime の原因を取得する
- [ ] Capacitor の assets/public と dist/public の同期状態を確認する
- [ ] capacitor.config と Android applicationId/versionCode を確認する
- [ ] WebView起動時のJavaScript例外とローカルアセット404を確認する
- [ ] 修正後に `pnpm check`、`pnpm build`、`npx cap sync android`、Gradle release build を再実行する
- [ ] 実機でアンインストール後に再インストールし、起動・START RUN・画面遷移を確認する


## Google Play版の実機クラッシュ再調査

- [ ] Android実機から `adb logcat` またはAndroid Studio Logcatのクラッシュ部分を取得する
- [ ] `FATAL EXCEPTION`、`AndroidRuntime`、`chromium`、`Capacitor`、`ClassNotFoundException` の有無を確認する
- [ ] Google Play版とローカルdebug/release APKのビルド差異を比較する
- [ ] WebView初期化前後のJavaScript例外とassets/public/index.htmlの同梱を確認する
- [ ] 原因修正後にversionCodeを8以上へ更新してAABを再生成する
- [ ] 実機で旧版を削除して修正版をインストールし、起動からSTART RUNまで確認する


## Android縦画面の起動画面UI修正

- [ ] デフォルトフッターを非表示にする
- [ ] 長い操作説明がSTART RUNを画面外へ押し出さないようにする
- [ ] START RUNを上部の固定・常時表示位置へ移動する
- [ ] Androidのsafe-areaとナビゲーションバーを考慮する
- [ ] 縦画面でSTART RUNをタップできることを確認する
- [ ] 修正後にWebビルド・Capacitor同期・AABビルドを確認する


## versionCode 10とアップデート導線

- [ ] Android versionCodeを9から10へ更新する
- [ ] applicationId com.farwを維持する
- [ ] Google Playのアップデート導線を確認する
- [ ] AABをversionCode 10で生成する
- [ ] Play ConsoleへversionCode 10を提出する
- [ ] 公開後に既存ユーザーから更新ボタンで更新できることを確認する


## ブラウザ起動画面のSTART RUN再検証

- [ ] ブラウザのデスクトップ幅でSTART RUNの表示位置を確認する
- [ ] ブラウザのAndroid縦画面相当でSTART RUNの表示位置を確認する
- [ ] START RUNが常にクリック可能なことを確認する
- [ ] 必要なら起動画面の高さ・overflow・固定位置を再調整する
- [ ] 修正後のブラウザ表示をユーザーへ報告する


## versionCode 11リリース

- [ ] 現在のversionCode 10を確認する
- [ ] versionCodeを11へ更新する
- [ ] applicationId com.farwを維持する
- [ ] versionCode 11のAABを生成する
- [ ] Google PlayへversionCode 11を提出する


## ブラウザ起動画面確認

- [ ] ブラウザ検証用サーバーを起動する
- [ ] デスクトップ幅でSTART RUNを確認する
- [ ] Android縦画面相当でSTART RUNを確認する
- [ ] 起動画面の操作可能性を確認する


## Macブラウザ接続復旧

- [ ] 3001番ポートの開発サーバー状態を確認する
- [ ] Macから到達可能なURLでサーバーを起動する
- [ ] Braveで起動画面を再表示する
- [ ] START RUNを再確認する


## Google Play収益化設計

- [ ] 収益化方式を確定する（広告、買い切り、消耗型、プレミアム）
- [ ] 商品IDとゲーム内特典を設計する
- [ ] Play Consoleで1回限りの商品と購入オプションを作成する
- [ ] 購入、復元、キャンセル、通信失敗の処理を実装する
- [ ] 内部テスト用アカウントで購入フローを検証する
- [ ] 価格と販売地域を確認して公開する


## プレミアム買い切り実装

- [ ] 商品ID `frw_premium_unlock` を共通定数として定義する
- [ ] Premium Pass購入画面と購入ボタンを追加する
- [ ] 未購入時の無料範囲と購入後の全ステージ解放を定義する
- [ ] Google Play Billingの購入状態・購入復元・キャンセル・失敗処理を接続する
- [ ] Play Console内部テスト用の商品設定手順を作成する
- [ ] 課金状態を偽装せず、安全なフォールバックで検証する


## versionCode 12リリース

- [ ] Androidの現在値11を確認する
- [ ] versionCodeを12へ更新する
- [ ] applicationId com.farwを維持する
- [ ] versionCode 12のAABを生成する
- [ ] 現在のローカルversionCode 12を確認する
- [ ] versionCodeを13へ変更する
- [ ] `npx cap sync android`でWebアセットを同期する
- [ ] `./gradlew bundleRelease`でversionCode 13のAABを生成する
- [ ] AABの出力パスとversionCodeを確認する
- [ ] Google Playで使用済みのversionCode 13を避ける
- [ ] versionCodeを14へ更新する
- [ ] versionCode 14のAABを再生成する
- [ ] Google PlayへversionCode 12を提出する


## 12ステージ・12曲BGM拡張

- [ ] 現行のcollection/stage進行とBGM配列を確認する
- [ ] クリア対象を12ステージへ拡張する
- [ ] 各ステージを4区画としてHUDと進行へ反映する
- [ ] 12ステージ固有のBGMを用意する
- [ ] ステージBGMを各ステージへ割り当てる
- [ ] タイトル画面ではBGMをシャッフルキューで再生する
- [ ] 同じ曲をキュー内で重複させず、全曲再生後に再シャッフルする
- [ ] 型チェック、ブラウザ確認、Android同期を実行する


## アイコン・スプラッシュ・12ステージ固有化

- [ ] アプリアイコンを作成しAndroidへ組み込む
- [ ] スプラッシュ画面を作成しAndroidへ組み込む
- [ ] メインキャラクターの棒状表示を修正する
- [ ] モバイルHUDの重なりを修正する
- [ ] 12ステージそれぞれに固有の地形を割り当てる
- [ ] 12ステージそれぞれに固有のボスを割り当てる
- [ ] 12ステージそれぞれに固有のギミックを割り当てる
- [ ] ブラウザとAndroidビルドを検証する


## Mac移行用アーカイブ

- [ ] 変更済みTypeScript・CSS・HTMLをまとめる
- [ ] 12曲のBGMをまとめる
- [ ] Androidアイコン・スプラッシュ素材をまとめる
- [ ] package.jsonとロックファイルを含める
- [ ] node_modules、dist、.git、バックアップファイルは除外する
- [ ] アーカイブ内容と展開後のビルド手順を確認する


## versionCode 13 release resource修正

- [ ] splash_frw.xmlのdrawable属性へ直接指定されたカラーを修正する
- [ ] Android resource linkingを再実行する
- [ ] versionCode 13を確認する
- [ ] bundleReleaseでAABを再生成する


## BGM即時切替と添付キャラクター復帰

- [ ] BGMの現在曲・キュー・ステージ変更検知を確認する
- [ ] ステージクリア確定時に次曲へ即時切替する
- [ ] 同じ曲の連続再生を防ぐ
- [ ] タイトル画面の全曲シャッフルキューを確認する
- [ ] 添付キャラクター素材の透明化・切り抜き状態を確認する
- [ ] 添付キャラクターを主役表示経路へ接続する
- [ ] ユーザー指定スクリーンショットのキャラクターを基準に透明PNGを作り直す
- [ ] 参照キャラクターの顔・髪型・服装・走行ポーズを確認する
- [ ] 新キャラクターをゲームの主役表示へ差し替える
- [ ] 差し替え後のブラウザ表示と透明背景を検証する
- [ ] 現在の主役画像と走行・ジャンプ・攻撃・飛行状態の接続点を確認する
- [ ] 参照キャラクターのidle/run/jump/attack/fly/landポーズを用意する
- [ ] ゲーム状態ごとにポーズ画像を切り替える
- [ ] ポーズ切替のタイミングとちらつきをブラウザで検証する
- [ ] Android assets/publicに新しいscene.jsとheroポーズ画像が入ることを確認する
- [ ] 古いインストール版を削除して新AABを入れ直す
- [ ] Android実機で参照キャラクターとポーズ切替を確認する
- [ ] Android assets/publicにhero-idle/run/jump/attack/flyが存在することを確認する
- [ ] Android bundle内のsceneコードが新しいhero画像パスを参照することを確認する
- [ ] Mac側の`client/public/assets`にhero-*.pngが存在することを確認する
- [ ] `capacitor.config.ts`のwebDirがビルド出力先と一致するか確認する
- [ ] 必要ならhero PNGを正しいpublic/assetsへ配置して再同期する
- [ ] Mac側へhero-idle/run/jump/attack/fly.pngを転送する
- [ ] `client/public/assets`と`dist/public/assets`で5枚を確認する
- [ ] `npx cap sync android`後にAndroid assetsへ5枚が入ることを確認する
- [ ] 古いアプリを削除してversionCode 15を再インストールする
- [ ] 実機で棒人間が消え、参照キャラクターが表示されることを確認する
- [ ] versionCode 18のAAB内にhero-idle/run/jump/attack/flyが存在するか確認する
- [ ] Android WebViewの実行時URLとhero画像参照パスを確認する
- [ ] 画像読み込み失敗時に棒人間へフォールバックする箇所を修正する
- [ ] AAB内のhero画像5枚同梱済みを記録する
- [ ] sceneのhero texture URL生成処理を確認する
- [ ] Android WebViewで画像ロード失敗が発生していないかLogcatで確認する
- [ ] 必要なら`Capacitor.convertFileSrc`または相対asset URLへ修正する
- [ ] versionCode 19で再ビルドし、closed testへ更新する
- [ ] Mac側scene.tsへheroPoseTexturesと状態別切替コードを取り込む
- [ ] 取り込み後のsource grepでhero-idleとheroPoseTexturesを確認する
- [ ] transferred sceneを含むWeb buildを作成する
- [ ] versionCode 19 AABへheroコードと5枚のPNGを同梱する
- [ ] Android assetsのhero-*.pngを5枚すべて確認する
- [ ] versionCode 19 AAB内のhero-idle参照JavaScriptを確認する
- [ ] closed testへversionCode 19をアップロードする
- [ ] AAB生成はAndroid Studioで行う
- [ ] Android Studioを開く前に`pnpm build`と`npx cap sync android`を完了する
- [ ] Android StudioのGenerate Signed BundleでAABを作成する
- [ ] 生成したAABのversionCodeとhero同梱状態を確認する
- [ ] Mac側source grepでhero-idleとheroPoseTexturesを確認する
- [ ] 新sceneコードを含むdistとAABを再生成する
- [x] Stage 01を横スクロールの走行・ジャンプ・敵回避・コイン・ゴールに整理する
- [x] Stage 02を初級向けの別横スクロール地形として設計する
- [x] Stage 01/02にチェックポイントとゴール判定を追加する
- [x] マリオ風の加速・減速・ジャンプの操作感を調整する
- [x] ステージ開始の操作説明オーバーレイを追加する
- [x] HUDをスコア・残機・進行度中心に縮小する
- [x] ステージクリア結果画面と次ステージ遷移を追加する
- [x] 縦スクロール・地下・レース・飛行を通常ステージから分離する
- [ ] hero-jump/attack/flyの青い背景矩形を透過除去する
- [ ] hero-run-1とhero-run-2の2フレームを用意する
- [ ] 走行中にrun-1/run-2を交互切替する
- [ ] Android Studio用同期後の5ポーズ＋2走行フレームを確認する
- [ ] closed testへ新versionCodeで更新する
- [ ] Vercelデプロイのsource commitを確認する
- [ ] Vercel用ビルドにhero-*.pngと新sceneコードが含まれることを確認する
- [ ] 正しいfashion-game mainへpushしてVercelの自動デプロイを発火する
- [ ] 新デプロイで参照キャラクターを表示確認する
- [ ] Vercel接続先が`kinumax/fashion-game`のmainであることを確認する
- [ ] hero-*.pngと新sceneコードを正しいmainへ反映する
- [ ] Vercelの新デプロイがReadyになることを確認する
- [ ] 強制再読み込み後に参照キャラクターを確認する
- [ ] beatリポジトリのremote先行コミットを取得する
- [ ] ローカルmainとbeat/mainを安全に統合する
- [ ] コンフリクトを解消してbeat/mainへpushする
- [ ] Mac側で `git pull --no-rebase origin main` を実行する
- [ ] 関連のない履歴を `--allow-unrelated-histories` 付きで統合する
- [ ] `git pull origin main --allow-unrelated-histories` の実行結果を確認する
- [ ] `git pull --no-rebase origin main --allow-unrelated-histories`でmerge方式を明示する
- [ ] merge完了後にpushする
- [ ] pull完了後にのみ `git push -u origin main` を実行する
- [ ] 統合時のREADMEや設定ファイルのコンフリクトを確認する
- [ ] package.jsonの競合を解消する
- [ ] pnpm-lock.yamlの競合を解消する
- [ ] template.jsonの競合を解消する
- [ ] todo.mdの競合を解消する
- [ ] vercel.jsonの競合を解消する
- [ ] ASSETS.md、PLAN.md、STRUCTURE.mdの競合を解消する
- [ ] 誤ったbeatリポジトリのマージを中止する
- [ ] merge commit `9d0cb8d`を`git revert -m 1`で取り消す
- [ ] revert後にbeat由来ファイルの残存と競合を確認する
- [ ] 正しいfashion-game.gitへpushする
- [ ] 84MB pushが完了したか、または停止したか確認する
- [ ] 必要ならHTTP/1.1とpostBufferを設定して再送する
- [ ] ローカルHEADとorigin/mainのハッシュ差を確認する
- [ ] HTTP/1.1・postBuffer・compression設定でpushを再送する
- [ ] 再送後にorigin/mainのハッシュを再確認する
- [ ] HTTP 408後にorigin/mainが更新されたか確認する
- [ ] 大容量WAVをGit LFSまたは別配布へ切り替えるか判断する
- [ ] WAVや大容量画像の重複履歴を確認する
- [ ] GitHubへ送信するWAVの総容量を確認する
- [ ] WAVをGit LFSまたはリポジトリ外配布へ切り替える
- [ ] Mac側でGit LFSが初期化済みであることを確認する
- [ ] 履歴書き換え前にローカルバックアップを作成する
- [ ] 未公開コミットをorigin/main上の単一コミットへ整理する
- [ ] `backup-before-lfs`ブランチが存在することを確認する
- [ ] `git reset --soft origin/main`で未公開変更を保持したまま基準を戻す
- [ ] 全変更を再ステージしてLFSポインタを確認する
- [ ] 新しい単一コミットを作成する
- [ ] WAVをGit LFS追跡に切り替えてpushする
- [ ] 音源整理後にローカルとorigin/mainのハッシュを再確認する
- [ ] origin/mainの先行コミットをfetchする
- [ ] LFS版ローカルコミットとremoteをmergeする
- [ ] merge後のLFSポインタと作業ツリーを確認する
- [ ] forceを使わずにpushしてハッシュ一致を確認する
- [ ] LFS送信済みの状態でorigin/mainをmergeする
- [ ] merge後に通常pushする
- [ ] push前に`git status`と`git branch -vv`で現在状態を確認する
- [ ] `git fetch origin`後に`git merge origin/main --no-commit`を実行する
- [ ] Macで非対応だった`--no-rebase`を使わない
- [ ] 次に実行するコマンドを`git merge origin/main --no-commit`の1行に限定する
- [ ] ローカル5コミットとremote30コミットをmergeする
- [ ] merge結果のコンフリクト一覧を確認する
- [ ] `android`、`capacitor.config.ts`、`client/src`、`package.json`の競合はローカルゲーム側を採用する
- [ ] BGMのboth-added競合をLFS追跡状態で解決する
- [ ] `git add`で全競合を解消してmerge commitを作る
- [ ] push前に`git status`でMERGE_HEADと未解決ファイルを確認する
- [ ] 未完了mergeを完了またはabortしてからpushする
- [ ] 解消後に一度だけpushする
- [ ] merge成功後に1回だけpushする
- [ ] ローカルとリモートのHEADハッシュ一致を確認する
- [ ] Fashion Runway Worldsの正しいremoteへ戻す
- [ ] マージ中でないことと作業ツリーを確認する
- [ ] client/index.htmlとclient/srcのゲーム側ファイルを優先して解消する
- [ ] ideas.mdを解消してマージコミットを作る
- [ ] pull後の結果を確認して必要ならコンフリクトを解消する
- [ ] 統合後に `git push -u origin main` を再実行する
- [ ] ブラウザで曲切替と主人公表示を検証する
- [ ] 現在のブラウザ版で参照キャラクターの表示を確認する
- [ ] 現在の表示確認済みコードをfashion-game.gitへpushする
- [ ] push前に`git status`と`git log --merge`でmerge状態を確認する
- [ ] `git fetch origin`後に`git merge origin/main --no-commit`を完了させる
- [ ] merge完了後にLFSとGitをpushする
- [ ] Android versionCodeを15へ変更する
- [ ] `pnpm build`と`npx cap sync android`を実行する
- [ ] versionCode 15のrelease AABを生成する
- [ ] Google Playで使用済みのversionCode 15を避ける
- [ ] versionCodeを16へ更新する
- [ ] hero画像5枚をAndroid assetsへ同梱する
- [ ] versionCode 16のAABを生成して実機へ入れ直す
- [ ] Google Playで使用済みのversionCode 16を避ける
- [ ] versionCodeを17へ更新する
- [ ] `npx cap sync android`後にhero-*.png 5枚を確認する
- [ ] versionCode 17のAABを生成する
- [ ] `android/app/build.gradle`がversionCode 17になっているか確認する
- [ ] 古いapp-release.aabを削除または上書きする
- [ ] bundleRelease後のAABをversionCode 17として確認する
- [ ] versionCode 17の新しいAABだけをアップロードする
- [ ] Google Playで使用済みのversionCode 17を避ける
- [ ] versionCodeを18へ更新する
- [ ] 古いAABを削除してversionCode 18を再生成する
- [ ] 生成直後のAABのファイル日時とversionCodeを確認する
- [ ] 待機・走行・ジャンプ・攻撃・飛行のポーズ切替を確認する
- [ ] 緑色・チェッカー背景・旧柱状メッシュがないことを確認する
- [ ] HUDを上部のコンパクトな帯へ整理する
- [ ] 中央プレイスペースの重なりをなくして可動範囲を広げる
- [ ] モバイル操作ボタンを下部に固定しゲーム画面を圧迫しないようにする
- [ ] デスクトップとモバイルの両方でレイアウトを検証する
- [ ] Mac側で `pnpm dev` を起動し、更新後のキャラクター表示とBGM切替をブラウザで確認する
- [ ] Mac側で必要なら `npx cap add android` と `npx cap sync android` を実行し、Android platform未生成エラーを解消する
