const Order = require('../schema').models.Order;

async function setPackingStatus(orderId) {
    await Order.updateOne({ _id: orderId }, {
        $set: {
            status: 'packing'
        }
    });
}

async function setShippingStatus(orderId) {
    await Order.updateOne({ _id: orderId }, {
        $set: {
            status: 'shipping'
        }
    });
}

async function setDoneStatus(orderId) {
    await Order.updateOne({ _id: orderId }, {
        $set: {
            status: 'done'
        }
    });
}

async function setCancelStatus(orderId) {
    await Order.updateOne({ _id: orderId }, {
        $set: {
            status: 'cancel'
        }
    });
}

function MakeId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    const date = '' + new Date().getTime();
    result += date.slice(7);

    return result;
}

module.exports = {
    setPackingStatus,
    setShippingStatus,
    setDoneStatus,
    setCancelStatus,
    MakeId
}