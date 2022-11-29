const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http').Server(app);

const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

const bcrypt = require('bcrypt');
const saltRounds = 10;

// Connect Database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'facebook',
    charset: 'utf8mb4',
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Prevent Crashed
process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----');
    console.log(error);
    console.log('----- Exception origin -----');
    console.log(origin);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----');
    console.log(promise);
    console.log('----- Reason -----');
    console.log(reason);
});

// -----------------------//

// -------------------------------------------------------------------------//
// Socket
// -------------------------------------------------------------------------//

var onlineUsers = [];

const addNewUser = (userID, socketID) => {
    !onlineUsers.some((user) => user.userID === userID) && onlineUsers.push({ userID, socketID });
};

const removeUser = (socketID) => {
    onlineUsers = onlineUsers.filter((user) => user.socketID !== socketID);
};

const getUser = (userID) => {
    return onlineUsers.find((user) => user.userID == userID);
};

io.on('connection', (socket) => {
    socket.on('newUser', (ID) => {
        if (ID !== null) {
            addNewUser(ID, socket.id);
            io.emit('getOnlineUsers', {
                onlineUsers,
            });
        }
    });

    socket.on('sendNotification', ({ receiverID, notificationID }) => {
        const receiver = getUser(receiverID);
        if (receiver) {
            io.to(receiver.socketID).emit('getNotification', {
                notificationID,
            });
        }
    });

    socket.on('sendRequestAddFriend', ({ receiverID, requestID }) => {
        const receiver = getUser(receiverID);
        if (receiver) {
            io.to(receiver.socketID).emit('getRequestAddFriend', {
                requestID,
            });
        }
    });

    socket.on('sendMessage', (data) => {
        const receiver = getUser(data.receiverID);
        console.log(receiver);
        if (receiver) {
            io.to(receiver.socketID).emit('getMessage', {
                data,
            });
        }
    });

    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('getOnlineUsers', {
            onlineUsers,
        });
    });
});

// ---------------------------------------------------------------------------//
// ---------------------------------------------------------------------------//
// ---------------------------------------------------------------------------//

const storageAvatar = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/avatar/');
    },
    filename: (req, file, callBack) => {
        callBack(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const storageCover = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/cover/');
    },
    filename: (req, file, callBack) => {
        callBack(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const uploadAvatar = multer({ storage: storageAvatar });
const uploadCover = multer({ storage: storageCover });

//Upload Avatar
app.post('/image-upload-avatar', uploadAvatar.single('image'), async (req, res) => {
    const userID = req.body.userID;
    if (!req.file) {
        console.log('No file upload avatar');
    } else {
        var imgsrc = 'images/avatar/' + req.file.filename;
        var insertData = 'UPDATE user_image SET avatar=? WHERE user_id=?;';
        await db.query(insertData, [imgsrc, userID], (err, result) => {
            if (err) throw err;
        });
        res.send({ message: 'Success' });
    }
});

//Upload Cover
app.post('/image-upload-cover', uploadCover.single('image'), async (req, res) => {
    const userID = req.body.userID;
    if (!req.file) {
        console.log('No file upload');
    } else {
        var imgsrc = 'images/cover/' + req.file.filename;
        var insertData = 'UPDATE user_image SET cover=? WHERE user_id=?;';
        await db.query(insertData, [imgsrc, userID], (err, result) => {
            if (err) throw err;
        });
        res.send({ message: 'Success' });
    }
});

// New update
require('./app/routes/user.router')(app);
require('./app/routes/status.router')(app);
require('./app/routes/like.router')(app);
require('./app/routes/comment.router')(app);
require('./app/routes/conversation.router')(app);
require('./app/routes/friend.router')(app);

// Show Images of Status
app.post('/show-images-of-status', (req, res) => {
    const id = req.body.id;
    const sql = 'call show_images_of_status(?);';
    db.query(sql, [id], (err, result) => {
        if (err) res.send({ err: err });
        res.send(result);
    });
});

// Insert Comment
app.post('/insert-comment', async (req, res) => {
    const statusID = req.body.statusID;
    const userID = req.body.userID;
    const content = req.body.content;
    const createdAt = req.body.createdAt;

    const sql = 'INSERT INTO comment (status_id, user_id, content, created_at) VALUES (?, ?, ?, ?);';
    db.query(sql, [statusID, userID, content, createdAt], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const commentID = result.insertId;
            const sqlResult = 'CALL get_comment(?);';
            db.query(sqlResult, [commentID], (err, result) => {
                if (err) res.send({ err: err });
                if (result?.length > 0) {
                    res.send(result);
                }
            });
        }
    });
});

// Show Comment
app.post('/show-comment', (req, res) => {
    const id = req.body.id;

    const sql = 'call show_comment_of_status(?);';
    db.query(sql, [id], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send(result);
        }
    });
});

