/* app.js
Ryan McConnell
April 2021*/

var http = require("http");
var qString = require("querystring");
var path = require("path");
var Math = require('mathjs');
let dbManager = require('./dbManager');
let express = require("express");
let app = express();
var ObjectID = require('mongodb').ObjectId;
var userRoute = require('./routes/userRoute.js')
//mongoose model stuff
let mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

//login and models stuff
let session = require('express-session');
let crypto = require('crypto');
const users = require('./models/userSchema.js');
const hints = require('./models/hintSchema.js');
const words = require('./models/wordSchema.js');
const Hangman = require('./routes/game.js')

//function for hashing passwords
function genHash(input){
    return Buffer.from(crypto.createHash('sha256').update(input).digest('base32')).toString('hex').toUpperCase();
}//By Ryan McConnell

//random function 
function getRand(){
    var rand = Math.floor((Math.random() * 10000) + 1);
    return rand;
}//By Ryan McConnell

//check if a word's hint list is full. Current check: hint list can't have more than 5
async function isListAtMax(word){
    var maxHints = false;
    let cursor = await words.find({_id: word, hintList: {$size: 5}}).countDocuments();
    //if the word's hint list is at max
    if(cursor > 0){
        maxHints = true;
    }
    return maxHints;
}//By Ryan McConnell

//Grab 1 random word from word list
async function randWord(){
    var wordInfo={};
    try{
        let cursor = await words.aggregate([{$match: {}}, {$sample: {size: 1}}])
            cursor.forEach((item)=>{
            wordInfo._id = item._id.toString();
            wordInfo.hintList = item.hintList;
            wordInfo.submittedBy = item.submittedBy;
            //console.log(wordInfo._id);
            //console.log(wordInfo)
        })
    }catch(e){
        console.log(e.message);
    }
    return wordInfo;
}//By Ryan McConnell

//grab a hint for a word
async function grabHints(hintID){
    try{
        var hintInfo = {};
        let cursor = await hints.aggregate([{$match: {hint_id: hintID}}])
        await cursor.forEach((item)=>{
            hintInfo._id = item._id.toString();
            hintInfo.hint_id = item.hint_id;
            hintInfo.submittedBy = item.submittedBy;
        })
    }catch(e){
        console.log(e.message);
    }
    return hintInfo
}//By Ryan McConnell
//restart game function
function restart(){
    stat = undefined;
    hangman = undefined;
    gameStatus = undefined;
    hintData = [];
    startTime = undefined;
    endTime = undefined;
    totalTime = undefined;
}//By Ryan McConnell

//FUNCTIONS TO UPDATE DB IF SOMEONE IS LOGGED IN
//function to increment win or loss counter for current user at end of game
async function updateCounter(curUser, status){
    console.log("status is " + status)
    switch (status){
        default:
            console.log("check your code, bud")
            break;
        case (0): //if game is still playing
            console.log("Game is currently being played by: " + curUser)
            break;
        case (1)://if game is won
            await users.updateOne({_id: curUser.toString() }, {$inc: { win_counter : 1}})
            console.log(curUser + " won")
            break;
        case (2): //if game is lost
            await users.updateOne({_id: curUser.toString() }, {$inc: { loss_counter : 1}})
            console.log(curUser + " lost")
            break;
    }
}//By Ryan McConnell
//function to update best_time for logged in user
//FIND A WAY TO TRACK TIME DURING GAME!!!
async function updateTime(curUser, timeTest){
    let userInfo = {};
    let cursor = await users.aggregate([{$match: {_id : curUser}}]);
    cursor.forEach((item)=>{
        userInfo._id = item._id.toString();
        userInfo.best_time = item.best_time;
    })
    if (timeTest < userInfo.best_time){ //time only updates if won
        console.log("game is won, updating user's new time: " + timeTest + " seconds")
        await users.updateOne({_id: curUser}, {$set: {best_time : timeTest}})
    }
}//By Ryan McConnell

//signup stuff
let nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth:{
		user: 'hangmangame7000@gmail.com',
		pass: 'qtqubdyqbiqotisf' //DO NOT DO THIS FOR A CLIENT. UNSECURED!!!
	}
});//based on Prof Levy's lecture

