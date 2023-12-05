const ShippingInfo = require('../schema').models.ShippingInfo;
const Account = require('../schema').models.Account;

async function add(req, res) {
    const { name, address, phone_number, ward, provine, city, country, main } = req.body;
    const user = req.user._id;

    const ship = await ShippingInfo.findOne({ owner: user, default: true });
    let f = false;
    if (!ship) f = true;

    if (!!main) {
        await ShippingInfo.updateOne({ owner: user, default: true }, {
            $set: {
                default: false,
            }
        });
    }

    const newShippingInfo = new ShippingInfo({ name, address, phone_number, ward, provine, city, country, default: main || f, owner: user });
    newShippingInfo.save(newShippingInfo);

    return res.status(201).json({
        success: true,
        message: "Added shippingInfo to db!"
    });
}

async function list(req, res) {
    const user = req.user._id;

    const query = {
        owner: user,
        delete: { $ne: true }
    }

    const shippingInfos = await ShippingInfo.find(query)
        .populate('owner', '-password')
        .sort({ 'default': -1 });

    res.json({
        success: true,
        data: shippingInfos
    });
}

async function update(req, res) {
    const { _id } = req.params;
    const { name, address, phone_number, city, ward, provine, country, main } = req.body;
    const user = req.user._id;

    let shippingInfo = await ShippingInfo.findOne({ _id, owner: user });
    if (!shippingInfo) return res.status(404).json({ success: false, message: 'Not found shippingInfo!' });

    const ship = await ShippingInfo.findOne({ owner: user, default: true });
    let f = false;
    if (!ship) f = true;

    if (!!main) {
        await ShippingInfo.updateOne({ owner: user, default: true }, {
            $set: {
                default: false,
            }
        });
    }

    await ShippingInfo.updateOne({ _id }, {
        $set: {
            name, address, phone_number, ward, provine, city, country, default: main, owner: user
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function info(req, res) {
    const { _id } = req.params;

    const shippingInfo = await ShippingInfo.findOne({ _id });

    return res.json({ success: true, data: shippingInfo });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await ShippingInfo.updateOne({ _id }, {
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
        const item = await ShippingInfo.updateOne({ _id: listId[i] }, {
            $set: {
                delete: true,
            }
        });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

module.exports = {
    add,
    list,
    update,
    info,
    deleteItem,
    deleteItems,
}
