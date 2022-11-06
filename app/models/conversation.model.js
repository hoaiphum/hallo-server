const db = require('../common/connect');

const Conversation = (conversation) => {};

Conversation.list = (userID, res) => {
    const sql = 'CALL show_conversation(?)';
    db.query(sql, [userID], (err, result) => {
        if (err || result?.length === 0) res(null);
        else res(result[0]);
    });
};

Conversation.messenger = (conversationID, res) => {
    const sql = 'CALL get_messenger(?)';
    db.query(sql, [conversationID], (err, result) => {
        if (err || result?.length === 0) res(null);
        else res(result[0]);
    });
};

Conversation.sendMessage = (data, res) => {
    const sql = 'INSERT INTO messenger (conversation_id, sender_id, content, created_at) VALUES (?,?,?,?)';
    db.query(sql, [data.conversationID, data.senderID, data.content, data.createdAt], (err, result) => {
        if (err) res(null);
        else {
            const messageID = result.insertId;
            const sql = 'CALL get_message_by_id(?)';
            db.query(sql, [messageID], (err, response) => {
                if (err || response?.length === 0) res(null);
                else {
                    res(response[0][0]);
                }
            });
        }
    });
};

module.exports = Conversation;
