const db = require('../common/connect');

const fs = require('fs');

const Status = (status) => {};

Status.detail = (id, res) => {
    const sql = 'call show_status_by_status_id(?);';
    db.query(sql, [id], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result[0][0]);
    });
};

Status.listByUserID = (data, res) => {
    const sql = 'call show_list_status_by_user(?,?,?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result[0]);
    });
};

Status.listByFriend = (data, res) => {
    const sql = 'call show_list_status_friend(?,?,?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result[0]);
    });
};

Status.listByNoFriend = (data, res) => {
    const sql = 'call show_list_status_no_friend(?,?,?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result[0]);
    });
};

Status.listFeedPage = (data, res) => {
    const sql = 'call show_list_status_feed_page(?, ?, ?);';
    db.query(sql, [data.id, data.start, data.lim], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result[0]);
    });
};

Status.getVideo = (statusID, res) => {
    const sql = 'SELECT * FROM status_video WHERE status_id = ?;';
    db.query(sql, [statusID], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else res(result[0]);
    });
};

Status.add = (data, res) => {
    const sql = 'INSERT INTO status (user_id, permission, content, created_at) VALUES (?, ?, ?, ?);';
    db.query(sql, [data.user_id, data.permission, data.content, data.created_at], (err, result) => {
        if (err) {
            res(null);
        } else {
            const id = result.insertId;
            res({ id, ...data });
        }
    });
};

Status.addImage = (data, res) => {
    var insertData = 'INSERT INTO status_image (status_id, image) VALUES (?, ?);';
    db.query(insertData, [data.statusID, data.src], (err, result) => {
        if (err) throw err;
    });
};

Status.addVideo = (data, res) => {
    var insertData = 'INSERT INTO status_video (status_id, video) VALUES (?, ?);';
    db.query(insertData, [data.statusID, data.src], (err, result) => {
        if (err) throw err;
    });
};

Status.remove = (id, res) => {
    const sql1 = 'call show_images_of_status(?);';
    db.query(sql1, [id], (err, result) => {
        if (err) console.log(err);
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

    const sqlVideo = 'SELECT * FROM status_video WHERE status_id = ?;';
    db.query(sqlVideo, [id], (err, result) => {
        if (err) console.log(err);
        if (result?.length > 0) {
            const video = result[0];
            const path = './public/' + JSON.parse(JSON.stringify(video.video));
            try {
                fs.unlinkSync(path);
            } catch (error) {
                console.log(error);
            }
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
