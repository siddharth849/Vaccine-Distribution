const mongoose=require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema= new mongoose.Schema({
    level:{
        type:Number,
        required:true,
        trim:true,
    },
    owner:{
        type: mongoose.Types.ObjectId,
        ref: "userSchema"
    },
    seriousCases:{
        type:Number,
        default:0
    },
    mildCases:{
        type:Number,
        default:0
    },
    vaccines:{
        type:Number,
        default:0
    },
    vaccineHistory:[{
            receivedVaccines:{
                type:Number
            },
            date:{
                type:Date,
                default: Date.now
            }
    }],
    vaccineReceivedPatient:{
        type:Number,
        default:0
    },
    totalReceivedVaccines:{
        type:Number,
        default:0
    },
    caseHistory:[{
            seriousCaseHistory:{
                type:Number
            },
            mildCaseHistory:{
                type:Number
            },
            date:{
                type:Date,
                default: Date.now
            }
    }],
    tokens:[{
        token:{
            type:String,
        }
    }]
},{
    timestamps:true
})
userSchema.plugin(passportLocalMongoose);
const User=mongoose.model('user',userSchema);
module.exports=User;