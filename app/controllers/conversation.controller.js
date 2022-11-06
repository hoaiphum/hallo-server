var Conversation = require('../models/conversation.model');

exports.list = (req, res) => {
    const userID = req.query.userID;

    Conversation.list(userID, (response) => {
        res.send({ data: response });
    });
};

exports.messenger = (req, res) => {
    const conversationID = req.query.conversationID;

    Conversation.messenger(conversationID, (response) => {
        res.send({ data: response });
    });
};

exports.sendMessage = (req, res) => {
    const data = req.body.data;

    Conversation.sendMessage(data, (response) => {
        res.send({ data: response });
    });
};
