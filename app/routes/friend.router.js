module.exports = (router) => {
    var friendController = require('../controllers/friend.controller');

    router.get('/friend/is-friend', friendController.isFriend);
};
