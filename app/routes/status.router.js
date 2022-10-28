module.exports = (router) => {
    var statusController = require('../controllers/status.controller');

    router.get('/status', statusController.detail);
    router.get('/status/list', statusController.listByUserID);
    router.get('/status/list-friend', statusController.listByFriend);
    router.get('/status/list-no-friend', statusController.listByNoFriend);
    router.get('/status/list-feed-page', statusController.listFeedPage);
    router.post('/status/add', statusController.add);
    router.delete('/status/remove', statusController.remove);
};
