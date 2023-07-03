const express = require('express')
const handlebars = require('express-handlebars')
const mongoose = require('mongoose')
const app = express()
const porta = 8081
const admin = require("./routes/admin")
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Posts")
const Post = mongoose.model("posts")
require("./models/Category")
const Category = mongoose.model("categories")
const users = require("./routes/user")
const passport = require('passport')
require("./config/auth")(passport)

// Configuration

app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use((req, res, next) =>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.engine('handlebars', handlebars.engine({defautLayout: 'main',}))
app.set('view engine', 'handlebars')

// Mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/blogApp").then(() =>{
    console.log("MongoDB connected")
}).catch((err) =>{
    console.log(`Unexpected error ${err}`)
})

//Public
app.use(express.static(path.join(__dirname + "/public")))

// Rotas
app.get("/", (req, res) =>{
    Post.find().lean().populate("category").sort({data: "desc"}).then((posts) =>{
        res.render("index", {posts: posts})
    }).catch((err) =>{
        req.flash("error_msg", "There was an internal error")
        res.redirect("/404")
    })
})

app.get("/404", (req, res) =>{
    res.send("Error 404")
})

app.get("/post/:slug", (req, res) =>{
    Post.findOne({slug: req.params.slug}).lean().then((post) =>{
        if(post){
            res.render("post/index", {post: post})
        }else{
            req.flash("error_msg", "This post doesnt exist")
            res.redirect("/")
        }
    }).catch((err) =>{
        req.flash("error_msg", "There was an internal error")
        res.redirect("/")
    })
})

app.get("/categories", (req, res) =>{
    Category.find().lean().then((categories) =>{
        res.render("categories/index", {categories: categories})
    }).catch((err) =>{
        req.flash("error_msg", "There was an internal error")
        res.redirect("/")
    })
})

app.get("/categories/:slug", (req, res) =>{
    Category.findOne({slug: req.params.slug}).lean().then((category) =>{
        if(category){
            Post.find({category: category._id}).lean().then((posts) =>{
                res.render("categories/posts", {posts: posts, category: category})
            }).catch((err) =>{
                req.flash("error_msg", "There was an error listing the posts")
            })

        }else{
            req.flash("error_msg", "This category doesnt exist")
            res.redirect("/")
        }
    }).catch((err) =>{
        req.flash("error_msg", "There was an internal error loading the category, please try again")
    })
})

app.use("/admin", admin)
app.use("/users", users)

// Outros
app.listen(porta, () => {
    console.log('Server connected in http://localhost:8081')
})