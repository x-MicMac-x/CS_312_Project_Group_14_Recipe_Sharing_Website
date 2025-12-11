
global.users = global.users || [];

export const signupPage = (req, res) => {
  res.render("signup");
};

export const signup = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password required");
  }

  const existing = global.users.find(u => u.username === username);
  if (existing) {
    return res.status(400).send("Username already taken");
  }
  global.users.push({ username, password });

  console.log("Current users:", global.users);

  res.redirect("/login");
};
