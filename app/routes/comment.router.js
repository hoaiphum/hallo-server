module.exports = (router) => {
    var commentController = require('../controllers/comment.controller');

    router.post('/comment/add', commentController.add);
    router.get('/comment/list', commentController.list);
    router.delete('/comment/remove', commentController.remove);
};
