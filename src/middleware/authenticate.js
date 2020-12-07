const passport= require("passport");
const LocalStrategy=require('passport-local').Strategy;
const User=require('../models/user');
const jwt=require('jsonwebtoken'); 


exports.local=passport.use(new LocalStrategy(User.authenticate())); //(User.authenticate(),User.serializeUser(),User.deserializeUser()
                                                    // are provided by pasport-local-mongoose and use them we just have     
                                                     //to include model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



exports.getToken=function(userid){
    const token= jwt.sign(userid,process.env.JWT_SECRET,{expiresIn:3600});   //userid is a obeject {_id:_id}
    return token;                                               //Note:-here time is in seconds ie 3600=1hr
}

exports.checkAuth=async(req,res,next)=>{
    try{
        if(!req.signedCookies||!req.signedCookies.access_token){
            throw new Error("please! authenticate.")
        }
        const token=req.signedCookies.access_token.replace('Bearer ',"");
        const decodedPayload= await jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findOne({_id:decodedPayload._id,'tokens.token':token});
        if(!user){
            throw Error("please! authenticate.")
        }
        req.user=user;
        req.token=token;
        res.locals.users=user;
        next();
    }
    catch(e){
        console.log(e)
        req.flash('error','you are not authenticated, please! authenticate.')
        res.redirect('/users/login');
    }
}
exports.setAuthenticatedUser=async(req,res,next)=>{
    try{
        if(!req.signedCookies||!req.signedCookies.access_token){
            throw new Error("please! authenticate.")
        }
        const token=req.signedCookies.access_token.replace('Bearer ',"");
        const decodedPayload= await jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findOne({_id:decodedPayload._id,'tokens.token':token});
        if(!user){
            next();
        }
        req.user=user;
        req.token=token;
        res.locals.users=user;
        next();
    }
    catch(e){
        next();
    }
}
exports.isUserAlreadyLogedIn=({successRedirect})=>{
    return async function(req,res,next){
        try{
            if(!req.signedCookies||!req.signedCookies.access_token){
                throw new Error("please! authenticate.")
            }
            const token=req.signedCookies.access_token.replace('Bearer ',"");
            const decodedPayload= await jwt.verify(token,process.env.JWT_SECRET);
            const user=await User.findOne({_id:decodedPayload._id,'tokens.token':token});
            if(!user){
                next();
            }
            req.user=user;
            req.token=token;
            res.locals.users=user;
            req.flash("success","You are already loged in!")
            res.redirect(successRedirect);
        }
        catch(e){
            next();
        }
    }
}
exports.ckeckLevel=({level})=>{
    return async(req,res,next)=>{
        if(level===null||undefined){
           return res.status(403).send("you are not permitted to perform the task..!")
        }
        if(level===req.user.level){
            return  next()
        }
        res.status(403).send("you are not permitted to perform the task..!")
    }
}
exports.removeExpiredTokens=async(req,res,next)=>{
    const tokens=req.user.tokens;
    const tokenArr=[]
    for(const element of tokens){
        try{
            const decodedPayload= await jwt.verify(element.token,process.env.JWT_SECRET);
            if(decodedPayload){
                tokenArr.push(element);
            }
        }
        catch(e){
        }
    }
    req.user.tokens=tokenArr;
    req.user.save((err)=>{
        if(err){
            next(err)
        }
    });
    next()
}