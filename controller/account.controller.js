const Account = require('../schema').models.Account;
const Session = require('../schema').models.Session;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../configs');

async function register(req, res) {
    const { name, phone_number, email, password } = req.body;

    if (!password) return res.json({ success: false, message: 'password is required!' });

    const account = await Account.findOne({ email, delete: { $ne: true } });
    if (!!account)
        return res.status(403).json({
            success: false,
            message: "Email is exist!"
        });

    const newAccount = new Account({ name, phone_number, email, password });
    newAccount.save(newAccount);

    return res.status(201).json({
        success: true,
        message: "Added email to db!"
    });
}


async function addAccount(req, res) {
    const { name, phone_number, email, password } = req.body;

    if (!password) return res.json({ success: false, message: 'password is required!' });

    const account = await Account.findOne({ email });
    if (!!account)
        return res.status(403).json({
            success: false,
            message: "Email is exist!"
        });

    const newAccount = new Account({ name, phone_number, email, password });
    newAccount.save(newAccount);

    return res.status(201).json({
        success: true,
        message: "Added email to db!"
    });
}

async function list(req, res) {
    const { limit, page, all } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        hide: { $ne: true },
        delete: { $ne: true }
    };

    if (!!all && all == 'true') {
        lim = await Account.countDocuments();
    }

    const accounts = await Account.find(query)
        .select({ password: 0 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Account.countDocuments(query);

    res.json({
        success: true,
        data: accounts,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}


async function adminList(req, res) {
    const { limit, page, all } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        delete: { $ne: true }
    };

    if (!!all && all == 'true') {
        lim = await Account.countDocuments();
    }

    const accounts = await Account.find(query)
        .select({ password: 0 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Account.countDocuments(query);

    res.json({
        success: true,
        data: accounts,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function update(req, res) {
    const { name, phone_number, email, role } = req.body;
    let _id = req.body._id;

    if (req.user.role != 'admin') _id = req.user._id;

    const account = await Account.findOne({ _id });
    if (!account) return res.status(404).json({ success: false, message: 'Not found account!' });

    const check = await Account.findOne({ email, _id: { $ne: _id } });
    if (!!check) return res.status(400).json({ success: false, message: 'Email is exist!' });

    await Account.updateOne({ _id }, {
        $set: {
            name,
            email,
            role,
            phone_number,
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function adminChangePassword(req, res) {
    const { password, _id } = req.body;

    const account = await Account.findOne({ _id });
    if (!account) return res.status(404).json({ success: false, message: 'Not found account!' });

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    await Account.updateOne({ _id }, {
        $set: {
            password: passwordHashed
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function changePassword(req, res) {
    const { current_password, new_password, _id } = req.body;

    const user = req.user._id;

    const account = await Account.findOne({ _id: user });
    if (!account) return res.status(404).json({ success: false, message: 'Not found account!' });

    const checkedPwd = await account.isValidPassword(current_password);
    if (!checkedPwd) return res.status(400).json({ success: false, message: 'Old password is incorrect!' });

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(new_password, salt);

    await Account.updateOne({ _id }, {
        $set: {
            password: passwordHashed,
        }
    });
    return res.status(200).json({ success: true, message: 'Change password is success!' });
}

async function info(req, res) {
    const token = req.headers.authorization.split(' ')[1];

    const verify = jwt.verify(token, JWT_SECRET);

    const account = await Account
        .findOne({ _id: verify.sub })
        .select("-password");

    return res.json({ success: true, message: "Login success!", data: account });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await Account.updateOne({ _id }, {
        $set: {
            delete: true,
        }
    });

    return res.json({ success: true, message: 'Deleted!' });
}

async function hide(req, res) {
    const { _id } = req.params;

    const account = await Account.findOne({ _id });
    if (!account) return res.json({ success: false, message: 'Account not found!' });

    const item = await Account.updateOne({ _id }, {
        $set: {
            hide: !account.hide,
        }
    });

    return res.json({ success: true, message: 'Hid!' });
}

async function signout(req, res) {
    const cookie = req.headers.authorization;
    await Session.deleteOne({ cookie });

    return res.json({ success: true, message: 'Sign out is success!' })
}

module.exports = {
    addAccount,
    list,
    adminList,
    update,
    register,
    update,
    changePassword,
    info,
    deleteItem,
    hide,
    adminChangePassword,
    signout,
}