const Warehouse = require('../schema').models.Warehouse;
const Account = require('../schema').models.Account;

async function add(req, res) {
    const { name, address, city, manager, country } = req.body;

    if (!name) return res.status(403).json({
        success: false,
        message: "Name is required!"
    });

    const warehouse = await Warehouse.findOne({ name });
    if (!!warehouse)
        return res.status(403).json({
            success: false,
            message: "Name is exist!"
        });

    const account = await Account.findOne({ _id: manager });
    if (!account) return res.status(404).json({ success: false, message: 'Not found account!' });

    const newWarehouse = new Warehouse({ name, address, city, country, manager });
    newWarehouse.save(newWarehouse);

    await Account.updateOne({ _id: manager }, {
        $set: {
            warehouse
        }
    });

    return res.status(201).json({
        success: true,
        message: "Added warehouse to db!"
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
        lim = await Warehouse.countDocuments();
    }

    const warehouses = await Warehouse.find(query)
        .populate('manager', '-password')
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Warehouse.countDocuments(query);

    res.json({
        success: true,
        data: warehouses,
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

    if (req.user.role === 'editor') {
        query['_id'] = req.user.warehouse;
    }

    if (!!all && all == 'true') {
        lim = await Warehouse.countDocuments();
    }

    const warehouses = await Warehouse.find(query)
        .populate('manager', '-password')
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Warehouse.countDocuments(query);

    res.json({
        success: true,
        data: warehouses,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function update(req, res) {
    const { _id } = req.params;
    const { name, address, city, country, manager } = req.body;

    let warehouse = await Warehouse.findOne({ _id });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Not found warehouse!' });

    warehouse = await Warehouse.findOne({ name, _id: { $ne: warehouse._id } });
    if (!!warehouse)
        return res.status(403).json({
            success: false,
            message: "Name is exist!"
        });

    const account = await Account.findOne({ _id: manager, warehouse: null });
    if (!account) return res.status(404).json({ success: false, message: 'Not found account!' });

    await Warehouse.updateOne({ _id }, {
        $set: {
            name, address, city, country, manager
        }
    });

    await Account.updateOne({ _id: manager }, {
        $set: {
            warehouse
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function info(req, res) {
    const { _id } = req.params;

    const warehouse = await Warehouse.findOne({ _id });

    return res.json({ success: true, data: warehouse });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await Warehouse.updateOne({ _id }, {
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
        const item = await Warehouse.updateOne({ _id: listId[i] }, {
            $set: {
                delete: true,
            }
        });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

async function hide(req, res) {
    const { _id } = req.params;

    const warehouse = await Warehouse.findOne({ _id });
    if (!warehouse) return res.json({ success: false, message: 'Warehouse not found!' });

    const item = await Warehouse.updateOne({ _id }, {
        $set: {
            hide: !warehouse.hide,
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