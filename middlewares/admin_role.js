module.exports = (req, res, next) => {
    if (req.user.role === 'admin') {
        next();
    } else return res.json({ success: false, message: 'Admin role is required!' });
}