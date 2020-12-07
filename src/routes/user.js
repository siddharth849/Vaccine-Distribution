//levels
//central- 0
//states- 1
//hospitals- 2
//production centres- 3

const User=require('../models/user');
const express=require('express');
const passport = require('passport');
const authenticate=require('../middleware/authenticate');

const userRouter=express.Router();

userRouter.get('/addCentral',async(req,res)=>{
    const user= new User({
        username:"CENTRAL",
        password:"123",
        level:0,
    })
    try {
        const password="123";
        await User.register(user,password);  
        res.send({msg:`${user.username} is registred successfully`,user})
    } catch (error) {
        res.status(500).send(error)
    }
})
//only be done by central govt.
userRouter.post('/addStates',authenticate.checkAuth,authenticate.ckeckLevel({level:0}),async(req,res)=>{
const user=new User({username:req.body.username,owner:req.user._id,level:1});
    try{
        if(req.body.password!==req.body.confirmPassword){ 
           const error_msg="password and confirm password should be same..!";
           return res.render('addStates',{title:"Add States",error_msg,info:req.body});
        }
        const existUser=await User.findOne({username:req.body.username});
        if(existUser){
            const error_msg="A user with the given username is already registered..!";
           return res.render('addStates',{title:"Add States",error_msg,info:req.body});
        } 
        await User.register(user,req.body.password);  
        const success_msg=` ${user.username} is successfully registred..!`;
        return res.render('addStates',{title:"Add States",success_msg});
    }
    catch(e){
        res.status(400).send(e)
    }
})
userRouter.post('/addProductionCentres',authenticate.checkAuth,authenticate.ckeckLevel({level:0}),async(req,res)=>{
    const user=new User({username:req.body.username,owner:req.user._id,level:3});
        try{
            if(req.body.password!==req.body.confirmPassword){ 
                const error_msg="password and confirm password should be same..!";
                return res.render('addProductionCentres',{title:"Add Production Centres",error_msg,info:req.body});
            }
            const existUser=await User.findOne({username:req.body.username});
            if(existUser){
                const error_msg="A user with the given username is already registered..!";
                return res.render('addProductionCentres',{title:"Add Production Centres",error_msg,info:req.body});
            } 
            await User.register(user,req.body.password);  
            const success_msg=`${user.username} is successfully registred..!`;
            return res.render('addProductionCentres',{title:"Add Production Centres",success_msg});
        }
        catch(e){
            res.status(400).send(e)
        }
    })
    
userRouter.post('/addHospitals',authenticate.checkAuth,authenticate.ckeckLevel({level:1}),async(req,res)=>{
    const user=new User({username:req.body.username,owner:req.user._id,level:2});
        try{
            if(req.body.password!==req.body.confirmPassword){ 
                const error_msg="password and confirm password should be same..!";
                return res.render('addHospitals',{title:"Add Hospitals",error_msg,info:req.body});
            }
            const existUser=await User.findOne({username:req.body.username});
            if(existUser){
                const error_msg="A user with the given username is already registered..!";
                return res.render('addHospitals',{title:"Add Hospitals",error_msg,info:req.body});
            } 
            await User.register(user,req.body.password);  
            const success_msg=` ${user.username} is successfully registred..!`;
            return res.render('addHospitals',{title:"Add Hospitals",success_msg});
        }
        catch(e){
            res.status(400).send(e)
        }
    })
    userRouter.post('/addPatient',authenticate.checkAuth,authenticate.ckeckLevel({level:2}),async(req,res)=>{
        const user=new User({username:req.body.username,owner:req.user._id,level:4});
            try{
                if(req.body.password!==req.body.confirmPassword){ 
                    const error_msg="password and confirm password should be same..!";
                    return res.render('addPatient',{title:"Add Patient",error_msg,info:req.body});
                }
                const existUser=await User.findOne({username:req.body.username});
                if(existUser){
                    const error_msg="A user with the given username is already registered..!";
                    return res.render('addPatient',{title:"Add Patient",error_msg,info:req.body});
                } 
                await User.register(user,req.body.password);  
                const success_msg=` ${user.username} is successfully registred..!`;
                return res.render('addPatient',{title:"Add Patient",success_msg});
            }
            catch(e){
                res.status(400).send(e)
            }
        })
    
userRouter.post('/login',authenticate.isUserAlreadyLogedIn({successRedirect:'/users/profile'}),passport.authenticate('local', {failureRedirect: '/users/login',failureFlash: 'Invalid username or password.'}),authenticate.removeExpiredTokens,async(req,res)=>{
    try{
        const token=authenticate.getToken({_id:req.user._id});
        const user=await User.findById(req.user._id);
        user.tokens.push({token});
        await user.save(); 
        await res.cookie('access_token', 'Bearer ' + token,{
            maxAge:60*60*1000,        //here time is in millisecond and 1s=1000ms
            httpOnly:true,
            signed:true
        });
        req.flash("success","Welcome, you are successfuly loged in..!")
        res.redirect('/users/profile');
       // res.send({msg:"you are successfuly loged in..!",token,user:user})
    }
    catch(e){
       res.status(400).send(e)
    }
})

userRouter.get('/logout',authenticate.checkAuth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{       //this token is one element of array and it contains a field token
            return token.token!==req.token
        })
        await req.user.save();
        res.clearCookie('access_token');
        req.flash("success","You are successfuly loged out..!")
        res.redirect('/');
    }
    catch(e){
        res.status(500).send(e)
    }
})

userRouter.get('/logoutAll',authenticate.checkAuth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save();
        res.clearCookie('access_token');
        req.flash("success","You are successfuly loged out..!")
        res.redirect('/');
    }
    catch(e){
        res.status(500).send(e)
    }

})

//renderd login and signup pages,profile
userRouter.get('/addStates',authenticate.checkAuth,authenticate.ckeckLevel({level:0}),async(req,res)=>{
    res.render('addStates',{title:"Add States"});
})
userRouter.get('/addProductionCentres',authenticate.checkAuth,authenticate.ckeckLevel({level:0}),async(req,res)=>{
    res.render('addProductionCentres',{title:"Add Production Centres"});
})
userRouter.get('/addHospitals',authenticate.checkAuth,authenticate.ckeckLevel({level:1}),async(req,res)=>{
    res.render('addHospitals',{title:"Add Hospitals"});
})
userRouter.get('/addPatient',authenticate.checkAuth,authenticate.ckeckLevel({level:2}),async(req,res)=>{
    res.render('addPatient',{title:"Add Patient"});
})
userRouter.get('/login',authenticate.isUserAlreadyLogedIn({successRedirect:'/users/profile'}),async(req,res)=>{
    res.render('login',{title:"Login"});
})
userRouter.get('/profile',authenticate.checkAuth,async(req,res)=>{
    res.render('profile',{title:"Profile",user:req.user});
})
userRouter.get('/heatmap',(req,res)=>{
    res.render('heatmap',{title:"INDIA MAP"})
})

module.exports=userRouter;