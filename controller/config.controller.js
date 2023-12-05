const Config = require('../schema').models.Config;

const ConfigType = {
    profile: 'profile',
}

async function editProfile(req, res) {
    const { htmlString } = req.body;
    let conf = await Config.findOne({ type: ConfigType.profile });

    if (!conf) {
        await Config.create({ type: ConfigType.profile, htmlString });
    }
    else {
        await Config.updateOne({ type: ConfigType.profile }, {
            $set: {
                htmlString,
            }
        });
    }
    return res.json({ success: true, message: 'Updated!' });
}


async function profile(req, res) {
    let conf = await Config.findOne({ type: ConfigType.profile });

    if (!conf) {
        await Config.create({ type: ConfigType.profile });
        conf = await Config.findOne({ type: ConfigType.profile });
    }

    return res.json({ success: true, data: conf });
}

module.exports = {
    editProfile,
    profile
}