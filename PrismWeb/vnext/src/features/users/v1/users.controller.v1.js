var usersService = require('./users.service');


module.exports = {
    getUsers: getUsers,
    getUser: getUser,
    addUser: addUser,
    addUsers: addUsers,
    addAdUser: addAdUser,
    addAdUsers: addAdUsers,
    deleteUser: deleteUser,
    deleteUsers: deleteUsers,
    updateUser : updateUser,
    hideUserSecrets: hideUserSecrets,
    removeUserSecrets: removeUserSecrets,
    registerDevice: registerDevice,
    unregisterDevice: unregisterDevice,
    updateUserPreferences: updateUserPreferences
};

var expander = require('../../../common/utils/expand.util');

function getUsers(req, res) {
	removeUserSecrets(req.api.queryOptions, '');
	return usersService.getUsers(req.api.userQuery, req.api.queryOptions, req.api.queryExpantion);
}

function getUser(req, res) {
	var userId = req.api.userQuery.id;
	removeUserSecrets(req.api.queryOptions, '');
	return usersService.getUser(userId, req.api.queryOptions, req.api.queryExpantion);
}

function addUser(req, res) {
	var user = req.api.userQuery.user;
	var ad = false;
	return usersService.addUsers([user], ad, req.authentication.userObj)
		.then(function (addedUsers) {
			var user = addedUsers[0];
			hideUserSecrets(user);
			return user;
		});
}

function addUsers(req, res) {
	var users = req.api.userQuery.users;
	var ad = false;
	return usersService.addUsers(users, ad, req.authentication.userObj)
		.then(function (users) {
			hideUserSecrets(users);
			return users;
		});
}

function addAdUser(req, res) {
	var adUser = req.api.userQuery.adUser;
	var ad = true;
	return usersService.addUsers([adUser], ad, req.authentication.userObj).then(function (addedUsers) {
		var user = addedUsers[0];
		hideUserSecrets(user);
		return user;
	});
}

function addAdUsers(req, res) {
	var adUsers =  req.api.userQuery.adUsers;
	var ad = true;
	return usersService.addUsers(adUsers, ad, req.authentication.userObj)
		.then(function (users) {
			hideUserSecrets(users);
			return users;
		});
}

function hideUserSecrets(users) {
	if (!users) return;

	var _users = !Array.isArray(users) ? [users] : users;

	_users.forEach(function (user) {
		delete user.secrets;
		delete user.activationToken;
		delete user.resetPasswordToken;
		delete user.hash;

		if (user.groups) {
			user.groups.forEach(function (group) {
				hideUserSecrets(group.users);
			});
		}
	});
}

function removeUserSecrets(queryExpantion, paths) {
	var fieldsToRemove = ['secrets', 'activationToken',
    'resetPasswordToken', 'hash'];
    expander.fieldsRomover(fieldsToRemove, queryExpantion, paths);
    return;
}

function deleteUser(req, res) {
	var userId = req.api.userQuery.id;
	return usersService.deleteUsers([userId]);
}

function deleteUsers(req, res) {
	var usersIds = req.api.userQuery.ids;
	return usersService.deleteUsers(usersIds, true);
}

function updateUser(req, res) {
	var userId = req.api.userQuery.id;
	var updateFields = req.api.userQuery.user;
	return usersService.updateUser(userId, updateFields, req.authentication.userObj);
}

function registerDevice(req, res) {
	var userId = req.api.userQuery.id;
	var device = req.api.userQuery.device;
	return usersService.registerDevice(userId, device, req.authentication.userObj);
}

function unregisterDevice(req, res) {
	var userId = req.api.userQuery.id;
	var device = req.api.userQuery.device;
	return usersService.unregisterDevice(userId, device, req.authentication.userObj);
}

function updateUserPreferences(req) {
    return usersService.updateUserPreferences(req.authentication.userObj, req.api.userQuery.newUserPreferences)
        .then(function (user) {
            hideUserSecrets(user);
            return user;
        });
}