// Request Add Friend
app.post('/add-friend', (req, res) => {
    const senderID = req.body.senderID;
    const receiverID = req.body.receiverID;
    const createdAt = req.body.createdAt;

    const sql = 'INSERT INTO request_add_friend (sender_id, receiver_id, created_at) VALUES (?, ?, ?);';
    db.query(sql, [senderID, receiverID, createdAt], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ requestID: result.insertId });
        }
    });
});

// Show Menu Friend
app.post('/show-menu-friend', (req, res) => {
    const id = req.body.id;

    const sql = 'call show_request_add_friend(?);';
    db.query(sql, [id], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send(result);
        }
    });
});

// Accept Add Friend
app.post('/accept-add-friend', (req, res) => {
    const user1ID = req.body.user1ID;
    const user2ID = req.body.user2ID;
    const createdAt = req.body.createdAt;

    const sql = 'INSERT INTO user_friend (user1_id, user2_id, created_at) VALUES (?, ?, ?);';
    db.query(sql, [user1ID, user2ID, createdAt], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const sqlInsertConversation = 'INSERT INTO conversation VALUES();';
            db.query(sqlInsertConversation, [], (err, resultInsertConversation) => {
                if (err) res.send({ err: err });
                else {
                    const conversationID = resultInsertConversation.insertId;
                    const sqlInsertConversationUser = 'CALL insert_conversation_user(?, ?, ?);';
                    db.query(
                        sqlInsertConversationUser,
                        [conversationID, user1ID, user2ID],
                        (err, resultInsertConversationUser) => {
                            if (err) res.send({ err: err });
                            else {
                                res.send({ message: 'Success' });
                            }
                        },
                    );
                }
            });
        }
    });
});

