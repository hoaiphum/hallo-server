const db = require('../common/connect');

const Friend = (friend) => {};
Friend.isFriend = (data, res) => {
    const sql = 'SELECT * FROM user_friend WHERE user1_id = ? AND user2_id = ? OR user1_id = ? AND user2_id = ?;';
    db.query(sql, [data.user1ID, data.user2ID, data.user2ID, data.user1ID], (err, result) => {
        if (err || result?.length < 1) {
            res(false);
        } else {
            res(true);
        }
    });
};

module.exports = Friend;
