import pool from '../database.js';

// Home page: show all recipes
export const getRecipes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, cuisine, meal_type, difficulty, cooking_time
      FROM recipes
      ORDER BY created_at DESC
    `);

    res.render("index", { recipes: result.rows, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving recipes');
  }
};

// Recipe details page
export const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    const currentUser = req.user || null;

    //  Get recipe details
    const recipeRes = await pool.query(
      `SELECT *
       FROM recipes
       WHERE id = $1`,
      [id]
    );

    if (!recipeRes.rows.length) {
      return res.status(404).send("Recipe not found");
    }

    //  Get ingredients
    const ingredientsRes = await pool.query(
      `SELECT i.name
       FROM ingredients i
       JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = $1`,
      [id]
    );

    //  Get tags
    const tagsRes = await pool.query(
      `SELECT t.name
       FROM tags t
       JOIN recipe_tags rt ON t.id = rt.tag_id
       WHERE rt.recipe_id = $1`,
      [id]
    );

    //  NEW: Get comments
    const commentsRes = await pool.query(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    //  Bookmarks, does not currently work!

    /* const bookmarkRes = currentUser
      ? await pool.query(
          "SELECT 1 FROM bookmarks WHERE user_id=$1 AND recipe_id=$2",
          [currentUser.id, id]
        )
      : { rows: [] };

    const isBookmarked = bookmarkRes.rows.length > 0; */

    
    //  Render with comments added
    res.render("recipe", {
      recipe: {
        ...recipeRes.rows[0],
        //isBookmarked
      },
      ingredients: ingredientsRes.rows,
      tags: tagsRes.rows,
      comments: commentsRes.rows,
      user: currentUser
    });

  } catch (err) {
    console.error("❌ Error in getRecipeById:", err);
    res.status(500).send("Error retrieving recipe details");
  }
};

// GET /recipes/new — just show the form
export const newRecipeForm = (req, res) => {
  res.render("newRecipe", { user: req.user });
};

// POST /recipes — actually create the recipe
export const createRecipe = async (req, res) => {
  const { title, cuisine, meal_type, difficulty, cooking_time, instructions } = req.body;

  console.log("Current user:", req.user);

  try {
    await pool.query(
      `INSERT INTO recipes (title, cuisine, meal_type, difficulty, cooking_time, instructions)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, cuisine, meal_type, difficulty, cooking_time, instructions]
    );

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating recipe");
  }
};

// Add bookmark
export const addBookmark = async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("You must be logged in."); 

    const userId = req.user.id;  
    const recipeId = req.params.id;

    await pool.query(
      "INSERT INTO bookmarks (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
      [userId, recipeId]
    );

    res.redirect(`/recipe/${recipeId}`);
  } catch (err) {
    console.error("❌ Bookmark Error:", err);
    res.status(500).send("Error bookmarking recipe");
  }
};

// Remove bookmark
export const removeBookmark = async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("You must be logged in.");

    const userId = req.user.id;
    const recipeId = req.params.id;

    await pool.query(
      "DELETE FROM bookmarks WHERE user_id = $1 AND recipe_id = $2;",
      [userId, recipeId]
    );

    res.redirect(`/recipe/${recipeId}`);
  } catch (err) {
    console.error("❌ Remove Bookmark Error:", err);
    res.status(500).send("Error removing bookmark");
  }
};

// User profile
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch user info
    const userRes = await pool.query(
      "SELECT id, username, bio, created_at FROM users WHERE username=$1",
      [username]
    );
    if (!userRes.rows.length) return res.status(404).send("User not found");

    const userId = userRes.rows[0].id;

    // Fetch user's recipes
    const recipesRes = await pool.query(
      "SELECT * FROM recipes ORDER BY created_at DESC"
    );

    // Fetch saved/bookmarked recipes
    const savesRes = await pool.query(
      `SELECT r.* FROM recipes r
       JOIN bookmarks b ON r.id = b.recipe_id
       WHERE b.user_id = $1`,
      [userId]
    );

    res.render("profile", {
      profile: userRes.rows[0],
      recipes: recipesRes.rows,
      savedRecipes: savesRes.rows,
      user: req.user
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
};

export const searchRecipes = async (req, res) => {
  const q = req.query.q;  // get the search term from the form

  try {
    const results = await pool.query(
      `SELECT * FROM recipes
       WHERE title ILIKE $1 OR cuisine ILIKE $1`,
      [`%${q}%`]
    );

    res.render("searchResults", { results: results.rows, query: q });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Server error");
  }
};
