import pool from "../database.js";

export const addComment = async (req, res) => {
  try {
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).send("You must be logged in to comment.");
    }

    const recipeId = req.params.id;
    const { content } = req.body;

    if (!content.trim()) {
      return res.status(400).send("Comment cannot be empty.");
    }

    // Fetch username for this userId
    const userResult = await pool.query(
      "SELECT username FROM users WHERE id = $1",
      [userId]
    );

    if (!userResult.rows.length) {
      return res.status(401).send("Invalid user.");
    }

    const username = userResult.rows[0].username;

    await pool.query(
      `INSERT INTO comments (recipe_id, user_id, username, content)
       VALUES ($1, $2, $3, $4)`,
      [recipeId, userId, username, content]
    );

    res.redirect(`/recipe/${recipeId}`);
  } catch (err) {
    console.error("❌ Add Comment Error:", err);
    res.status(500).send("Error adding comment");
  }
};

export const deleteComment = async (req, res) => {
  try {
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).send("You must be logged in to delete a comment.");
    }

    const commentId = req.params.commentId;

    // Delete only if the comment belongs to the logged-in user
    const result = await pool.query(
      `DELETE FROM comments WHERE id = $1 AND user_id = $2`,
      [commentId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).send("You can only delete your own comments.");
    }

    res.redirect("back");
  } catch (err) {
    console.error("❌ Delete Comment Error:", err);
    res.status(500).send("Error deleting comment");
  }
};

