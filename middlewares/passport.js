const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require('passport-jwt');

const { JWT_SECRET } = require('../configs');
const Account = require('../schema').models.Account;

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
  secretOrKey: JWT_SECRET
}, async (payload, done) => {
  try {
    const account = await Account.findById(payload.sub);
    if (!account) return done(null, false);

    done(null, account);
  } catch (error) {
    done(error, false);
  }
}))

passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const account = await Account.findOne({ email });
    if (!account) return done(null, false);

    const checkedPwd = await account.isValidPassword(password);
    if (!checkedPwd) return done(null, false);

    const data = await Account.findOne({ email })
      .select({ email: 1, role: 1, warehouse: 1 });

    done(null, data);
  } catch (error) {
    done(error, false);
  }
}))
