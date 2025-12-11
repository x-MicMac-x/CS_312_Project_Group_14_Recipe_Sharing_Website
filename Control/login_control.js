import pool from "../database.js";

export const loginPage = (req, res) => {
  res.render("login"); // login.ejs view
};

export const signupPage = (req, res) => {
  res.render("signup"); // signup.ejs view
};

export const signupUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Please provide both username and password.");
  }

  try {
    // Check if username already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("Username already taken.");
    }

    // Insert new user
    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, password]
    );

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error signing up.");
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (!result.rows.length) {
      return res.status(400).send("Invalid username or password");
    }

    const user = result.rows[0];

    // Compare passwords
    if (user.password !== password) {
      return res.status(400).send("Invalid username or password");
    }

    // Set the cookie for authentication
  res.cookie("userId", user.id, {
  httpOnly: true, 
  maxAge: 1000 * 60 * 60 * 24 * 7,
  sameSite: "lax"
  });


    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
};

export const logout = (req, res) => {
  res.clearCookie("userId");
  res.redirect("/");
};



