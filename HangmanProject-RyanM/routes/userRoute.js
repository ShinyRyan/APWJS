var express = require("express");
var router = express.Router();
let users = require('../models/userSchema');

router.get('/:userID', async (req, res)=> {
    try{
	    let user=await users.findOne({_id: req.params.userID});
	    res.render('user', { searchID: user._id});
    }catch (err){
	    res.status(500).render('error', {message: err.message})
    }
});

module.exports = router;