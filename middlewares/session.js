const Session = require('../schema').models.Session;

module.exports = async (req, res, next) => {
    const cookie = req.headers.authorization;
    const session = await Session.findOne({ cookie });
    const now = new Date();

    if (!session) return res.status(500).json({ success: false, message: 'Cookie is invalid!' });
    if (session.expired < now) return res.status(500).json({ success: false, message: 'Cookie is outdate!' });

    next();
}