const express = require("express")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const upload = require('express-fileupload')
const cloudinary = require('cloudinary').v2;
const app = express();
const PORT = 3000;

cloudinary.coonfig({
  cloud_name:"",
  api_key:"",
  api_secret:""
});

app.use(upload({useTempFiles:true}));
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.connection.on('connected',()=>{
  console.log("connected to mongo");
});
mongoose.connection.on('error',(err)=>{
  console.log("err connecting",err);
});


const {ObjectId} = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
  username:{
    type:String,
    required: true
  },
  email:{
    type:String
  },
  password:{
    type:String
  },
  photo:String,
  dob:Date,

})

mongoose.model("User",userSchema);
const User = mongoose.model("User")


// <------------------- ROUTES ---------------------->

app.listen(PORT, ()=>{
  console.log("server is running on",PORT);
});

app.get("/",(req,res)=>{
  res.sendFile(__dirname+"/index.html");
})

app.post("/signup", function(req,res){
  var photo
  var url
  username = req.body.name.toLowerCase()
    User.findOne({email:req.body.email})
    .then((savedUser)=>{
      if(savedUser){
        return res.status(422).json({error:"User already exists with that email"})
      }
      if(req.files){
        photo = req.files.photo;
        cloudinary.uploader.upload(photo.tempFilePath, (err, result)=>{
          if(result){
            url = result.url;
          }else{
            console.log(err)
          }
        });
    }
    bcrypt.hash(req.body.password,13)
    .then(hashedpassword=>{
      const user = new User({
        username:username,
        password:hashedpassword,
        email:req.body.email,
        photo:url,
        dob:req.body.dob
      })
      console.log(user);
      user.save()
      })
    })
});

app.post("/signin", function(req,res){
  if(req.body.name){
    username = req.body.username.toLowerCase()
    User.findOne({username:username})
    .then(savedUser=>{
      if(!savedUser){
        return res.status(422).json({error:"Invalid username or password"})
      }
      bcrypt.compare(req.body.password,savedUser.password)
      .then(doMatch=>{
        if(doMatch){
          // res.json({message:"Successfully signed in"})
          const token = jwt.sign({_id:savedUser._id},"SECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRET")
          res.json({token})
        }
        else{
          return res.status(422).json({error:"Invalid username or password"})
        }
      })
      .catch(err=>{
        console.log(err)
      })
    })
  }else{
    User.findOne({email:req.body.email})
    .then(savedUser=>{
      if(!savedUser){
        return res.status(422).json({error:"Invalid username or password"})
      }
      bcrypt.compare(req.body.password,savedUser.password)
      .then(doMatch=>{
        if(doMatch){
          // res.json({message:"Successfully signed in"})
          const token = jwt.sign({_id:savedUser._id},"SECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRET")
          res.json({token})
        }
        else{
          return res.status(422).json({error:"Invalid username or password"})
        }
      })
      .catch(err=>{
        console.log(err)
      })
    })
  }

});

//<------------------- functions ------------------------>

 function middleware(req,res){
  const {authorization} = req.headers
  if(!authorization){
  return  res.status(401).json({error:"You must be logged in"})
  }
  const token = authorization.replace("Bearer ","")
  jwt.verify(token,JWT_SECRET,(err,payload)=>{
    if(err){
      return  res.status(401).json({error:"You must be logged in"})
    }

  })

}
