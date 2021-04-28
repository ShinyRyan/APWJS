//Literally just a file to test functions before using them in app.js
let mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const hints = require('./models/hintSchema.js');

//prints a number between 1 and 10000 at random
/*function getRand(){
    var rand = Math.floor((Math.random() * 10000) + 1);
    return rand;
}
console.log(getRand());
*/