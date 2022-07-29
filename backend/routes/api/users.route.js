import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {check, validationResult} from "express-validator";
import User from "../../models/User.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

//@route  POST api/users/signup
//@desc   Register user
//@access Public
router.post(
    "/signup",
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({min:6}),
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
        const {email, password, username} = req.body;

        try {
            
            let user = await User.findOne({email: email});
            if(user){
                return res.status(400).json({message: "User already exists"});
            }
            
            user = new User({email, password, username});
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();
            const payload = {
              email: user.email,
              userId: user._id
            };
            jwt.sign(payload, "mysecrettoken", { expiresIn: "1h" }, (err, token) =>{
                if(err) throw err;
                res.json({               
                  token: token,
                  userId: user._id
                });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

// @route    GET api/users
// @desc     Get user by token
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route    GET api/users/alluser
// @desc     Get user by token
// @access   Private
router.get('/alluser', async (req, res) => {
    try {
      const user = await User.find();
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route    POST api/users/signin
// @desc     Authenticate user & get token
// @access   Public
router.post(
    '/signin',
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        let user = await User.findOne({ email });
  
        if (!user) {
          return res
            .status(400)
            .json({ message: 'Invalid Credentials' });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: 'Invalid Credentials' });
        }
  
  
        jwt.sign(
          {email: user.email, userId: user._id},
          "mysecrettoken",
          { expiresIn: "1h" },
          (err, token) => {
            if (err) throw err;
            res.json({               
                token: token,
                userId: user._id,
                expiresIn: 3600
            });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
);


export {router};