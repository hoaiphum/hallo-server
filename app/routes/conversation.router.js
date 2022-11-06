module.exports = (router) => {
    var conversationController = require('../controllers/conversation.controller');

    router.get('/conversation', conversationController.list);
    router.get('/conversation/messenger', conversationController.messenger);
    router.post('/conversation/send-message', conversationController.sendMessage);
};
