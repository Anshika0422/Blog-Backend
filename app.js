require('dotenv').config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const  Blog = require("./models/blog")

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8002;

mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res, next) => {
    const allBlogs = await Blog.find({});
    try {
        res.render("home", {
            user: req.user,
            blogs: allBlogs,
        });
        return next(); // Move to the next middleware if needed
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).send("An error occurred while rendering the page.");
    }
    return next();
});


app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));