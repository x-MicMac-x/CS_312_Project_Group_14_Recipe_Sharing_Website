import express from "express";
import pool from "../database.js";
import bcrypt from "bcrypt";

const router = express.Router();

// REGISTER PAGE
router.get("/register", (req, res) => {
    res.render("register");
});

// REGISTER USER
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
            [username, hashedPassword]
        );

        req.session.user = result.rows[0];
        res.redirect("/profile");

    } catch (err) {
        console.error(err);
        res.send("Registration error");
    }
});

router.get("/profile", async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect("/login");

  const myRecipes = await pool.query(
    "SELECT id, title FROM recipes WHERE created_by = $1",
    [user.id]
  );

  const bookmarks = await pool.query(
    `SELECT r.id, r.title
     FROM bookmarks b
     JOIN recipes r ON b.recipe_id = r.id
     WHERE b.user_id = $1`,
    [user.id]
  );

  res.render("profile", {
    user,
    myRecipes: myRecipes.rows,
    bookmarks: bookmarks.rows
  });
});


// LOGIN PAGE
router.get("/login", (req, res) => {
    res.render("login");
});

// LOGIN USER
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username=$1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.send("No user found");
        }

        const user = result.rows[0];
        const passwordMatch = (password === user.password);


        

        req.session.user = { id: user.id, username: user.username };
        res.redirect("/profile");

    } catch (err) {
        console.error(err);
        res.send("Login error");
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

export default router;
