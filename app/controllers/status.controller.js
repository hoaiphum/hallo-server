var Status = require('../models/status.model');
const multer = require('multer');
const path = require('path');

exports.detail = (req, res) => {
    const id = req.query.id;

    Status.detail(id, (response) => {
        res.send({ data: response });
    });
};

exports.listByUserID = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listByUserID(data, (response) => {
        res.send({ data: response });
    });
};

exports.listByFriend = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listByFriend(data, (response) => {
        res.send({ data: response });
    });
};

exports.listByNoFriend = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listByNoFriend(data, (response) => {
        res.send({ data: response });
    });
};

exports.listFeedPage = (req, res) => {
    const data = {
        id: req.query.id,
        start: req.query.start,
        lim: req.query.lim,
    };

    Status.listFeedPage(data, (response) => {
        res.send({ data: response });
    });
};

exports.getVideo = (req, res) => {
    const statusID = req.query.statusID;

    Status.getVideo(statusID, (response) => {
        res.send({ data: response });
    });
};

exports.add = (req, res) => {
    const status = req.body.data;
    const data = {
        user_id: status.userID,
        permission: status.permission,
        content: status.content,
        created_at: status.createdAt,
    };

    Status.add(data, (response) => {
        res.send({ data: response });
    });
};

// Upload Image

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/images_stt/');
    },
    filename: (req, file, callBack) => {
        callBack(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage: storage });

exports.uploadImage = upload.array('image', 10);

exports.addImage = (req, res) => {
    const statusID = req.body.statusID;

    if (!req.files) {
        console.log('No file upload');
    } else {
        const files = req.files;
        let index, len;

        for (index = 0, len = files.length; index < len; ++index) {
            var src = 'images/images_stt/' + files[index].filename;
            const data = {
                statusID,
                src,
            };
            Status.addImage(data, (response) => {});
        }
        res.send({ message: 'Success' });
    }
};

// Upload Video

const storageVideo = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/videos/status/');
    },
    filename: (req, file, callBack) => {
        callBack(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const uploadVid = multer({ storage: storageVideo });

exports.uploadVideo = uploadVid.single('video');

exports.addVideo = (req, res) => {
    const statusID = req.body.statusID;

    if (!req.file) {
        console.log('No file upload');
    } else {
        const file = req.file;
        const src = 'videos/status/' + file.filename;
        const data = { statusID, src };
        Status.addVideo(data, (response) => {});
        res.send({ message: 'Success' });
    }
};

exports.remove = (req, res) => {
    const id = req.query.id;

    Status.remove(id, (response) => {
        res.send({ message: response });
    });
};
