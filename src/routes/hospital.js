//levels
//central- 0
//states- 1
//hospitals- 2
//production centres- 3

const User=require('../models/user');
const express=require('express');
const passport = require('passport');
const authenticate=require('../middleware/authenticate');

const hospitalRouter=express.Router();

hospitalRouter.post('/uploadCases',authenticate.checkAuth,authenticate.ckeckLevel({level:2}),async(req,res)=>{
    try {
        const mildCases=Number(req.body.mildCases)
        const seriousCases=Number(req.body.seriousCases)
        req.user.mildCases=req.user.mildCases+mildCases;
        req.user.seriousCases= req.user.seriousCases+seriousCases;
        req.user.caseHistory.push({
                seriousCaseHistory:req.user.seriousCases,
                mildCaseHistory:req.user.mildCases
        });
        await req.user.save()
        const ownerState=await User.findById(req.user.owner)
        ownerState.mildCases=ownerState.mildCases+mildCases;
        ownerState.seriousCases=ownerState.seriousCases+seriousCases;
        ownerState.caseHistory.push({
                seriousCaseHistory:ownerState.seriousCases,
                mildCaseHistory:ownerState.mildCases
        });
        await ownerState.save()
        const central=await User.findById(ownerState.owner);
        central.mildCases=central.mildCases+mildCases;
        central.seriousCases=central.seriousCases+seriousCases;
        central.caseHistory.push({
                seriousCaseHistory:central.seriousCases,
                mildCaseHistory:central.mildCases
        });
        await central.save()
        res.render('uploadCases',{title:'Upload Cases',success_msg:"cases uploaded successfully!"})
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})
hospitalRouter.get('/uploadCases',authenticate.checkAuth,authenticate.ckeckLevel({level:2}),async(req,res)=>{
    res.render('uploadCases',{title:'Upload Cases'})
})
hospitalRouter.post('/uploadVaccine',authenticate.checkAuth,authenticate.ckeckLevel({level:3}),async(req,res)=>{
    try {
        const vaccines=Number(req.body.vaccines)
        req.user.vaccines= req.user.vaccines+vaccines;
        req.user.vaccineHistory.push({
                receivedVaccines:req.user.vaccines
        });
        await req.user.save()
        const central=await User.findById(req.user.owner);
        central.vaccines=central.vaccines+vaccines;
        central.vaccineHistory.push({
                receivedVaccines:central.vaccines
        });
        await central.save()
        res.render('uploadVaccine',{title:'Upload Vaccine',success_msg:"vaccine uploaded successfully!"})
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})
hospitalRouter.get('/uploadVaccine',authenticate.checkAuth,authenticate.ckeckLevel({level:3}),async(req,res)=>{
    res.render('uploadVaccine',{title:'Upload Vaccine'})
})
hospitalRouter.get('/distributeVaccine',authenticate.checkAuth,async(req,res)=>{
    try{    
        if(req.user.level!==0&&req.user.level!==1){
            return  res.status(403).send("you are not permitted to perform the task..!")
        }
        var vaccineMildCases=0;
        var vaccineSeriousCases=0;
        var vaccines= req.user.vaccines
        var mildCases=req.user.mildCases
        var mildCasesCopy=req.user.mildCases;
        var seriousCases=req.user.seriousCases
        var seriousCasesCopy=req.user.seriousCases
        var totalCases=mildCases+seriousCases;
        if(totalCases>vaccines){
            // totalCases=totalCases-vaccines;
            // vaccines=0;
            //if serious cases are less than 70% of vaccines than all willl get vaccines and all leftover vaccine
            //will e given to mild cases
            if(seriousCases<((vaccines*65)/100)){
                vaccineSeriousCases=seriousCases;
                vaccines=vaccines-vaccineSeriousCases;
                seriousCases=0;
                vaccineMildCases=vaccines;  //give all leftover vaccines
                mildCases=mildCases-vaccineMildCases; 
                vaccines=0;                     //as overall vaccines are less than total cases
            }
            else{
                vaccineSeriousCases=Math.floor((vaccines*65)/100);
                seriousCases=seriousCases-vaccineSeriousCases; //65% of vaccines are given to serious cases
                vaccines=vaccines-vaccineSeriousCases; //as 65% of vaccine is now distributed so now left is 35%
                vaccineMildCases=vaccines            //now all left 35% of vaccine is given to mild cases
                mildCases=mildCases-vaccineMildCases 
                vaccines=0;
            }
        }
        else{
            //vaccine is greater than total cases
            vaccineMildCases=mildCases;
            vaccineSeriousCases=seriousCases;
            vaccines=vaccines-(vaccineMildCases+vaccineSeriousCases);
            mildCases=0;
            seriousCases=0;
        }
        req.user.vaccines=vaccines;
        req.user.mildCases=mildCases;
        req.user.seriousCases=seriousCases;
        await req.user.save();
        const states=await User.find({owner:req.user._id});
        for (const state of states) {
         if(state.level!==3){
            //state_vaccineMildCases is for both hospitals and states
            if(mildCasesCopy===0){
                var state_vaccineMildCases=0; //if mild case in higher authorities are zero then they 
            }
            else{
                var state_vaccineMildCases=Math.floor((vaccineMildCases*state.mildCases)/mildCasesCopy);
            }
            if(seriousCasesCopy===0){
                var state_vaccineSeriousCases=0;
            }
            else{
                var state_vaccineSeriousCases=Math.floor((vaccineSeriousCases*state.seriousCases)/seriousCasesCopy);
            }
            var state_totalVaccines=state_vaccineMildCases+state_vaccineSeriousCases;
            state.vaccines=state.vaccines+state_totalVaccines;
            state.totalReceivedVaccines= state.totalReceivedVaccines+state_totalVaccines;
            state.vaccineHistory.push({receivedVaccines:state_totalVaccines});
            await state.save()
          }
         }
        if(req.user.level===0){
            const production=await User.updateMany({level:3,owner:req.user._id},{vaccines:0})
        }
        req.flash("success","You successfuly distributed the vaccine!")
        res.redirect('/users/profile')
    }
    catch(e){
        console.log(e);
        res.status(500).send(e)
    }
})

hospitalRouter.get('/vaccineReceived',authenticate.checkAuth,authenticate.ckeckLevel({level:2}),async(req,res)=>{
    try {
        var vaccineMildCases=0;
        var vaccineSeriousCases=0;
        var vaccines= req.user.vaccines
        var mildCases=req.user.mildCases
        var seriousCases=req.user.seriousCases
        var totalCases=mildCases+seriousCases;
        if(totalCases>vaccines){
            // totalCases=totalCases-vaccines;
            // vaccines=0;
            //if serious cases are less than 70% of vaccines than all willl get vaccines and all leftover vaccine
            //will e given to mild cases
            if(seriousCases<((vaccines*65)/100)){
                vaccineSeriousCases=seriousCases;
                vaccines=vaccines-vaccineSeriousCases;
                seriousCases=0;
                vaccineMildCases=vaccines;  //give all leftover vaccines
                mildCases=mildCases-vaccineMildCases; 
                vaccines=0;                     //as overall vaccines are less than total cases
            }
            else{
                vaccineSeriousCases=Math.floor((vaccines*65)/100);
                seriousCases=seriousCases-vaccineSeriousCases; //65% of vaccines are given to serious cases
                vaccines=vaccines-vaccineSeriousCases; //as 65% of vaccine is now distributed so now left is 35%
                vaccineMildCases=vaccines            //now all left 35% of vaccine is given to mild cases
                mildCases=mildCases-vaccineMildCases 
                vaccines=0;
            }
        }
        else{
            //vaccine is greater than total cases
            vaccineMildCases=mildCases;
            vaccineSeriousCases=seriousCases;
            vaccines=vaccines-(vaccineMildCases+vaccineSeriousCases);
            mildCases=0;
            seriousCases=0;
        }
        req.user.vaccines=vaccines;
        req.user.mildCases=mildCases;
        req.user.seriousCases=seriousCases;
        await req.user.save();
        req.flash("success","You successfuly received the vaccine!")
        res.redirect('/users/profile')   
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})
hospitalRouter.get('/vaccineReceivedPatient',authenticate.checkAuth,authenticate.ckeckLevel({level:4}),async(req,res)=>{
    try {
        const ownerHospital=await User.findById(req.user.owner);
        ownerHospital.vaccineReceivedPatient=ownerHospital.vaccineReceivedPatient+1;
        await ownerHospital.save();
        const ownerState=await User.findById(ownerHospital.owner);
        ownerState.vaccineReceivedPatient=ownerState.vaccineReceivedPatient+1;
        await ownerState.save();
        const central=await User.findById(ownerState.owner);
        central.vaccineReceivedPatient=central.vaccineReceivedPatient+1;
        await central.save();
        const success_msg="You record saved successfully!"
        res.render('profile',{title:"Profile",user:req.user,success_msg});
    }
    catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})
hospitalRouter.get('/verifyVaccineUsage',authenticate.checkAuth,async(req,res)=>{
    try{
        if(req.user.level===2||req.user.level===3||req.user.level===4){
            return  res.status(403).send("you are not permitted to perform the task..!")
        }
        const childs=await User.find({level:{$ne:3},owner:req.user._id});
        res.render('verifyVaccineUsage',{title:'Verify Vaccine Usage',childs})
    }
    catch(e){

    }
}) 
hospitalRouter.get('/vaccineHistory',authenticate.checkAuth,(req,res)=>{
    if(req.level===4){
        return  res.status(403).send("you are not permitted to perform the task..!")
    }
    var vaccines=[];
    var dates=[];
    if(req.user.vaccineHistory!==null||req.user.vaccineHistory.lenghth!==0){
        req.user.vaccineHistory.forEach(element => {
            vaccines.push(element.receivedVaccines);
            var date=element.date.toString().substr(8, 2).replace(/ /g,'');
            dates.push(date.toString());
        });
    }
    res.render('vaccineHistory',{title:'Vaccine History',vaccines,dates})
})
hospitalRouter.get('/caseHistory',authenticate.checkAuth,(req,res)=>{
    if(req.level===3||req.level===4){
        return  res.status(403).send("you are not permitted to perform the task..!")
    }
    var mildCases=[];
    var seriousCases=[];
    var dates=[];
    if(req.user.caseHistory!==null||req.user.caseHistory.lenghth!==0){
        req.user.caseHistory.forEach(element => {
            seriousCases.push(element.seriousCaseHistory);
            mildCases.push(element.mildCaseHistory);
            var date=element.date.toString().substr(8, 2).replace(/ /g,'');
            dates.push(date.toString());
        });
    }
    res.render('caseHistory',{title:'Case History',mildCases,seriousCases,dates})
})
hospitalRouter.get('/distributionStatus',authenticate.checkAuth,async(req,res)=>{
    if(req.user.level===3||req.user.level===2||req.user.level===4){
        return  res.status(403).send("you are not permitted to perform the task..!")
    }
    const childs=await User.find({level:{$ne:3},owner:req.user._id});
    res.render('status',{title:'Distribution Status',childs})
})
hospitalRouter.get('/distributionStatusHistory',authenticate.checkAuth,async(req,res)=>{
    if(req.user.level===3||req.user.level===2||req.user.level===4){
        return  res.status(403).send("you are not permitted to perform the task..!")
    }
    const childs=await User.find({level:{$ne:3},owner:req.user._id});
    res.render('statusHistory',{title:'Distribution Status',childs})
})
module.exports=hospitalRouter;