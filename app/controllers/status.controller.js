var Status = require('../models/status.model');

exports.detail = (req, res) => {
    const id = req.query.id;

    Status.detail(id, (response) => {
        res.send({ data: response });
    });
};

exports.listByUserID = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listByUserID(data, (response) => {
        res.send({ data: response });
    });
};

exports.listByFriend = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listByFriend(data, (response) => {
        res.send({ data: response });
    });
};

exports.listByNoFriend = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listByNoFriend(data, (response) => {
        res.send({ data: response });
    });
};

exports.listFeedPage = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listFeedPage(data, (response) => {
        res.send({ data: response });
    });
};

exports.add = (req, res) => {
    const data = {
        user_id: req.body.id,
        permission: req.body.permission,
        content: req.body.statusContent,
        created_at: req.body.createdAt,
    };

    Status.add(data, (response) => {
        res.send({ data: response });
    });
};

exports.remove = (req, res) => {
    const id = req.query.id;

    Status.remove(id, (response) => {
        res.send({ message: response });
    });
};
