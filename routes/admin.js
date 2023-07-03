const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Category")
const Category = mongoose.model("categories")
require("../models/Posts")
const Post = mongoose.model("posts")
const {isAdmin} = require("../helpers/isAdmin")

router.get('/', isAdmin, (req, res) =>{
    res.render("./admin/index")
})

router.get('/categories', isAdmin, (req, res) =>{
    Category.find().lean().sort({date:'desc'}).then((categories) =>{
        res.render("./admin/categories", {categories: categories})
    }).catch((err) =>{
        req.flash("error_msg", "There was an error listing the categories")
        res.redirect("/admin")
    })
})

router.get('/categories/add', isAdmin, (req, res) =>{
    res.render("./admin/addCategories")
})

router.post('/categories/new', isAdmin, (req, res) =>{
    var errors = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Invalid name"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: "Invalid slug"})
    }

    if(errors.length != 0){
        res.render("admin/addCategories", {errors: errors})
    } else{
        const newCategory = {
            name: req.body.name,
            slug: req.body.slug
        }
    
        new Category(newCategory).save().then(() =>{
            req.flash("success_msg", "Category created")
            res.redirect("/admin/categories")
        }).catch((err) =>{
            req.flash("error_msg", "There was an error saving the category, please try again")
            res.redirect("/admin")
        })
    }
})

router.get("/categories/edit/:id", isAdmin, (req, res) =>{
    Category.findOne({_id: req.params.id}).lean().then((category) =>{
        res.render("admin/editCategories", {category: category})
    }).catch((err) =>{
        req.flash("error_msg", "This category doesnt exist")
        res.redirect("/admin/categories")
    })
})

router.post("/categories/edit", isAdmin, (req, res) =>{
    Category.findOne({_id: req.body.id}).then((category) =>{
        category.name = req.body.name
        category.slug = req.body.slug

        category.save().then(() =>{
            req.flash("success_msg", "Editing category successfully")
            res.redirect("/admin/categories")
        }).catch((err) =>{
            req.flash("error_msg", "There was an error saving the category edit, please try again")
            res.redirect("/admin/categories")
        })
    }).catch((err) =>{
        req.flash("error_msg", "There was an error editing the category, please try again")
        res.redirect("/admin/categories")
    })
})

router.post("/categories/delete", isAdmin, (req, res) =>{
    Category.deleteOne({_id: req.body.id}).then(() =>{
        req.flash("success_msg", "Category deleted successfully ")
        res.redirect("/admin/categories")
    }).catch((err) =>{
        req.flash("error_msg", "There was an error deleting the category, please try again")
        res.redirect("/admin/categories")
    })
})

router.get("/posts", isAdmin, (req, res) =>{
    Post.find().lean().populate("category").sort({date: "desc"}).then((posts) =>{
        res.render("./admin/posts", {posts: posts})
    }).catch((err) =>{
        req.flash("error_msg", "There was an error listing posts")
        res.redirect("/admin")
    })
})

router.get("/posts/add", isAdmin, (req, res) =>{
    Category.find().lean().then((categories) =>{
        res.render("admin/addPost", {categories: categories})
    }).catch((err) =>{
        req.flash("error_msg", "There was an error loading the form")
        res.redirect("/admin")
    })
})

router.post("/posts/new", isAdmin, (req, res) =>{
    var errors = []

    if(req.body.category == "0"){
        errors.push({text: "Register a category"})
    }
    if(errors.length > 0){
        res.render("admin/addPost", {errors: errors})
    }else{
        const newPost = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category,
            slug: req.body.slug
        }

        new Post(newPost).save().then(() =>{
            req.flash("success_msg", "Created post successfully")
            res.redirect("/admin/posts")
        }).catch((err) =>{
            req.flash("error_msg", "There was an error saving the post, please try again")
            res.redirect("/admin/posts")
        })
    }
})

router.get("/posts/edit/:id", isAdmin, (req, res) =>{
    Post.findOne({_id: req.params.id}).lean().then((post) =>{
        Category.find().lean().then((categories) =>{
            res.render("admin/editPosts", {categories: categories, post: post})
        }).catch((err) =>{
            req.flash("error_msg", "There was an error loading the categories, please try again")
            res.redirect("/admin/posts")  
        })

    }).catch((err) =>{
        req.flash("error_msg", "There was an error loading the form edit, please try again")
        res.redirect("/admin/posts")
    })
})

router.post("/posts/edit", isAdmin, (req, res) =>{
    
    Post.findOne({_id: req.body.id}).then((post) =>{
        post.title = req.body.title
        post.slug = req.body.slug
        post.description = req.body.description
        post.content = req.body.content
        post.category = req.body.category

        post.save().then(() =>{
            req.flash("success_msg", "Editing post successfully")
            res.redirect("/admin/posts")
        }).catch((err) =>{
            req.flash("error_msg", "Internal error")
            res.redirect("/admin/posts")
        })
    }).catch((err) =>{
        console.log(err)
        req.flash("error_msg", "There was an error editing the post, please try again")
        res.redirect("/admin/posts")
    })
})

router.get("/posts/delete/:id", isAdmin, (req, res) =>{
    Post.findByIdAndRemove({_id: req.params.id}).lean().then(() =>{
        req.flash("success_msg", "Post deleted successfully")
        res.redirect("/admin/posts")
    }).catch((err) =>{
        req.flash("error_msg", "There was an error deleting the post, please try again")
        res.redirect("/admin/posts")
    })
})

module.exports = router