const fs = require('fs');
const util = require('util');
const client = require('cheerio-httpcli');
const json2csv = require('json2csv');
const dateUtils = require('date-utils');

/**
 * NPBの公式HPから公式戦の情報を取得する
 * @return array gameData 試合情報
 */
const getGameData = () => {
    var gameData = [];
    const startMonth = 3;
    const endMonth = 12;
    const baseUrl = "http://npb.jp/games/2017/";
    for(month=startMonth;month<endMonth;month++) {
        var accessUrl = baseUrl + "schedule_" + ("0"+month).slice(-2) + "_detail.html";
        var fetchResult = accessNPBWebPage(accessUrl);
        if(fetchResult){
            fetchResult.$('.table_normal.summary_table > table > tbody > tr').each(function (idx) {
                //試合日の取得
                var dateThTag = fetchResult.$(this).children('th');
                if(dateThTag.get(0)){
                    date = dateThTag.text();
                }
                gameData.push(getGameDetail(fetchResult.$(this), date));
            });
        }
    }
    return gameData;
}

/**
 * NPB公式HPへアクセス
 */
const accessNPBWebPage = (accessUrl) => {
    console.log("access to " + accessUrl);
    var fetchResult = client.fetchSync(accessUrl);
    if(!fetchResult.error){
        return fetchResult;
    }else{
        console.log("access error. => url: "+ accessUrl);
        console.log(fetchResult.error);
        return false;
    }
}

/**
 * 各試合の詳細情報を取得する
 * @return array gameData
 */
const getGameDetail = (tableObj, date) => {
    var gameData = {
        "date": date,
        "team1": tableObj.find('div.team1').text().replace(/\s+/g, ""),
        "team2": tableObj.find('div.team2').text().replace(/\s+/g, ""),
        "score1": tableObj.find('div.score1').text().replace(/\s+/g, ""),
        "score2": tableObj.find('div.score2').text().replace(/\s+/g, ""),
        "place": tableObj.find('div.place').text().replace(/\s+/g, ""),
        "time": tableObj.find('div.time').text().replace(/\s+/g, ""),
        "weather": tableObj.find('div.weather').text().replace(/\s+/g, ""),
        "comment": tableObj.find('div.comment').text().replace(/\s+/g, ""),
        "pit1": tableObj.find('div.pit').first().text().replace(/\s+/g, ""),
        "pit2": tableObj.find('div.pit').last().text().replace(/\s+/g, "")
    }
    return gameData;
}

const main = () => {
    const dt = new Date();
    const file_name = dt.toFormat("YYYY_MM_DD_HH24MISS") + '_gameData.csv';
    const filePath = './get-data/' + file_name;
    const fields = [
        "date","team1","team2","score1","score2","place","time","weather","comment","pit1","pit2"
    ];
    const gameData = getGameData();
    try {
        var csvData = json2csv({ data: gameData, fields: fields });
        fs.writeFile(filePath, csvData, function(err) {
            if(err){
                console.log(err);
            }else{
                console.log("wrote to " + filePath);
            }
        });
    } catch (err) {
        console.error(err);
    }
}

main();