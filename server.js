import express from 'express';
import pool from './database.js';
import loginRoutes from './routes/login_routes.js';
import recipeRoutes from './routes/recipe_routes.js';
import commentRoutes from "./routes/comment_routes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Middleware to load user from cookie and set res.locals.user for EJS
app.use(async (req, res, next) => {
  const userId = req.cookies.userId;

  if (!userId) {
    req.user = null;
    res.locals.user = null;
    return next();
  }

  try {
    const result = await pool.query(
      "SELECT id, username FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      req.user = null;
      res.locals.user = null;
    } else {
      req.user = result.rows[0];
      res.locals.user = result.rows[0];
    }
    next();
  } catch (err) {
    console.error("Error loading user from cookie:", err);
    req.user = null;
    res.locals.user = null;
    next();
  }
});

app.use('/', recipeRoutes);
app.use('/', loginRoutes);
app.use('/', commentRoutes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
