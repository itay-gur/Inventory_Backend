const _ = require("lodash");
const config = require("config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const { User, validateUser } = require("../models/user");

router.post("/", async (req, res) => {
  try {
    // validation
    const { error } = validateUser(req.body);
    if (error)
      return res
        .status(400)
        .send({ isError: true, error: error.details[0].message });

    // check the email address
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .send({ isError: true, error: "User already registered." });

    // create new user
    user = new User(_.pick(req.body, ["name", "email", "password"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    // generate new token
    const token = jwt.sign(
      _.pick(user, ["id", "name", "email"]),
      config.get("jwtPrivateKey")
    );

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({ isError: false, user: _.pick(user, ["_id", "name", "email"]) });
  } catch (err) {
    res.status(500).send({ isError: true, error: err });
  }
});

module.exports = router;
