module.exports = (router) => {
    var userController = require('../controllers/user.controller');

    router.get('/user', userController.info);
    router.post('/user/register', userController.register);
    router.post('/user/login', userController.login);
};
