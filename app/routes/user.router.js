module.exports = (router) => {
    var userController = require('../controllers/user.controller');

    router.get('/user', userController.info);
    router.get('/user/search', userController.getUsersByName);
    router.get('/user/friend', userController.getFriends);
    router.post('/user/register', userController.register);
    router.post('/user/login', userController.login);
    router.put('/user/update/name', userController.updateName);
    router.put('/user/update/email', userController.updateEmail);
    router.put('/user/update/phone', userController.updatePhone);
    router.put('/user/update/password', userController.updatePassword);
    router.put('/user/update/gender', userController.updateGender);
    router.put('/user/update/birthday', userController.updateBirthday);
    router.delete('/user/friend/delete', userController.removeFriend);
};
