module.exports = (router) => {
    var statusController = require('../controllers/status.controller');

    router.get('/status', statusController.detail);
    router.get('/status/list', statusController.listByUserID);
    router.get('/status/list-friend', statusController.listByFriend);
    router.get('/status/list-no-friend', statusController.listByNoFriend);
    router.get('/status/list-feed-page', statusController.listFeedPage);
    router.post('/status/add', statusController.add);
    router.post('/status/add-image', statusController.uploadImage, statusController.addImage);
    router.post('/status/add-video', statusController.uploadVideo, statusController.addVideo);
    router.delete('/status/remove', statusController.remove);
};
