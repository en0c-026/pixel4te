pixel4te is an app to generate pixel art images

![a](/docs/assets/7px4color.png)


program functions:

* select the size of the pixel box
* grayscale
* 100 pallets colors
* adjust width and height
* download png image


script pallets scaper

you can load new palettes with this script /

cd docs/pallets-scraper
npm install
node script.js

the input value has to be a number (for example: 4, 8, 16 ..)
change the page number in the variable "numPag" of docs/pallets-scraper/script.js
the result is an array with the rgb codes, ready to load in the file cd /docs/assets/mainmin.js in the variable "paletteList"
