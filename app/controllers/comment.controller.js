var Comment = require('../models/comment.model');

exports.add = (req, res) => {
    const data = {
        status_id: req.body.statusID,
        user_id: req.body.userID,
        content: req.body.content,
        created_at: req.body.createdAt,
    };

    Comment.add(data, (response) => {
        res.send({ data: response });
    });
};

exports.list = (req, res) => {
    const id = req.query.id;

    Comment.list(id, (response) => {
        res.send({ data: response });
    });
};

exports.remove = (req, res) => {
    const id = req.query.id;

    Comment.list(id, (response) => {
        res.send({ message: response });
    });
};
