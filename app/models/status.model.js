const db = require('../common/connect');
const fs = require('fs');

const Status = (status) => {};

Status.detail = (id, result) => {
    const sql = 'call show_status_by_status_id(?);';
    db.query(sql, [id], (err, res) => {
        if (err || res?.length === 0) {
            result(null);
        } else result(res[0]);
    });
};

Status.listByUserID = (data, res) => {
    const sql = 'call show_list_status_by_user(?,?,?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result);
    });
};

Status.listByFriend = (data, res) => {
    const sql = 'call show_list_status_friend(?,?,?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result);
    });
};

Status.listByNoFriend = (data, res) => {
    const sql = 'call show_list_status_no_friend(?,?,?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result);
    });
};

Status.listFeedPage = (data, res) => {
    const sql = 'call show_list_status_feed_page(?, ?, ?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result);
    });
};

Status.add = (data, res) => {
    const sql = 'INSERT INTO status (user_id, permission, content, created_at) VALUES (?, ?, ?, ?);';
    db.query(sql, [data.id, data.permission, data.content, data.created_at], (err, result) => {
        if (err) res(null);
        else {
            const id = result.insertId;
            res(id, ...data);
        }
    });
};

Status.remove = (id, res) => {
    const sql1 = 'call show_images_of_status(?);';
    db.query(sql1, [id], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            result[0].forEach((image) => {
                const path = './public/' + JSON.parse(JSON.stringify(image.image));
                try {
                    fs.unlinkSync(path);
                } catch (error) {
                    console.log(error);
                }
            });
        }
    });

    const sql = 'DELETE FROM status WHERE id=?;';
    db.query(sql, [id], (err, result) => {
        if (err) res(null);
        else {
            res('Success');
        }
    });
};

module.exports = Status;
