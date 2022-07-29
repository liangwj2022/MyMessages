import express from "express";
import {check, validationResult} from "express-validator";
import User from "../../models/User.js";
import Post from "../../models/Post.js";
import auth from "../../middlewares/auth.js";
import fileUploader from "../../middlewares/file-uploader.js";

const router = express.Router();


// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
    '/',
    auth,
    fileUploader,
    check('title', 'Title is required').notEmpty(),
    check('content', 'Content is required').notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const url = req.protocol + "://" + req.get("host");
        const newPost = new Post({
          content: req.body.content,
          title: req.body.title,
          imagePath: url + "/uploads/" + req.file.filename,
          creator: req.userData.userId
        });
  
        const post = await newPost.save();
  
        res.json(post);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', 
    //auth,
    async (req, res) => {
    try {
      const pageSize = +req.query.pageSize; //+ to make string to number
      const currentPage = +req.query.page;
      let postQuery;
      if(pageSize && currentPage){
        //skip content of previous pages
        postQuery = await Post.find().skip(pageSize * (currentPage - 1)).limit(pageSize);
      }
      const posts = postQuery;
      const count = await Post.count();
      res.json({
        posts: posts,
        maxPosts: count
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});
  
  // @route    GET api/posts/:id
  // @desc     Get post by ID
  // @access   Private
router.get('/:id', 
    //auth, 
    async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.json(post);
    } catch (err) {
      console.error(err.message);
  
      res.status(500).send('Server Error');
    }
});

// @route    PUT api/posts/:id
// @desc     Update a post
// @access   Private
router.put('/:id', 
    auth, 
    fileUploader,
    async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
      
          // Check user
        if (post.creator.toString() !== req.userData.userId) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        let imagePath = req.body.imagePath;
        if(req.file){
          const url = req.protocol + "://" + req.get("host");
          imagePath = url + "/uploads/" + req.file.filename;
        }
        const newPost = new Post({
          _id: req.body._id,
          title: req.body.title,
          content: req.body.content,
          imagePath: imagePath,
          creator: req.userData.userId
        });
      
        await Post.updateOne(
          {
            _id: req.params.id,
            creator: req.userData.userId
          }, newPost);


        res.json({ message: 'Post updated' });
        } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        }
});


// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', 
    auth, 
    async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check user
      if (post.creator.toString() !== req.userData.userId) {
        return res.status(401).json({ message: 'User not authorized' });
      }
  
      await post.remove();
  
      res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err.message);
  
      res.status(500).send('Server Error');
    }
});

export {router};