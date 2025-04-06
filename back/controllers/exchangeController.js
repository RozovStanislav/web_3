// controllers/exchangeController.js
const { ExchangeRequest, Item, User } = require('../models');

exports.createExchangeRequest = async (req, res) => {
    try {
        const { senderId, receiverId, senderItemId, receiverItemId } = req.body;
        const exchangeRequest = await ExchangeRequest.create({
            sender_id: senderId,
            receiver_id: receiverId,
            sender_item_id: senderItemId,
            receiver_item_id: receiverItemId,
            status: 'pending'
        });
        res.status(201).json(exchangeRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateExchangeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const exchangeRequest = await ExchangeRequest.findByPk(id);
        if (!exchangeRequest) {
            return res.status(404).json({ error: 'Exchange request not found' });
        }
        exchangeRequest.status = status;
        await exchangeRequest.save();
        res.status(200).json(exchangeRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
