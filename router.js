const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./logger');
const upload = require('./upload');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const passport = require('passport');
const passportConfig = require('./middlewares/passport');

const editor_required = require('./middlewares/editor_role');
const admin_required = require('./middlewares/admin_role');
const session_checker = require('./middlewares/session');

const ApiRouter = require('./router/no_login.router');
const NeedLoginRouter = require('./router/need_login.router');
const AdminRouter = require('./router/admin.router');
const SignInRoute = require('./router/signIn.router');

const corsOptions = {
    origin: '*',
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.header(`Access-Control-Allow-Headers`, `Content-Type`);
    next();
})
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));

app.use(logger);
app.get('/api/test', (req, res) => {
    res.send('test');
})

// no need login
app.use('/api/v1', ApiRouter);

// Routes
app.get('/image/:imageName', require('./controller/image.controller').info);

app.post('/upload', upload.array('file'), require('./controller/image.controller').upload);

app.use('/api/v1/account', SignInRoute);
app.use(passport.authenticate('jwt', { session: false }));
app.use(session_checker);

// need login
app.use('/api/v1', NeedLoginRouter);

// editor required
app.use(editor_required);

// admin required
app.use(admin_required);

app.use('/api/v1', AdminRouter);
//
app.use((err, req, res, next) => {
    console.log(err);
})

module.exports = app;
