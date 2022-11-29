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

User.getUsersByName = (name, res) => {
    const sql = 'CALL get_user_by_name(?)';
    db.query(sql, [name], (err, result) => {
        if (err || result?.length === 0) res(null);
        else {
            res(result[0]);
        }
    });
};

User.getFriends = (id, limit, res) => {
    if (limit) {
        const sql = 'CALL get_friends(?, ?)';
        db.query(sql, [id, limit], (err, result) => {
            if (err || result?.length === 0) res(null);
            else {
                res(result[0]);
            }
        });
    } else {
        const sql = 'CALL show_friend(?)';
        db.query(sql, [id], (err, result) => {
            if (err || result?.length === 0) res(null);
            else {
                res(result[0]);
            }
        });
    }
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

User.updateName = (data, res) => {
    const sql = 'UPDATE user SET first_name=?, last_name=? WHERE id=?;';
    db.query(sql, [data.firstName, data.lastName, data.userID], (err, result) => {
        if (err) res(null);
        else {
            res('Success');
        }
    });
};

User.updateEmail = (data, res) => {
    const sql = 'UPDATE user_account SET email=? WHERE user_id=?;';
    db.query(sql, [data.email, data.userID], (err, result) => {
        if (err) res(null);
        else {
            res('Success');
        }
    });
};

User.updatePhone = (data, res) => {
    const sql = 'UPDATE user_account SET phone=? WHERE user_id=?;';
    db.query(sql, [data.phone, data.userID], (err, result) => {
        if (err) res(null);
        else {
            res('Success');
        }
    });
};

User.updatePassword = (data, res) => {
    const sqlCheck = 'SELECT * FROM user_account WHERE user_id = ?;';
    db.query(sqlCheck, [data.userID], (err, result) => {
        if (err || result?.length === 0) {
            res(null);
        } else {
            bcrypt.compare(data.password, result[0].password, (err, response) => {
                if (response) {
                    bcrypt.hash(data.newPassword, saltRounds, (err, hash) => {
                        if (err) res(null);
                        else {
                            const sql = 'UPDATE user_account SET password=? WHERE user_id=?;';
                            db.query(sql, [hash, data.userID], (err, result) => {
                                if (err) res(null);
                                else {
                                    res('Success');
                                }
                            });
                        }
                    });
                } else {
                    res('Wrong Password');
                }
            });
        }
    });
};

User.updateGender = (data, res) => {
    const sql = 'UPDATE user SET gender=? WHERE id=?;';
    db.query(sql, [data.gender, data.userID], (err, result) => {
        if (err) res(null);
        else {
            res('Success');
        }
    });
};

User.updateBirthday = (data, res) => {
    const sql = 'UPDATE user SET birthday=? WHERE id=?;';
    db.query(sql, [data.birthday, data.userID], (err, result) => {
        if (err) res(null);
        else {
            res('Success');
        }
    });
};

User.removeFriend = (user1ID, user2ID, res) => {
    const sql = 'DELETE FROM user_friend WHERE user1_id=? AND user2_id=? OR user2_id=? AND user1_id=?;';
    db.query(sql, [user1ID, user2ID, user1ID, user2ID], (err, result) => {
        if (err) res(err);
        else {
            const sql = 'CALL delete_conversation(?,?);';
            db.query(sql, [user1ID, user2ID], (err, result) => {
                if (err) res(err);
                else {
                    res('Success');
                }
            });
        }
    });
};

module.exports = User;
