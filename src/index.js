const express=require('express');
const path=require('path')
require('./db/mongoose')
const userRouter=require('./routes/user');
const hospitalRouter=require('./routes/hospital')
const expressLayout=require('express-ejs-layouts');
const passport = require('passport');
const cookieParser=require('cookie-parser')
const session=require('express-session')
const flash=require('connect-flash')
const authenticate=require('./middleware/authenticate')

port=3000;
app=express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser('thisIsASecrethfguysgbr89w7r9wsdjfbsf'))
app.use(express.static(path.join(__dirname,'../public')));

// set the view engine to ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

app.use(expressLayout);
// extract style and scripts from sub pages into the layout
app.set('layout extractStyles',true);
app.set('layout extractScript',true);




//for flash msgs
 app.use(session({      //this will set a cookie to track session i.e in our case msg. and we never destroys it
                        // as we want to send msgs always secondaly it do not contain any sensitve data just msgs.
    secret:'sdjfbjsdhskuyyeuwhwe53957wejkfbjh87',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());

//global vars for messages for views
app.use((req,res,next)=>{
    [res.locals.success_msg]=req.flash('success');
    [res.locals.error_msg]=req.flash('error');
    console.log(res.locals.error_msg)
    next()
})


//for passprot based auth
app.use(passport.initialize());

app.use('/users',userRouter);
app.use('/hospitals',hospitalRouter);

app.get('/',authenticate.setAuthenticatedUser,(req,res)=>{
    res.render('home',{title:"Home"});
})

app.listen(port,()=>{
    console.log('your port is running on port no.'+port);
})
