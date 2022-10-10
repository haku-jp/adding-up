'use strict';
const fs = require('fs');                                       //ファイルを扱うためのFileSystemモジュール呼び出し
const readline = require('readline');                           //ファイルを一行ずつ読み込むためのreadlineモジュール呼び出し
const rs = fs.createReadStream('./popu-pref.csv');              //ファイルの読み込みを行うStreamを生成
const rl = readline.createInterface({ input: rs, output: {}});
const prefectureDataMap = new Map();                            // key:都道府県 value:集計データのオブジェクト
//rl オブジェクトで line というイベントが発生したら この無名関数を呼ぶ
rl.on('line', lineString => {
  const columns = lineString.split(',');
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  if (year === 2010 || year === 2015) {
    let value = null;
    if (prefectureDataMap.has(prefecture)) {
      value = prefectureDataMap.get(prefecture);
    } else {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
//全ての行を読み込み終わったときに'close'イベントが発生
rl.on('close', () => {
  //for of構文 > Map や Array の中身を of の前で与えられた変数に代入することで、for ループと同じ処理をする書き方
  //Map に for-of を使うと、キーと値の 2 つの要素からなる配列が前で与えられた変数へ代入される
  for (const [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  //Array.from(prefectureDataMap) の部分で、連想配列を普通の配列に変換する
  //更に、Array の sort 関数に、比較関数として無名関数（アロー関数）を渡している
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    //pair2 を pair1 より前にしたいときは、正の整数を返す必要があります
    return pair2[1].change - pair1[1].change;
  })
  //map関数は連想配列Mapとは別物。
  //各要素に関数を適用し、新しい配列を作る。
  //Map の キーと値が要素になった配列を要素 [key, value] として受け取り、それを文字列に変換する
  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      `${key}: ${value.popu10}=>${value.popu15} 変化率: ${value.change}`
    );
  })
  console.log(rankingStrings);
});