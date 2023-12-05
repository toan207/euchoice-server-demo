const express = require('express');
const router = express.Router();
const Session = require('../schema').models.Session;

const passport = require('passport');
const passportConfig = require('../middlewares/passport');

const { JWT_SECRET } = require('../configs/index');
const JWT = require('jsonwebtoken');

const encodedToken = (userId) => {
  return JWT.sign({
    iss: 'Bui Duc Toan',
    sub: userId,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 3)
  }, JWT_SECRET);
}

router.route('/signIn').post(passport.authenticate('local', { session: false }), async (req, res, next) => {
  const token = encodedToken(req.user._id);

  await Session.create({
    cookie: 'Bearer ' + token,
    expired: new Date().setDate(new Date().getDate() + 3),
  })

  res.setHeader('Authorization', 'Bearer ' + token);
  return res.json({ success: true, message: "Login success!", data: { token: 'Bearer ' + token } });
})


router.route('/adminSignIn').post(passport.authenticate('local', { session: false }), async (req, res, next) => {
  const token = encodedToken(req.user._id);
  if (req.user.role == 'user') return res.json({ success: false, message: "Admin role required!" });

  await Session.create({
    cookie: 'Bearer ' + token,
    expired: new Date().setDate(new Date().getDate() + 3),
  })

  res.setHeader('Authorization', 'Bearer ' + token);
  return res.json({ success: true, message: "Login success!", data: { token: 'Bearer ' + token } });
})

module.exports = router;
