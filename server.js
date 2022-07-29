import express from "express";
import cors from "cors";
import connectDB from "./backend/config/db.js";
import {router as usersRouter} from "./backend/routes/api/users.route.js";
import {router as postsRouter} from "./backend/routes/api/posts.route.js";
import path from "path";

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join("uploads")));


app.use(cors());

// Define routes
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);


if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('./dist/my-messages/build'));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, './dist/my-messages', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));