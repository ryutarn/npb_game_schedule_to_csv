const fs = require('fs');
const util = require('util');
const client = require('cheerio-httpcli');
const json2csv = require('json2csv');
const dateUtils = require('date-utils');

/**
 * write data to the specified file path
 * @param string filePath
 * @param mix data
 * @param bool isAppend (true:file append / false:file overwrite)
 */
const writeData = function(filePath, data, isAppend) {
    if(isAppend) {
        fs.appendFile(filePath, util.inspect(data) , function(err) {
            if(err){
                console.log(err);
                return false;
            }
        });
    }else{
        fs.writeFile(filePath, util.inspect(data) , function(err) {
            if(err){
                console.log(err);
                return false;
            }
        });
    }
    return true;
}

const getGameData = function (tableObj, date){
    let gameData = {
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

// Access NPB schedule page
var dt = new Date();
var file_name = dt.toFormat("YYYY_MM_DD_HH24MISS") + '_gameData.csv';
const filePath = './get-data/' + file_name;
const fields = [
    "date","team1","team2","score1","score2","place","time","weather","comment","pit1","pit2"
];
var gameData = [];
var date = "";
var baseUrl = "http://npb.jp/games/2017/";
for(month=3;month<12;month++) {
    var accessUrl = baseUrl + "schedule_" + ("0"+month).slice(-2) + "_detail.html";
    console.log("access to " + accessUrl);
    var fetchResult = client.fetchSync(accessUrl);
    if(!fetchResult.error){
        fetchResult.$('.table_normal.summary_table > table > tbody > tr').each(function (idx) {
            var dateThTag = fetchResult.$(this).children('th');
            if(dateThTag.get(0)){
                date = dateThTag.text();
            }
            gameData.push(getGameData(fetchResult.$(this), date));
        });
    }else{
        console.log("access error. => url: "+ accessUrl);
        console.log(fetchResult.error);
    }
}

try {
    var csvData = json2csv({ data: gameData, fields: fields });

    fs.writeFile(filePath, csvData, function(err) {
        if(err){
            console.log(err);
        }else{
            console.log("wrote to " + file_name);
        }
    });
} catch (err) {
    console.error(err);
}