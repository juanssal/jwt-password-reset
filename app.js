// --------IMPORTS---------------
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
// --------END IMPORTS---------------

// ----------DUMMY DATABASE----------
// Below should actually come from an actual database like postgres
let user = {
  id: "sqjkdhkjhkqsd",
  email: "john@mccheese.com",
  password: "qksdjfhsdkfhsdkfj",
};
// ----------END OF DUMMY DATABASE----------

// Below should actually be in a .env file
const JWT_SECRET = "some super secret";

// ----------MIDDLEWARE------------
// Below helps us treat json data, otherwise it'll provide an error when reading req.body
app.use(express.json());
// below helps us use req.body data
app.use(express.urlencoded({ extended: false }));
// below helps us use ejs templates
app.set("view engine", "ejs");
// ----------END MIDDLEWARE------------

// ----------ROUTES--------------------
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/forgot-password", (req, res, next) => {
  res.render("forgot-password");
});

app.post("/forgot-password", (req, res, next) => {
  // extracts email from input and calls it email
  const { email } = req.body;
  //   check if email exists, we only have one email so easy-peazy, othewise we use the users.find method
  if (email !== user.email) {
    res.send("user not registered");
    return;
  }
  // user exists and now create a link
  // ----------JWT MAGIC--------------
  const secret = JWT_SECRET + user.password;
  // info that will give the JWT its identity, I could add other info like admin_credentials, etc..
  const payload = {
    email: user.email,
    id: user.id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15min" });
  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
  console.log(link);
  // ----------END OF JWT MAGIC--------------
  res.send("Password reset link has been sent");
});

app.get("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;
  // check if id exists
  if (id !== user.id) {
    res.send("Invalid Id");
    return;
  }
  // we have id and valid user
  try {
    const secret = JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);
    res.render("reset-password", { email: user.email });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

app.post("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  // check if id exists
  if (id !== user.id) {
    res.send("Invalid id ...");
    return;
  }
  try {
    // we declare below variables and never use them, but if there was an error, the code would stop and spit an error out.
    const secret = JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);
    // always hash password
    user.password = password;
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.send("Link is invalid, please try a new one...");
  }
});
// ---------- END OF ROUTES--------------------

app.listen(3000, () => console.log("sever on localhost:3000"));