//DOCIFY FUNCTIONS
//docify function for word submission
//user var should be req.session.user
function docifyWord(inputWord, hintID, user){
    let doc = new words({ _id: inputWord.toLowerCase(),
         hintList: [hintID], submittedBy: user });
    return doc;
};//By Ryan McConnell
//docify function for new user info.
function docifyUser(params){
    let doc = new users({ _id: params.userName, password: genHash(params.pass), email: params.email})
    return doc;
};//By Ryan McConnell
//docify function for hint submission
//user var should be req.session.user
function docifyHint(inputHint, hintID, user){
    let doc = new hints({ _id: inputHint.toString(), hint_id: hintID,
         submittedBy: user});
    return doc;
};//By Ryan McConnell
function swattempts(tries) {
    switch(tries){
        case 5: sprites =  ["00", "01", "06", "08", "10", "15"]
            break;
        case 6: sprites =  ["00", "01", "06", "08", "10", "12", "15"] 
            break;
        case 7: sprites =  ["00", "01", "06", "08", "09", "10", "12", "15"]
            break;
        case 8: sprites =  ["00", "01", "03", "06", "08", "09", "10", "12", "15"]
            break;
        case 9: sprites =  ["00", "01", "02", "03", "06", "08", "10", "11", "12", "15"]
            break;
        case 10: sprites =  ["00", "01", "02", "03", "06", "08", "09", "10", "11", "12", "15"]
            break;
        case 11: sprites =  ["00", "01", "02", "03", "06", "07", "08", "09", "10", "11", "12", "15"]
            break;
        case 12: sprites =  ["00", "01", "02", "03", "06", "07", "08", "09", "10", "11", "12", "13", "15"]
            break;
        case 13: sprites =  ["00", "01", "02", "03", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"]
            break;
        case 14: sprites =  ["00", "01", "02", "03", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"]
            break;
        case 15: sprites =  ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"]
            break;
        default: console.error("DEFAULT")
            break;
    }
} //by Kate Erkan 
// Now back to Ryan :)

//PAGES
var postParams;
function moveOn(postData){
    let proceed = true;
    postParams = qString.parse(postData);
    //handle empty data
    for (property in postParams){
	    if (postParams[property].toString().trim() == ''){
	        proceed = false;
	    }
    }
    return proceed;
}//Code originated from Prof Levy's lecture
//handle views and dir
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public'))); //join path of dir to public folder
app.use('/user', userRoute);
app.use(session({
    secret: 'titan',
    saveUninitialized: false,
    resave: false
}))

//GET ROUTES
app.get('/', function (req, res){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        //console.log(req.session.user); <- does return logged in user's name. Implement into web pages if time allows
        //res.end('<html><body><br><br><a href="/wordSubmit">   Word Submission   </a>&emsp;&emsp;\
        //<a href="/hintSubmit">   Hint Submission   </a></body></html>');
        res.render('index', {trusted: req.session.user})
    }
}); //By Ryan McConnell
app.get('/login', function(req, res, next){
	if(req.session.user){
		res.redirect('/');
	} else{
		res.render('login');
	}
});//By Ryan McConnell
app.get('/login/:userID', async(req, res, next)=>{
    try{
		const results = await users.updateOne({_id: req.params.userID}, {email_verified: true})
		res.redirect('/login');
	}catch(err){
		next(err)
	}
})//By Ryan McConnell

app.get('/logout', function(req, res){
    if(!req.session.user){
        res.redirect('/login')
    } else{
        req.session.destroy();
        restart();
        res.redirect('/login')
    }
})//By Ryan McConnell
app.get('/createUser', function(req, res, next){
    if(req.session.user){
        res.redirect('/');
    }else{
        res.render('createUser');
    }
    
})//By Ryan McConnell
app.get('/wordSubmit', function(req, res, next){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        res.render('wordSubmit', {trusted: req.session.user});
    }
});//By Ryan McConnell
app.get('/hintSubmit', function(req, res, next){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        res.render('hintSubmit', {trusted: req.session.user});
    }
});//By Ryan McConnell
app.get('/leaderboard', function(req, res, next){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        res.render('leaderboard', {trusted: req.session.user});
    }
});//By Ryan McConnell

