# pixel4te is a Dapp on the Arweave blockchain


This App need to work ArConnect Chrome Extension, don't you have it? [Get Extension here](https://chrome.google.com/webstore/detail/arconnect/einnioafmpimabjcddiinlhmijaionap?hl=es)

URL Permaweb:
[https://arweave.net/AEn40YjdI2FEeK66pZfBljkHYgmGTD8ONWNhIqbAk3U](https://arweave.net/AEn40YjdI2FEeK66pZfBljkHYgmGTD8ONWNhIqbAk3U)

![a](https://github.com/en0c-026/pixel4te/blob/master/pixel4te.png)


* Connect wallet with ArConnect
* Check wallet balance
* Swich wallet live
* Sign transacion one click
* Upload your image to the Arweave blockchain
* Generale link of the PermaWeb
* Download image from the Arweave blockchain
* Get status Arweave Network


-----------------------------------------------------------
Art functions

* Select the size of the pixel box
* Grayscale
* 100 pallets colors
* Pick random pallete
* Adjust width and height




---------------------------------
Script pallets scaper

you can load new palettes with this script / in local version

cd docs/pallets-scraper
npm install
node script.js

the input value has to be a number (for example: 4, 8, 16 ..)
change the page number in the variable "numPag" of docs/pallets-scraper/script.js
the result is an array with the rgb codes, ready to load in scipt element of the html file in the variable "paletteList"
