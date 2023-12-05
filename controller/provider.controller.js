const Provider = require('../schema').models.Provider;

async function add(req, res) {
    const { name } = req.body;

    if (!name) return res.status(403).json({
        success: false,
        message: "Name is required!"
    });

    const newProvider = new Provider({ name });
    newProvider.save(newProvider);

    return res.status(201).json({
        success: true,
        message: "Added provider to db!"
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
        lim = await Provider.countDocuments();
    }

    const providers = await Provider.find(query)
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Provider.countDocuments(query);

    res.json({
        success: true,
        data: providers,
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
        lim = await Provider.countDocuments();
    }

    const providers = await Provider.find(query)
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Provider.countDocuments(query);

    res.json({
        success: true,
        data: providers,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function update(req, res) {
    const { _id } = req.params;
    const { name } = req.body;

    const provider = await Provider.findOne({ _id });
    if (!provider) return res.status(404).json({ success: false, message: 'Not found provider!' });

    await Provider.updateOne({ _id }, {
        $set: {
            name
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function info(req, res) {
    const { _id } = req.params;

    const provider = await Provider.findOne({ _id });

    return res.json({ success: true, data: provider });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await Provider.updateOne({ _id }, {
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
        const item = await Provider.updateOne({ _id: listId[i] }, {
            $set: {
                delete: true,
            }
        });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

async function hide(req, res) {
    const { _id } = req.params;

    const provider = await Provider.findOne({ _id });
    if (!provider) return res.json({ success: false, message: 'Provider not found!' });

    const item = await Provider.updateOne({ _id }, {
        $set: {
            hide: !provider.hide,
        }
    });

    return res.json({ success: true, message: 'Hid!' });
}

module.exports = {
    add,
    list,
    update,
    info,
    deleteItem,
    hide,
    adminList,
    deleteItems,
}