// by Kate Erkan
var hangman; 
var gameStatus;
let error;
let sprites = [];
let sprite = "";
var startTime;
var endTime;
var totalTime;
//by Ryan McConnell
function setStatus(game){
    if(game != undefined){
        gameStatus = hangman.status();
        console.log("gameStatus is " + gameStatus)
    }
    return gameStatus;
}//By Ryan McConnell
var hintData = []; //stores all hints for word of current game
var stat;
app.get('/game', async (req, res) => {
    //console.log("first stat is " + stat)
    switch(stat){
        case(0):
            console.log("game will continue")
            break;
        case(1):
            console.log("will update user's win count, and check time")
            endTime = Date.now()/1000; //end time in seconds
            totalTime = (endTime - startTime).toPrecision(6);
            console.log("Your time is " + totalTime + "seconds");
            await updateTime(req.session.user.name, totalTime);
            await updateCounter(req.session.user.name, stat)
            break;
        case(2):
            console.log("will update user's loss count")
            await updateCounter(req.session.user.name, stat)
            break;
    } 
    const {  query : { error } } = req
    if(!req.session.user){
		res.redirect('/login');
	}else{
        if (hangman == undefined) {
            word = await randWord();
            //console.log("this is hintlist: " + word.hintList)
            var hintArr = word.hintList;
            for(let i = 0; i < hintArr.length; i++){
                //console.log("hint id is : " + hintArr[i]);
                let hint = await grabHints(hintArr[i]);
                hintData.push(hint._id)
            }
            console.log("data is: " + hintData)
            hangman = new Hangman(word._id)
            if(stat == undefined){
                stat = setStatus(hangman)
            }
            swattempts(hangman.attempts())
            startTime = Date.now()/1000; //begin time in seconds
        }
        sprite = sprites[0]
        let i = sprites.length - 1 - hangman.attempts()
        sprite = sprites[i]
            totalTime = (endTime - startTime).toPrecision(6);
        res.render('game', {trusted: req.session.user, word: word._id, results: hintData,
             time: totalTime, error, hangman, sprite})
    }
})// by Kate Erkan, edited by Ryan

//restart game without restarting app.js
app.get('/restart', function(req, res){
    restart();
    res.redirect('/game');
})//By Ryan McConnell

//game post routes
app.post("/game", (req, res) => {
    //const { body: { text } } = req
    postData='';
    req.on('data', (data)=> {
        postData+=data;
    })
    req.on('end', async()=>{
        console.log(postData);
        if(!req.session.user){
		    res.redirect('/login');
	    } else{
            if(moveOn(postData)){
                try {
                    if(postParams.text === " " || postParams.text === null || postParams.text === undefined || hangman.status() === undefined){
                        res.render('game', {trusted: req.session.user, msg: "Please do not have text be only whitespace or empty"})
                    }
                    hangman.try(postParams.text)
                    stat = setStatus(hangman)
                    //console.log("new stat is " + stat)
                    res.redirect('/game', {trusted: req.session.user})
                } catch (err) {
                    res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
                }
            }else{
                res.render('game', {trusted: req.session.user});
            }
        }
    })
})// by Kate Erkan & Ryan McConnell

//POST ROUTES
var postData;
var user;
app.post('/login', express.urlencoded({extended: false}), async (req, res, next)=>{
	let untrusted = {user: req.body.userName, password: genHash(req.body.pass)}
	    try{
		    let result = await users.findOne({_id: req.body.userName})
            console.log(result); //just to make sure things are working
            console.log(untrusted)//yep it works
		    if (untrusted.password.toString().toLowerCase() == result.password.toString().toLowerCase()){
			    let trusted={name: result._id.toString()}
			    req.session.user=trusted;
			    res.redirect('/')
		    }else{
			    res.render('login', {trusted: req.session.user, msg: "Password does not match records!"})
		    }
	    }catch (err){
		    next(err)
	    }
})//Code originated from Prof Levy's lecture
app.post('/createUser', function(req, res){
    postData = '';
    req.on('data', (data) =>{
	postData+=data;
    });
    req.on('end', async ()=>{
	    postParams = qString.parse(postData)
        let cursor = await users.find({_id: postParams.userName.toString()}).countDocuments()
        if(postParams.pass.toString() != postParams.reenter.toString()){
            res.render('createUser', {msg: "Please enter your password correctly"})
        }else if(cursor > 0){
            res.render('createUser', {msg: "That user already exists"})
        }else{
            try{
                //console.log(postParams.userName);
                //console.log(postParams.pass); <-used to make sure it caught the right values
                let curDoc = docifyUser(postParams);
                await curDoc.save();
                console.log("Added " + postParams.userName + " to db");
                let msgOpts={
                    subject: "Welcome to the Hangman Server!",
                    html: '<html><a href=\'http://localhost:7000/login/'+postParams.userName+'\'>Click to login to Hangman Server</a>',
                    to: `${postParams.email}`,
                    from: "hangmangame7000@gmail.com"
                }
                transporter.sendMail(msgOpts);
                // //below checks if they are now present in db and proceeds to log them in
                // let result = await users.findOne({_id: postParams.userName})
                // console.log(result);
                // let trusted={name: result._id.toString()};
                // req.session.user=trusted;
                res.redirect('/login')
            }catch (err){
                res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
            }
        }
    })
})//By Ryan McConnell
app.get('/signup/:userID', async(req, res, next)=>{
	try{
		const results = await users.updateOne({_id: req.params.userID}, {email_verified: true})
		res.redirect('/login');
	}catch(err){
		next(err)
	}
})//from Prof Levy's lecture

