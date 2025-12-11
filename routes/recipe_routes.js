import express from "express";

import { 
  createRecipe,
  getRecipes,
  getRecipeById,
  addBookmark,
  removeBookmark,
  newRecipeForm,
  searchRecipes    // ← import this
} from "../Control/recipe_control.js";

import { addComment } from "../Control/comment_control.js";

const router = express.Router();

// Home page — list all recipes
router.get("/", getRecipes);

// Search page / results
router.get("/search", searchRecipes);

// Create recipe
router.post("/recipes", createRecipe);

// Add recipe form page
router.get("/recipes/new", newRecipeForm);

// Recipe details
router.get("/recipe/:id", getRecipeById);

// Create a comment
router.post("/recipe/:id/comments", addComment);

// Add bookmark
router.post("/add/:id", addBookmark);

// Remove bookmark
router.post("/remove/:id", removeBookmark);

export default router;
