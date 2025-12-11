import express from "express";
import pool from "../database.js";

const router = express.Router();

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

// Show profile page
router.get("/profile", async (req, res) => {
  const user = req.user;

  if (!user) return res.redirect("/login");

  try {
    // fetch user recipes
    const myRecipes = await pool.query(
      "SELECT id, title, cuisine FROM recipes WHERE created_by = $1",
      [user.id]
    );

    // fetch bookmarks
    const bookmarks = await pool.query(
      `SELECT r.id, r.title, r.cuisine
       FROM bookmarks b
       JOIN recipes r ON r.id = b.recipe_id
       WHERE b.user_id = $1`,
      [user.id]
    );

    res.render("profile", {
      user,
      myRecipes: myRecipes.rows,
      bookmarks: bookmarks.rows,
      formatDate
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
});

export default router;