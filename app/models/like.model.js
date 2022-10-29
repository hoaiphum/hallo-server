const db = require('../common/connect');

const Like = (like) => {};

Like.add = async (data, res) => {
    const sql = 'INSERT INTO status_like (status_id, user_id) VALUES (?, ?);';
    await db.query(sql, [data.status_id, data.user_id], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const likeID = result.insertId;
            const sql = 'SELECT a.*, b.first_name FROM status_like a, user b WHERE a.id = ? AND a.user_id = b.id;';
            db.query(sql, [likeID], (err, result) => {
                if (err || result?.length === 0) res(null);
                else res(result[0]);
            });
        }
    });
};

Like.unlike = async (data, res) => {
    const sql = 'DELETE FROM status_like WHERE status_id=? AND user_id=?;';
    await db.query(sql, [data.status_id, data.user_id], (err, result) => {
        if (err) res(null);
        else {
            res('Success');
        }
    });
};

Like.list = (id, res) => {
    const sql = 'SELECT a.*, b.first_name FROM status_like a, user b WHERE status_id = ? AND a.user_id = b.id;';
    db.query(sql, [id], (err, result) => {
        if (err || result?.length === 0) res(null);
        else res(result);
    });
};

module.exports = Like;
