const axios = require("axios");
const cheerio = require("cheerio");

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
var pathurl = "";
var numColors = "";
var numPag = '1';

function HEXtoRGB(hex) {
    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[\da-z]{0,0}$/i.exec(hex);
    var red = parseInt(result[1], 16);
    var green = parseInt(result[2], 16);
    var blue = parseInt(result[3], 16);
    return [red, green, blue];
  };
function processData(hexvalues) {
  colorfinal = []
  for (var i = 0; i < hexvalues.length; i++) {
    colorfinal.push(HEXtoRGB(hexvalues[i]));

  }
  return colorfinal;
};
async function getPalettes(urlpath) {
    try {
        const resp = await axios.get(`https://lospec.com/palette-list/load?${urlpath}`);
        const dataarray = resp.data.palettes
        return dataarray
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};
function getconvertcolor(pathurl) { axios.get(`https://lospec.com/palette-list/${pathurl}`)
        .then((response) => {
          const html = response.data;
          const $ = cheerio.load(html);
          const scrapedata = $(".left > .palette > .color").text();
          var finalvalues = scrapedata.replace(/\s+/g, '').split('#')
          var cleanval = []
          for (value in finalvalues){
            cleanval.push(finalvalues[value])
          }
          cleanval.shift()
           console.log(processData(cleanval));
           console.log(`,\n`);
        })
        .catch((error) => {
          console.log(error);
        });



}


readline.question(`How many colors?\n\n`, (numcolors) => {
  numColors = numcolors
  urlpath = `colorNumberFilterType=exact&colorNumber=${numColors}&page=${numPag}&tag=&sortingType=downloads`
  arrvalues = []
  getPalettes(urlpath).then( data => {

    console.log(`Lista de url path: ${data.length}\n`);
    for (var i = 0; i < data.length; i++) {
      //console.log(data[i].slug);
      arrvalues.push((data[i].slug))
    }

    for (var i = 0; i < arrvalues.length; i++) {
      console.log(`${arrvalues[i]}\n`);
      getconvertcolor(arrvalues[i])
    }

    readline.close()
  })
})
