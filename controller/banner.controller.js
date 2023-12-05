const Banner = require('../schema').models.Banner;

async function list(req, res) {
    const { limit, page, top } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        main: { $ne: true },
        $or: [{ expired: { $gte: new Date() }, always: true }],
        hide: { $ne: true },
        delete: { $ne: true }
    }

    if (!!top) {
        query['main'] = true;
    }

    const banners = await Banner.find(query)
        .sort({ order: 1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Banner.countDocuments(query);

    res.json({
        success: true,
        data: banners,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function adminList(req, res) {
    const { limit, page, top } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        main: { $ne: true },
        delete: { $ne: true }
    }

    if (!!top) {
        query['main'] = true;
    }

    const banners = await Banner.find(query)
        .sort({ order: 1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Banner.countDocuments(query);

    res.json({
        success: true,
        data: banners,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function update(req, res) {
    const { _id } = req.params;
    const { name, expired, order, always } = req.body;

    const banner = await Banner.findOne({ _id });
    if (!banner) return res.status(404).json({ success: false, message: 'Not found banner!' });

    await Banner.updateOne({ _id }, {
        $set: {
            name, expired, order, always
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}


async function updateOrder(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        const banner = await Banner.findOne({ _id: listId[i] });
        if (!banner) return res.status(404).json({ success: false, message: 'Not found banner!' });

        await Banner.updateOne({ _id: listId[i] }, {
            $set: {
                order: i
            }
        });
    }

    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function info(req, res) {
    const { _id } = req.params;

    const banner = await Banner.findOne({ _id });

    return res.json({ success: true, data: banner });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await Banner.updateOne({ _id }, {
        $set: {
            delete: true,
        }
    });

    return res.json({ success: true, message: 'Deleted!' });
}

async function deleteItems(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        const item = await Banner.updateOne({ _id: listId[i] }, {
            $set: {
                delete: true,
            }
        });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

async function hide(req, res) {
    const { _id } = req.params;

    const banner = await Banner.findOne({ _id });
    if (!banner) return res.json({ success: false, message: 'Banner not found!' });

    const item = await Banner.updateOne({ _id }, {
        $set: {
            hide: !banner.hide,
        }
    });

    return res.json({ success: true, message: 'Hid!' });
}

async function always(req, res) {
    const { _id } = req.params;

    const banner = await Banner.findOne({ _id });
    if (!banner) return res.json({ success: false, message: 'Banner not found!' });

    const item = await Banner.updateOne({ _id }, {
        $set: {
            always: !banner.always,
        }
    });

    return res.json({ success: true, message: 'Updated!' });
}

module.exports = {
    list,
    update,
    info,
    deleteItem,
    hide,
    adminList,
    deleteItems,
    updateOrder,
    always,
}