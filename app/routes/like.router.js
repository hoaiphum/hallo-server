module.exports = (router) => {
    var likeController = require('../controllers/like.controller');

    router.post('/like/add', likeController.add);
    router.post('/like/remove', likeController.unlike);
    router.get('/like/list', likeController.list);
};