app.post('/wordSubmit', function(req, res){
    user = req.session.user.name; //<- returns only name string of current user
    //console.log(user);
    postData = '';
    req.on('data', (data) =>{
        postData+=data;
    });
    req.on('end', async()=>{
        console.log(postData);
        if(moveOn(postData)){
            try{
                var wordInput = postParams.word.toLowerCase();
                var hintInput = postParams.hint;
                console.log(wordInput);
                console.log(hintInput);
                var hintID = getRand();
                var wordCheck = await words.find({_id : wordInput}).countDocuments()
                var hintIDCheck = await hints.find({hint_id : hintID}).countDocuments()
                var hintCheck = await hints.find({_id : hintInput}).countDocuments()
                //check if input word already exists
                if(wordCheck > 0){
                    console.log("User tried to submit a word that already exists!")
                    res.render('wordSubmit', {trusted: req.session.user, msg: "That word already exists!"})
                }else if(wordCheck == 0 && hintCheck > 0){ 
                    //if word doesn't exist and hint exists, add hint to newly added word
                    var cursor = await hints.find({_id: hintInput});
                    var existHintID;
                    var existHint;
                    await cursor.forEach((item)=>{
                        existHintID = item.hint_id;
                        existHint = item._id;
                    })
                    let wordDoc = docifyWord(wordInput, existHintID, user);
                    await wordDoc.save();
                    res.render('wordSubmit', {trusted: req.session.user, msg: "Your word: " + wordInput + 
                    " and existing hint: " + existHint + " has been added"});
                }else{
                    //if hint_id exists, keep regening an id for hint to be added
                    while(hintIDCheck > 0){ 
                        hintID = getRand();
                        hintIDCheck = await hints.find({hint_id : hintID}).countDocuments()
                    }
                    let wordDoc = docifyWord(wordInput, hintID, user);
                    let hintDoc = docifyHint(hintInput, hintID, user);
                    await wordDoc.save();
                    await hintDoc.save();
                    res.render('wordSubmit', {trusted: req.session.user, msg: "Your word: " + wordInput + 
                    " and hint: " + hintInput + " has been added"});
                }
            } catch (err){
                res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
            }
        }else{
            res.render('wordSubmit', {trusted: req.session.user});
        }
    })
})//By Ryan McConnell
app.post('/hintSubmit', function(req, res){
    user = req.session.user.name; //<- returns only name string of current user
    console.log(user);
    postData = '';
    req.on('data', (data) =>{
        postData+=data;
    });
    req.on('end', async()=>{
        console.log(postData)
        if(moveOn(postData)){
            try{
                var wordInput = postParams.word.toLowerCase();
                var hintInput = postParams.hint;
                console.log(wordInput);
                console.log(hintInput);
                var hintID = getRand();
                var atMax = await isListAtMax(wordInput);
                console.log("Is the word at max number of hints? " + atMax);
                var wordCheck = await words.find({_id : wordInput}).countDocuments()
                var hintIDCheck = await hints.find({hint_id : hintID}).countDocuments()
                var hintCheck = await hints.find({_id : hintInput}).countDocuments()
                //make sure word exists in db
                if(wordCheck > 0 && !atMax){
                    console.log(wordInput + " exists in DB!")
                    if(atMax){
                        console.log(wordInput + " is at max hints. Sorry");
                    }
                    //Make sure not a duplicate hint
                    //if hint exists and word's list isn't full, try to add to existing word
                    if(hintCheck > 0){ 
                        //get hint_id for existing hint
                        var cursor = await hints.find({_id: hintInput});
                        var existHintID;
                        var existHint;
                        await cursor.forEach((item)=>{
                            existHintID = item.hint_id;
                            existHint = item._id;
                        })
                        //check if existing hint exists for given existing word
                        var wordHasHint = await words.find({_id: wordInput, hintList: existHintID}).countDocuments()
                        if(wordHasHint > 0){ //if hint is in word list
                            console.log("The hint exists for that word already!");
                            res.render('hintSubmit', {trusted: req.session.user, msg: "The existing hint: " + existHint + 
                            " is already in " + wordInput + "'s list of hints!"})
                        }else{
                            //adds existing hint to existing word
                            await words.updateOne({_id: wordInput}, { $push: {hintList: existHintID}});
                            res.render('hintSubmit', {trusted: req.session.user, msg: "The existing hint: " + existHint + 
                            " has been added to " + wordInput + "'s list of hints!" })
                        }
                    }else{//if not dupe hint, proceed to add
                        //if hint_id exists, keep regening an id for hint to be added
                        while(hintIDCheck > 0){ 
                            hintID = getRand();
                            hintIDCheck = await hints.find({hint_id : hintID}).countDocuments()
                        }
                        //adds hint to db
                        let hintDoc = docifyHint(hintInput, hintID, user);
                        await hintDoc.save();
                        //assign new hint's id to existing word
                        await words.updateOne({_id: wordInput}, { $push: {hintList: hintID}});
                        res.render('hintSubmit', {trusted: req.session.user, msg: "Your hint: " + hintInput + 
                            " has been added to " + wordInput + "'s list of hints!"});
                    }
                    
                }else{
                    if(atMax){
                        res.render('hintSubmit', {trusted: req.session.user, msg: "The word " + wordInput +
                    " has the maximum amount of hints. Not Adding."});
                    }else{
                        res.render('hintSubmit', {trusted: req.session.user, msg: "The word " + wordInput +
                    " does not exist! Try adding it?"});
                    }
                }
            } catch (err){
                res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
            }
        }else{
            res.render('hintSubmit', {trusted: req.session.user});
        }
        
    })
})//By Ryan McConnell
//Insert leaderboard sort POST here. UPDATE: Yay its done
app.post('/leaderboard', function(req, res){
    postData = '';
    req.on('data', (data)=>{
        postData+=data;
    });
    req.on('end', async() =>{
        console.log(postData)
        if(moveOn(postData)){
            var prop = postParams.prop;
            //console.log(prop);//<- returns prop correctly
            try{
                var cursor;
                //sort top 5 of whatever value
                if(prop == "win_counter"){
                    cursor = await users.find({}).sort({win_counter: -1}).limit(5);
                    //console.log(cursor);
                } else if(prop == "loss_counter"){
                    cursor = await users.find({}).sort({loss_counter: -1}).limit(5);
                    //console.log(cursor);
                }
                //since its by lowest times, sort is ascending
                else if(prop == "best_time"){
                    cursor = await users.find({}).sort({best_time: 1}).limit(5);
                    //console.log(cursor);
                }
                let data = [];
                await cursor.forEach((item) => {
                    let curInfo={};
                    curInfo._id = item._id;
                    curInfo.best_time = item.best_time;
                    curInfo.win_counter = item.win_counter;
                    curInfo.loss_counter = item.loss_counter;
                    data.push(curInfo);
                    //console.log(curInfo);
                    console.log(data)
                });
                let result = {dataArr: data, prop: prop};
                //console.log(result)
                res.render('leaderboard', {trusted: req.session.user, results: result});
            }catch(err){
                res.status(500).render('error', {message: err.message})
            }
        }else{
            res.render('leaderboard', {trusted: req.session.user});
        }
    })
})//By Ryan McConnell

//error stuff
app.use('*', function(req, res){
    res.writeHead(404);
    res.end(`<h1> ERROR 404. ${req.url} NOT FOUND</h1><br><br>`);
});
app.use((err, req, res, next)=>{
	res.status(500).render('error', {message: err.message})
})//Based on Prof Levy's lecture

//Express listen function
app.listen(7000, async()=>{
    //try to start and wait for database
    //HangmanDB contains users, words, and hints collections
    try{
        await mongoose.connect('mongodb://localhost:27017/HangmanDB', {useNewUrlParser: true, useUnifiedTopology: true });
        //await dbManager.get("HangmanDB")
    } catch(e){
        console.log(e.message);
    }
    console.log("Server is running...");
    //console.log(randWord()); //<- test for randWord was working correctly 
    //console.log(randWord());
    //console.log(randWord());
} );//By Ryan McConnell