var User = require('../models/user.model');
exports.info = (req, res) => {
    const id = req.query.id;

    User.info(id, (response) => {
        res.send({ data: response });
    });
};

exports.getUsersByName = (req, res) => {
    const name = req.query.name;

    User.getUsersByName(name, (response) => {
        res.send({ data: response });
    });
};

exports.getFriends = (req, res) => {
    const id = req.query.id;
    const limit = req.query.limit;

    User.getFriends(id, limit, (response) => {
        res.send({ data: response });
    });
};

exports.register = (req, res) => {
    const data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthday: req.body.birthday,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        createdAt: req.body.createdAt,
    };
    User.register(data, (response) => {
        res.send({ data: response });
    });
};

exports.login = (req, res) => {
    const data = {
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
    };
    User.login(data, (response) => {
        if (response?.message) {
            res.send({ message: response.message });
        } else {
            res.send({ data: response });
        }
    });
};

// UPDATE

exports.updateName = (req, res) => {
    const data = req.body.data;
    User.updateName(data, (response) => {
        res.send({ message: response });
    });
};

exports.updateEmail = (req, res) => {
    const data = req.body.data;
    User.updateEmail(data, (response) => {
        res.send({ message: response });
    });
};

exports.updatePhone = (req, res) => {
    const data = req.body.data;
    User.updatePhone(data, (response) => {
        res.send({ message: response });
    });
};

exports.updatePassword = (req, res) => {
    const data = req.body.data;
    User.updatePassword(data, (response) => {
        res.send({ message: response });
    });
};

exports.updateGender = (req, res) => {
    const data = req.body.data;
    User.updateGender(data, (response) => {
        res.send({ message: response });
    });
};

exports.updateBirthday = (req, res) => {
    const data = req.body.data;
    User.updateBirthday(data, (response) => {
        res.send({ message: response });
    });
};

exports.removeFriend = (req, res) => {
    const user1ID = req.query.user1ID;
    const user2ID = req.query.user2ID;

    User.removeFriend(user1ID, user2ID, (response) => {
        res.send({ message: response });
    });
};

exports.getListVideo = (req, res) => {
    const id = req.query.id;
    User.getListVideo(id, (response) => {
        res.send({ data: response });
    });
};
