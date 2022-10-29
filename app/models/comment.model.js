const db = require('../common/connect');

const Comment = (comment) => {};

Comment.add = async (data, res) => {
    const sql = 'INSERT INTO comment (status_id, user_id, content, created_at) VALUES (?, ?, ?, ?);';
    await db.query(sql, [data.status_id, data.user_id, data.content, data.created_at], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const commentID = result.insertId;
            const sqlResult = 'CALL get_comment(?);';
            db.query(sqlResult, [commentID], (err, result) => {
                if (err || result?.length === 0) res(null);
                else res(result[0]);
            });
        }
    });
};

Comment.list = (id, res) => {
    const sql = 'call show_comment_of_status(?);';
    db.query(sql, [id], (err, result) => {
        if (err || result?.length === 0) res(null);
        else res(result);
    });
};

Comment.remove = (id, res) => {
    const sql = 'DELETE FROM comment WHERE id=?;';
    db.query(sql, [id], (err, result) => {
        if (err) res(null);
        else res('Success');
    });
};

module.exports = Comment;
