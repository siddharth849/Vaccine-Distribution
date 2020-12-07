const url = 'mongodb://localhost/Vaccine';
const mongoose=require('mongoose');
const connect=mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
connect.then((db)=>{
    console.log('database is connected correctly to server!');
}).catch((err)=>{
    console.log(err)
})
