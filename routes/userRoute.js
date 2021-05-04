/*
userRoute.js
@author: Ryan McConnell
version: 05/03/2021
Description: Router used for email verification in app.js
*/
var express = require("express");
var router = express.Router();
let users = require('../models/userSchema');

router.get('/:userID', async (req, res)=> {
    try{
	    let user=await users.findOne({_id: req.params.userName});
	    res.render('login', { msg: "You clicked the email link we sent. Please log in " + user._id});
    }catch (err){
	    res.status(500).render('error', {message: err.message})
    }
});

module.exports = router;
//By Ryan McConnell