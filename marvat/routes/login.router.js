const express = require('express');
const router = express.Router();
const contro = require("../controllers/signup.contr");
const csrf = require("csurf");
const csrfProtect = csrf({cookie:true}) 
router.get('/login',csrfProtect,(req,res)=>{
    res.render('login.ejs',{errorLogin:req.flash('loginError') ,csrfToken :req.csrfToken()});
})

router.post('/login',csrfProtect,contro.login)
module.exports =router;  