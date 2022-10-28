var Status = require('../models/status.models');
exports.detail = (req, res) => {
    const id = req.query.id;

    Status.datail(id, (response) => {
        res.send({ data: response });
    });
};
