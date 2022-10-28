const db = require('../common/connect');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = (user) => {
    this.id = user.id;
    this.firstName = user.first_name;
    this.lastName = user.last_name;
    this.birthday = user.birthday;
    this.gender = user.gender;
    this.createdAt = user.created_at;
    this.updatedAt = user.updated_at;
    this.avatar = user.avatar;
    this.cover = user.cover;
    this.phone = user.phone;
    this.email = user.email;
};
User.info = (id, result) => {
    const sql =
        'SELECT a.*, b.avatar, b.cover, c.phone, c.email  FROM user a, user_image b, user_account c WHERE id = ? AND a.id = b.user_id AND a.id=c.user_id;';
    db.query(sql, [id], (err, res) => {
        if (err || res.length === 0) result(null);
        else {
            result(res[0]);
        }
    });
};

User.register = (data, result) => {
    bcrypt.hash(data.password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }

        const sql = 'INSERT INTO user (first_name, last_name, birthday, gender, created_at) VALUES (?, ?, ?, ?, ?);';
        db.query(
            sql,
            [data.firstName, data.lastName, data.birthday, data.gender, data.createdAt],
            (errUser, resultUser) => {
                const userID = resultUser.insertId;
                if (errUser) {
                    console.log(errUser);
                    result(null);
                } else {
                    const sql2 = 'INSERT INTO user_account (user_id, phone, email, password) VALUES (?, ?, ?, ?);';

                    db.query(sql2, [userID, data.phone, data.email, hash], (errUserAccount, resultUserAccount) => {
                        if (errUserAccount) {
                            console.log(errUserAccount);
                            result(null);
                        } else {
                            const sql3 =
                                "INSERT INTO user_image (user_id, avatar, cover) VALUES (?, 'images/avatar/default.png', 'images/cover/default.jpg');";
                            db.query(sql3, [userID], (errUserImage, resultUserImage) => {
                                if (errUserImage) {
                                    console.log(errUserImage);
                                    result(null);
                                } else result({ userID: userID });
                            });
                        }
                    });
                }
            },
        );
    });
};

User.login = (data, result) => {
    let sql = 'SELECT * FROM user_account WHERE phone = ?;';
    if (data.email) {
        sql = 'SELECT * FROM user_account WHERE email = ?;';
    }

    db.query(sql, [data.phone, data.email], (err, res) => {
        if (err) {
            result(null);
        } else if (res?.length > 0) {
            bcrypt.compare(data.password, res[0].password, (err, response) => {
                if (err) result(null);
                else if (response) {
                    result(res[0]);
                } else {
                    result({ message: 'Wrong Password' });
                }
            });
        } else {
            result({ message: 'No user' });
        }
    });
};
module.exports = User;