// Delete Add Friend
app.post('/delete-add-friend', (req, res) => {
    const id = req.body.id;

    const sql = 'DELETE FROM request_add_friend WHERE id = ?;';
    db.query(sql, [id], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// isFriend
app.post('/is-friend', async (req, res) => {
    const user1ID = req.body.user1ID;
    const user2ID = req.body.user2ID;

    const sql = 'SELECT * FROM user_friend WHERE user1_id = ? AND user2_id = ? OR user1_id = ? AND user2_id = ?;';
    await db.query(sql, [user1ID, user2ID, user2ID, user1ID], (err, result) => {
        if (err) {
            res.send({ err: err });
        }

        if (result?.length > 0) {
            res.send({ status: true });
        } else {
            res.send({ status: false });
        }
    });
});

// isRequestAddFriend
app.post('/is-request-add-friend', (req, res) => {
    const senderID = req.body.senderID;
    const receiverID = req.body.receiverID;

    const sql =
        'SELECT * FROM request_add_friend WHERE sender_id = ? AND receiver_id = ? OR receiver_id = ? AND sender_id = ?;';
    db.query(sql, [senderID, receiverID, senderID, receiverID], (err, result) => {
        if (err) {
            res.send({ err: err });
        }

        if (result?.length > 0) {
            res.send(result);
        } else res.send({ stt: 'No' });
    });
});

// Delete Friend
app.post('/delete-friend', (req, res) => {
    const user1ID = req.body.user1ID;
    const user2ID = req.body.user2ID;

    const sql = 'DELETE FROM user_friend WHERE user1_id=? AND user2_id=? OR user2_id=? AND user1_id=?;';
    db.query(sql, [user1ID, user2ID, user1ID, user2ID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const sql = 'CALL delete_conversation(?,?);';
            db.query(sql, [user1ID, user2ID], (err, result) => {
                if (err) res.send({ err: err });
                else {
                    res.send({ message: 'Success' });
                }
            });
        }
    });
});

// Delete Status
app.post('/delete-status', (req, res) => {
    const id = req.body.id;

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
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Like Status
app.post('/like-status', async (req, res) => {
    const statusID = req.body.statusID;
    const userID = req.body.userID;

    const sql = 'INSERT INTO status_like (status_id, user_id) VALUES (?, ?);';
    await db.query(sql, [statusID, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const likeID = result.insertId;
            const sql = 'SELECT a.*, b.first_name FROM status_like a, user b WHERE a.id = ? AND a.user_id = b.id;';
            db.query(sql, [likeID], (err, result) => {
                if (err) res.send({ err: err });
                if (result?.length > 0) {
                    res.send(result);
                }
            });
        }
    });
});

// Unlike Status
app.post('/unlike-status', (req, res) => {
    const statusID = req.body.statusID;
    const userID = req.body.userID;

    const sql = 'DELETE FROM status_like WHERE status_id=? AND user_id=?;';
    db.query(sql, [statusID, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Users Liked Status
app.post('/users-liked-status', (req, res) => {
    const statusID = req.body.statusID;

    const sql = 'SELECT a.*, b.first_name FROM status_like a, user b WHERE status_id = ? AND a.user_id = b.id;';
    db.query(sql, [statusID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Add Notification Like Status
app.post('/add-notification-like-status', (req, res) => {
    const senderID = req.body.senderID;
    const receiverID = req.body.receiverID;
    const action = 'thích';
    const statusID = req.body.statusID;
    const createdAt = req.body.createdAt;

    const sql =
        'INSERT INTO notification (sender_id, receiver_id, action, status_id, created_at) VALUES (?, ?, ?, ?, ?);';
    db.query(sql, [senderID, receiverID, action, statusID, createdAt], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ notificationID: result.insertId });
        }
    });
});

// remove Notification Like Status
app.post('/remove-notification-like-status', (req, res) => {
    const senderID = req.body.senderID;
    const receiverID = req.body.receiverID;
    const action = 'thích';
    const statusID = req.body.statusID;

    const sql = 'DELETE FROM notification WHERE sender_id=? AND receiver_id=? AND action=? AND status_id=?;';
    db.query(sql, [senderID, receiverID, action, statusID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Add Notification Status
app.post('/add-notification-status', (req, res) => {
    const senderID = req.body.senderID;
    const receiverID = req.body.receiverID;
    const action = req.body.action;
    const statusID = req.body.statusID;
    const createdAt = req.body.createdAt;

    const sql =
        'INSERT INTO notification (sender_id, receiver_id, action, status_id, created_at) VALUES (?, ?, ?, ?, ?);';
    db.query(sql, [senderID, receiverID, action, statusID, createdAt], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ notificationID: result.insertId });
        }
    });
});

// Show Notification
app.post('/show-notification', (req, res) => {
    const userID = req.body.userID;

    const sql = 'CALL show_notification(?)';
    db.query(sql, [userID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Show Notification By ID
app.post('/show-notification-by-id', (req, res) => {
    const ID = req.body.ID;

    const sql = 'CALL show_notification_by_id(?)';
    db.query(sql, [ID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Readed Notification
app.post('/readed-notification', (req, res) => {
    const userID = req.body.userID;

    const sql = 'UPDATE notification SET readed = 1 WHERE receiver_id = ?';
    db.query(sql, [userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Show Notification By ID
app.post('/show-request-add-friend-by-id', (req, res) => {
    const ID = req.body.ID;

    const sql = 'CALL show_request_add_friend_by_id(?)';
    db.query(sql, [ID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Show Friend
app.post('/show-friend', (req, res) => {
    const ID = req.body.ID;

    const sql = 'CALL show_friend(?)';
    db.query(sql, [ID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        } else {
            res.send({ message: 'No' });
        }
    });
});

// // get-friends
// app.get('/api/user/friend', (req, res) => {
//     const id = req.query.id;
//     const limit = req.query.limit;
//     if (limit) {
//         const sql = 'CALL get_friends(?, ?)';
//         db.query(sql, [id, limit], (err, result) => {
//             if (err) res.send({ err: err });
//             if (result?.length > 0) {
//                 res.send(result);
//             } else {
//                 res.send({ message: 'No' });
//             }
//         });
//     } else {
//         const sql = 'CALL show_friend(?)';
//         db.query(sql, [id], (err, result) => {
//             if (err) res.send({ err: err });
//             if (result?.length > 0) {
//                 res.send(result);
//             } else {
//                 res.send({ message: 'No' });
//             }
//         });
//     }
// });

// Show Conversation
app.post('/show-conversation', (req, res) => {
    const userID = req.body.userID;

    const sql = 'CALL show_conversation(?)';
    db.query(sql, [userID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Show Messenger
app.post('/show-messenger', (req, res) => {
    const conversationID = req.body.conversationID;

    const sql = 'CALL get_messenger(?)';
    db.query(sql, [conversationID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Send Message
app.post('/send-message', (req, res) => {
    const conversationID = req.body.conversationID;
    const senderID = req.body.senderID;
    const content = req.body.content;
    const createdAt = req.body.createdAt;

    const sql = 'INSERT INTO messenger (conversation_id, sender_id, content, created_at) VALUES (?,?,?,?)';
    db.query(sql, [conversationID, senderID, content, createdAt], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const messageID = result.insertId;
            const sql = 'CALL get_message_by_id(?)';
            db.query(sql, [messageID], (err, result) => {
                if (err) res.send({ err: err });
                else if (result?.length > 0) {
                    res.send(result);
                }
            });
        }
    });
});

// Insert Comment Reply
app.post('/insert-reply-comment', async (req, res) => {
    const commentID = req.body.commentID;
    const userID = req.body.userID;
    const content = req.body.content;
    const createdAt = req.body.createdAt;

    const sql = 'INSERT INTO comment_reply (comment_id, user_id, content, created_at) VALUES (?, ?, ?, ?);';
    db.query(sql, [commentID, userID, content, createdAt], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const commentReplyID = result.insertId;
            const sqlResult = 'CALL get_comment_reply(?);';
            db.query(sqlResult, [commentReplyID], (err, result) => {
                if (err) res.send({ err: err });
                if (result?.length > 0) {
                    res.send(result);
                }
            });
        }
    });
});

// Show Comment Reply
app.post('/show-comment-reply', (req, res) => {
    const id = req.body.id;

    const sql = 'call get_list_comment_reply(?);';
    db.query(sql, [id], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send(result);
        }
    });
});

// Like Comment
app.post('/like-comment', async (req, res) => {
    const commentID = req.body.commentID;
    const userID = req.body.userID;

    const sql = 'INSERT INTO comment_like (comment_id, user_id) VALUES (?,?);';
    await db.query(sql, [commentID, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            const ID = result.insertId;
            const sql = 'CALL get_user_liked_comment(?);';
            db.query(sql, [ID], (err, result) => {
                if (err) res.send({ err: err });
                if (result?.length > 0) {
                    res.send(result);
                }
            });
        }
    });
});

// List Like Comment
app.post('/get-like-comment', async (req, res) => {
    const commentID = req.body.commentID;

    const sql = 'CALL get_users_liked_comment(?);';
    await db.query(sql, [commentID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        }
    });
});

// Unlike Comment
app.post('/unlike-comment', async (req, res) => {
    const commentID = req.body.commentID;
    const userID = req.body.userID;

    const sql = 'DELETE FROM comment_like WHERE comment_id = ? AND user_id = ?;';
    await db.query(sql, [commentID, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Delete Comment
app.post('/delete-comment', (req, res) => {
    const id = req.body.id;

    const sql = 'DELETE FROM comment WHERE id=?;';
    db.query(sql, [id], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Delete Comment Reply
app.post('/delete-comment-reply', (req, res) => {
    const id = req.body.id;

    const sql = 'DELETE FROM comment_reply WHERE id=?;';
    db.query(sql, [id], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// List Images
app.get('/api/user/image', async (req, res) => {
    const id = req.query.id;
    const limit = req.query.limit;

    if (limit) {
        const sql = 'call get_images(?, ?)';
        await db.query(sql, [id, limit], (err, result) => {
            if (err) res.send({ err: err });
            if (result?.length > 0) {
                res.send(result);
            }
        });
    } else {
        const sql = 'call get_full_images(?)';
        await db.query(sql, [id], (err, result) => {
            if (err) res.send({ err: err });
            if (result?.length > 0) {
                res.send(result);
            }
        });
    }
});

// Update name
app.post('/update-name', async (req, res) => {
    const userID = req.body.userID;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const sql = 'UPDATE user SET first_name=?, last_name=? WHERE id=?;';
    await db.query(sql, [firstName, lastName, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Update email
app.post('/update-email', async (req, res) => {
    const userID = req.body.userID;
    const email = req.body.email;

    const sql = 'UPDATE user_account SET email=? WHERE user_id=?;';
    await db.query(sql, [email, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Update phone
app.post('/update-phone', async (req, res) => {
    const userID = req.body.userID;
    const phone = req.body.phone;

    const sql = 'UPDATE user_account SET phone=? WHERE user_id=?;';
    await db.query(sql, [phone, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Update password
app.post('/update-password', async (req, res) => {
    const userID = req.body.userID;
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    const sqlCheck = 'SELECT * FROM user_account WHERE user_id = ?;';
    db.query(sqlCheck, [userID], (err, result) => {
        if (err) {
            res.send({ err: err });
        }
        if (result?.length > 0) {
            bcrypt.compare(password, result[0].password, (err, response) => {
                if (response) {
                    bcrypt.hash(newPassword, saltRounds, (err, hash) => {
                        if (err) res.send({ err: err });

                        const sql = 'UPDATE user_account SET password=? WHERE user_id=?;';
                        db.query(sql, [hash, userID], (err, result) => {
                            if (err) res.send({ err: err });
                            else {
                                res.send({ message: 'Success' });
                            }
                        });
                    });
                } else {
                    res.send({ message: 'Wrong Password' });
                }
            });
        }
    });
});

// Check Phone Exist
app.post('/check-phone-exist', async (req, res) => {
    const phone = req.body.phone;

    const sql = 'SELECT * FROM user_account WHERE phone=?;';
    await db.query(sql, [phone], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send({ message: 'Exist' });
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Check email Exist
app.post('/check-email-exist', async (req, res) => {
    const email = req.body.email;

    const sql = 'SELECT * FROM user_account WHERE email=?;';
    await db.query(sql, [email], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send({ message: 'Exist' });
        } else {
            res.send({ message: 'No' });
        }
    });
});

// Get List City
app.post('/get-list-city', async (req, res) => {
    const sql = 'SELECT * FROM tinhthanhpho ORDER BY name;';
    await db.query(sql, [], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        }
    });
});

// Get List District
app.post('/get-list-district', async (req, res) => {
    const cityID = req.body.cityID;
    const sql = 'SELECT * FROM quanhuyen WHERE matp = ? ORDER BY name;';
    await db.query(sql, [cityID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        }
    });
});

// Get List Ward
app.post('/get-list-ward', async (req, res) => {
    const districtID = req.body.districtID;
    const sql = 'SELECT * FROM xaphuongthitran WHERE maqh = ? ORDER BY name;';
    await db.query(sql, [districtID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            res.send(result);
        }
    });
});

// Update Address
app.post('/update-address', async (req, res) => {
    const userID = req.body.userID;
    const cityID = req.body.cityID;
    const districtID = req.body.districtID;
    const wardID = req.body.wardID;

    const sql = 'SELECT * FROM user_address WHERE user_id=?;';
    await db.query(sql, [userID], (err, result) => {
        if (err) res.send({ err: err });
        if (result?.length > 0) {
            const sqlUpdate = 'UPDATE user_address SET city_id=?, district_id=?, ward_id=? WHERE user_id=?;';
            db.query(sqlUpdate, [cityID, districtID, wardID, userID], (err, result) => {
                if (err) res.send({ err: err });
                else {
                    res.send({ message: 'Success' });
                }
            });
        } else {
            const sqlInsert = 'INSERT INTO user_address (user_id, city_id, district_id, ward_id) VALUES (?, ?, ?, ?);';
            db.query(sqlInsert, [userID, cityID, districtID, wardID], (err, result) => {
                if (err) res.send({ err: err });
                else {
                    res.send({ message: 'Success' });
                }
            });
        }
    });
});

// Get User Address
app.post('/get-user-address', async (req, res) => {
    const userID = req.body.userID;
    const sql = 'CALL get_user_address(?);';
    await db.query(sql, [userID], (err, result) => {
        if (err) res.send({ err: err });
        if (result && result.length > 0) {
            res.send(result);
        }
    });
});

// Update Gender
app.post('/update-gender', async (req, res) => {
    const userID = req.body.userID;
    const gender = req.body.gender;

    const sql = 'UPDATE user SET gender=? WHERE id=?;';
    await db.query(sql, [gender, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

// Update Birthday
app.post('/update-birthday', async (req, res) => {
    const userID = req.body.userID;
    const birthday = req.body.birthday;

    const sql = 'UPDATE user SET birthday=? WHERE id=?;';
    await db.query(sql, [birthday, userID], (err, result) => {
        if (err) res.send({ err: err });
        else {
            res.send({ message: 'Success' });
        }
    });
});

http.listen(3001, () => {
    console.log('Running  on port 3001');
});
