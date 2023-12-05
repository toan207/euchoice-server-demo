module.exports = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'editor') {
        next();
    } else return res.json({ success: false, message: 'Admin role is required!' });
}