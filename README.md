# npb_game_schedule_to_csv
プロ野球の公式戦の試合日程をCSVファイルに吐き出す。
アクセスするのは（http://npb.jp/games/2017/schedule_03_detail.html）


### インストール
`npm install `

### 使い方
ターミナルから以下のコマンドを実行
`node get_game_schedule.js`

./get-dataディレクトリ配下に以下の形式のCSVが作成される。
`YYYY_MM_DD_HHIISS_gameData.csv`