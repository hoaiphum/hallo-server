var Like = require('../models/like.model');

exports.add = (req, res) => {
    const data = {
        status_id: req.body.statusID,
        user_id: req.body.userID,
    };

    Like.add(data, (response) => {
        res.send({ data: response });
    });
};

exports.unlike = (req, res) => {
    const data = {
        status_id: req.body.statusID,
        user_id: req.body.userID,
    };

    Like.unlike(data, (response) => {
        res.send({ data: response });
    });
};

exports.list = (req, res) => {
    const id = req.query.id;

    Like.list(id, (response) => {
        res.send({ data: response });
    });
};
