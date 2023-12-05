const News = require('../schema').models.News;

async function add(req, res) {
    const { title, content, image, brief } = req.body;

    const newNews = new News({ title, content, image, brief });
    const info = newNews.save(newNews);

    return res.status(201).json({
        success: true,
        message: "Added news to db!",
        data: info
    });
}

async function list(req, res) {
    const { limit, page, all, key } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        hide: { $ne: true },
        delete: { $ne: true },
        title: { $regex: key || "", $options: "i" },
    };

    if (!!all && all == 'true') {
        lim = await News.countDocuments();
    }

    const news = await News.find(query)
        .select({ content: 0 })
        .sort({ "createdAt": -1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await News.countDocuments(query);

    res.json({
        success: true,
        data: news,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function adminList(req, res) {
    const { limit, page, all, key } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        delete: { $ne: true },
        title: { $regex: key || "", $options: "i" },
    };

    if (!!all && all == 'true') {
        lim = await News.countDocuments();
    }

    const news = await News.find(query)
        .select({ content: 0 })
        .sort({ "createdAt": -1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await News.countDocuments(query);

    res.json({
        success: true,
        data: news,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function update(req, res) {
    const { _id } = req.params;
    const { title, content, image, brief } = req.body;

    const news = await News.findOne({ _id });
    if (!news) return res.status(404).json({ success: false, message: 'Not found news!' });

    await News.updateOne({ _id }, {
        $set: {
            title, content, image, brief
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function info(req, res) {
    const { _id } = req.params;

    const news = await News.findOne({ _id });

    return res.json({ success: true, data: news });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await News.updateOne({ _id }, {
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
        const item = await News.updateOne({ _id: listId[i] }, {
            $set: {
                delete: true,
            }
        });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

async function hide(req, res) {
    const { _id } = req.params;

    const news = await News.findOne({ _id });
    if (!news) return res.json({ success: false, message: 'News not found!' });

    const item = await News.updateOne({ _id }, {
        $set: {
            hide: !news.hide,
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