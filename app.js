const express = require('express');
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("index");
})

//protected route
app.get('/profile', isLoggedIn, async (req, res) => {
        //coz user store postid bt we want to display post content that's why populate is used

    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    res.render("profile", {user});
})

app.post('/post', isLoggedIn, async(req, res) => {
    let user = await userModel.findOne({email: req.user.email});
    //retrieving the content from
    let content = req.body.content;
    //creating of post
    let post = await postModel.create({
        user: user._id,
        content
    })

    //pushing postid into user post array
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.post('/register', async(req, res) => {
    //deconstructing
    let {email, name, password, username, age} = req.body;
    //if user is already present
    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("user already register");
    //creating salt for pass
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async(err, hash) => {
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password: hash
            })

            let token = jwt.sign({email: email, userid: user._id}, "shh");
            res.cookie("token", token);
            res.send("registered");
        })
    })
})


app.post('/login', async(req, res) => {
    let {email, password} = req.body;

    let user = await userModel.findOne({email});
    if( !user) return res.status(500).send("Something went wrong");
    
    //compare login pass with user registered pass 
    bcrypt.compare(password, user.password, (err, result) => {
        if(result){ 
            let token = jwt.sign({email: email, userid: user._id}, "shh");
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        }
        else res.redirect("/login");
    })
})

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect("/login");
})

//middleware
function isLoggedIn(req, res, next){
    if(req.cookies.token == "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "shh");
        req.user = data;
        next();
    }
}


app.listen(3000);