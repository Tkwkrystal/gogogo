module.exports = {
	getUsers: getUsers,
	getUser: getUser,
	addUsers: addUsers,
	updateUser: updateUser,
	deleteUsers: deleteUsers,
	removeUsersFromGroup : removeUsersFromGroup,
	checkPasswordPolicy: checkPasswordPolicy,
	registerDevice: registerDevice,
	unregisterDevice : unregisterDevice,
	getUserByLoginName: getUserByLoginName,
	parseStringUserToUsernameAndDomain: parseStringUserToUsernameAndDomain,
    updateUserPreferences: updateUserPreferences
};

var Q               	= require('q');
var _               	= require('lodash');
var usersDal			= require('./users.dal');
var usersErrors			= require('./users.errors');
var usersFactory		= require('./users.factory');
var objectId			= require('mongodb').ObjectID;
var ldapService			= require('../../ldap/v1/ldap.service');
var groupsService		= require('../../groups/v1/groups.service');
var rolesService		= require('../../roles/v1/roles.service');
var rolesErrors			= require('../../roles/v1/roles.errors');
var ldapDomainsService	= require('../../ldapDomains/v1/ldapDomains.service');
var hashService			= require('../../../common/security/hash');
var dbUtils				= require('../../../common/dal/dbUtils');
var expander			= require('../../../common/utils/expand.util');
var commonErrors		= require('../../../common/errors/common.errors');
var expandErrors		= require('../../../common/errors/expand.errors');
var principalRemoval	= require('../../../common/principalRemoval.event');
var licenseService		= require('../../../common/services/license.service');
var secSettingsService	= require('../../settings/settings.security.service');
var mailTemplateSender 	= require('../../emails/mailTemplateSender');
var serverEnvironment   = require('../../../common/serverEnvironment');

var DEFAULT_PASSWORD_REGEX = new RegExp(
    '^(?=.*\\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*_\\-+={}\\[\\]()<>`\'".,:;\\/|]).{8,255}$'
);

var DEFAULT_PASSWORD_ERROR = 'A password must have at least 8 characters and use one of each of the following:' +
								' letter, number, and special character. You may not reuse the previously used password.'

var DO_PROMISE = true;

function expandQueryFunc(user, expandDest) {
	var query;
	switch (expandDest) {
		case ('groups'):
			if (user.groups && !_.isEmpty(user.groups)) {
				query = {ids: user.groups.join()};
			}
			break;
		case ('adgroups'):
				if (user.adgroups && !_.isEmpty(user.adgroups)) {
					query = {adIds: user.adgroups.join()};
				}
				break;
		case ('role'):
			if (user.roleId) {
				query = user.roleId.toHexString();
			}
			break;
		default:
			throw new expandErrors.ExpandNotFoundError(expandDest);
	}

	return query;
}

function getUsers(userQuery, queryOptions, resourceExpantions) {
	return usersDal.getUsers(userQuery, queryOptions)
		.then(function (users) {
			return expander.expand(users, resourceExpantions, expandQueryFunc);
		});
}

function getUser(userId, queryOptions, resourceExpantions, dontThrow) {
	return usersDal.getUserById(userId, queryOptions)
		.then(function (user) {

			// Throw exception or just return null if the user
			// doesn't exist. default is to throw exception
		    if (!user) {
		        if (!dontThrow){
		        	// user does not exist
		        	throw new usersErrors.UserNotFoundError(userId);
		        }
		        return null;
		    }

			return expander.expand(user, resourceExpantions, expandQueryFunc);
		});
}

function addUsers(users, ad, addingUser, options = {}) {
	if (!Array.isArray(users)) {
		throw new usersErrors.UsersMustBeAnArrayError(users);
	}

	if (_.isEmpty(users)) return Q.when([]);

	return validateUsers(users, ad)
		.then(function () {return ad ? getAdRepresentation(users) : users;})
		.then(function (users) {return ad ? users : checkPasswordPolicy(users)})
		.then(function (users) {return createNewUsersModel(users, ad);})
		.then(checkDuplicates)
		.then(function (users) {return checkExistence(users, undefined, ad);})
		.then(checkLicense)
		.then(function (usersModel) {return usersDal.addUsers(usersModel);})
		.then(function (usersAdded){
			var url = serverEnvironment.getUserLoginUrl();
			var promiseArray = options.sso ? [Q.when()] : _.map(usersAdded, function(user){
				if (user.active) {
					if (!user.email) return Q.resolve();
					if (user.activeDirectory) return mailTemplateSender.userCreatedFromAD(addingUser,user,url,null,true);
					return mailTemplateSender.userCreated(addingUser,user,null,true);
				}
			});
			return Q.all(promiseArray).then(function(){ return usersAdded; });
		});
}

function updateUser(id, updateFields, authUser, systemUpdate) {
	var ad;
	return getUser(id, undefined, {role: {}})
		.then(function(user) {
			ad = user.activeDirectory;
			if (authUser) {
				if (user.role.baseRoleName === 'super' && (authUser.baseRoleName !== 'super')) {
					throw new usersErrors.UserSuperUserCannotBeUpdated();
				}
			}
			delete user.role;
			return user;
		})
		.then(function (user){
			if (!systemUpdate) {
				updateFields = usersFactory.createUpdatedUserModel(updateFields);
				user = _.extend(user, updateFields);
			}

			return user;
		})
		.then(function(updatedUser) {
			return systemUpdate ? updatedUser : validateUser(updatedUser, updatedUser.activeDirectory);
		})
		.then(function(updatedUser) {
			return checkExistence([updatedUser], [updatedUser._id], ad);
		})
		.then(function(userAsArray) {
			if (updateFields.roleId && updateFields.roleId != userAsArray[0].roleId) {
				return checkLicense(userAsArray);
			}
			else {
				return userAsArray;
			}
		})
		.then(function() { return usersDal.updateUser(id, updateFields, true);});
}

function removeUsersFromGroup(groupId) {
	return getUsers({groupId : groupId})
		.then(function(users) {
			var updateUsers = [];
			users.forEach(function(user) {
				var groupIndex = user.groups.indexOf(groupId);
				user.groups.splice(groupIndex, 1);

				updateUsers.push(updateUser(user._id, {groups : user.groups}));
			});

			return Q.all(updateUsers).then(function() {
				return groupId;
			});
		});
}

function registerDevice(id, device, authUser) {
	return getUser(id, { fields:{ 'secrets' : 1, '_id' : 0 }})
		.then(function(user) {
			var updateFields = user
			if (!updateFields.secrets.activeDevices) {
				updateFields.secrets.activeDevices = {};
			}

			updateFields.secrets.activeDevices[device.deviceId] = device.token;

			return updateUser(id, updateFields, authUser, true);
		});
}

function unregisterDevice(id, device, authUser) {
	return getUser(id)
		.then(function(user) {
			var updateFields = { secrets : user.secrets };

			if (updateFields.secrets.activeDevices) {
				delete updateFields.secrets.activeDevices[device.deviceId];
				return updateUser(id, updateFields, authUser, true);
			}

			return Q.when(user);
		});
}

function validateUsers(users, ad) {
	return Q.all(users.map(function (user) {
		return validateUser(user, ad);
	}));
}

function validateUser(user, ad, roles) {
	var shouldCheckRole = false;
	var shouldCheckGroups = false;

	return Q.when()
		.then(function () {
			checkRequiredFields(user, !ad ? ['userName', 'email'] : ['userName', 'objectSid']);
		})
		.then(function () {
			if (user.roleId) {
				shouldCheckRole = true;

				if (!dbUtils.isObjectId(user.roleId)) {
					throw new commonErrors.ObjectIdNotValidError('role', user.roleId);
				}

				if (roles) {
					return _.find(roles, _.matchesProperty('_id', dbUtils.createId(user.roleId)));
				} else {
					return rolesService.getRole(user.roleId);
				}
			}
		})
		.then(function (role) {
			if (shouldCheckRole) {
				if (!role) {
					throw new rolesErrors.roleNotFoundError(user.roleId);
				}
			}

			if (user.groups) {
				shouldCheckGroups = true;
				return groupsService.getGroups({ids: user.groups, origin: 'sisense'});
			}
		})
		.then(function (groups) {
			if (shouldCheckGroups) {
				if ((groups.length != _.uniq(user.groups).length) ||
					_.some(groups, function (group) { return group && (group.admins || group.everyone); })) {
					throw new usersErrors.UserInvalidGroupsError();
				}
			}

			return user;
		});
}

function checkRequiredFields(user, requiredOneOfFields) {
	var userRequierdFields = _.chain(user).keys().intersection(requiredOneOfFields).value();

	if (_.isEmpty(userRequierdFields)) {
		throw new usersErrors.UserMissingRequiredFieldsError(requiredOneOfFields);
	} else {
		userRequierdFields.forEach(function (field) {
			if (user[field].trim() === '') {
				throw new usersErrors.UserRequierdFieldCannotBeEmpty(field);
			}
		});
	}
}

function getAdRepresentation(users) {
	return ldapDomainsService.attachValidLdapDomain(users)
		.then(function (users) {
			return ldapDomainsService.getLdapDomains({enabled: true}, undefined, undefined, {includeDecryptedPassword: true})
				.then(function (ldapDomains) {
					var ldapDomainsMap = {};
					ldapDomains.forEach(ldapDomain => ldapDomainsMap[ldapDomain._id.toHexString()] = ldapDomainsService.createLdapDomainObject(ldapDomain));

					return Q.all(users.map(function (user) {
						return Q.when()
							.then(function () {
								if (user.objectSid) {
									return ldapService.findUserBySid(user.objectSid, ldapDomainsMap[user.ldapDomainId]);
								}
							})
							.then(function (adUser) {
								if (adUser) return adUser;

								if (user.userName) {
									return ldapService.findUser(user.userName, ldapDomainsMap[user.ldapDomainId]);
								}
							})
							.then(function (adUser) {
								if (!adUser) {
									throw new usersErrors.UserNotFoundError(user.userName, true, user.objectSid);
								}

								adUser.roleId = user.roleId;
								adUser.ldapDomainId = user.ldapDomainId;
								return adUser;
							});
					}));
				});
		});
}

function checkPasswordPolicy(usersToCheck, updateUserExistingUser) {
	var _users = Array.isArray(usersToCheck) ? usersToCheck : [usersToCheck];
	var usersWithPasswords = _users.filter(function (user) {
		return user.hasOwnProperty('password');
	});

	if (_.isEmpty(usersWithPasswords)) return usersToCheck;

	return secSettingsService.get(null, DO_PROMISE).then(function (securitySettings) {
        var passwordRegex = securitySettings.passwordRegex ? new RegExp(securitySettings.passwordRegex) : DEFAULT_PASSWORD_REGEX;
        var passwordError = securitySettings.passwordError || DEFAULT_PASSWORD_ERROR;

        var usersWithPasswordViolation = usersWithPasswords.filter(
            function (user) {
                return (!user.password || !passwordRegex.test(user.password));
            });

        if (_.isEmpty(usersWithPasswordViolation)) {
             var promiseValidatePass = updateUserExistingUser && updateUserExistingUser.hash ? hashService.validate(updateUserExistingUser.hash,usersWithPasswords[0].password,updateUserExistingUser.encryptionSHA) : Q.when(false);

            return promiseValidatePass.then(function (passwordsEquals) {
                if(passwordsEquals) {
                    throw new usersErrors.UserPasswordPolicyViolation(usersWithPasswordViolation, {message: passwordError});
                }

                return usersToCheck;
            });
        } else {
            throw new usersErrors.UserPasswordPolicyViolation(usersWithPasswordViolation, {message: passwordError});
        }

	});
}

function createNewUsersModel(users, ad) {
	return Q.all(users.map(function (user) {
		return usersFactory.createNewUserModel(user, ad);
	}));
}

function checkDuplicates(users) {
	var userNamesAndEmails = [];
	var numberOfAllowedDuplicates = 0;
	users.forEach(function (user) {
		var userName = user.userName && user.userName.toLowerCase();
		var email = user.email && user.email.toLowerCase();

		if (userName) {
			userNamesAndEmails.push(userName);
		}

		if (email) {
			userNamesAndEmails.push(email);
		}

		if (userName === email) {
			numberOfAllowedDuplicates++;
		}
	});

	if ((_.uniq(userNamesAndEmails).length + numberOfAllowedDuplicates) != userNamesAndEmails.length) {
		throw new usersErrors.UserDuplicationFoundInRequestError();
	}

	return users;
}

function checkExistence(users, exclutionIds, ad) {
	return usersDal.checkExistence(users, exclutionIds, ad)
		.then(function (existingUsers) {
			if (!_.isEmpty(existingUsers)) {
				throw new usersErrors.UserAlreadyExists(existingUsers);
			}

			return users;
		});
}

function checkLicense(users) {
	var rolesCount = {admin : 0, consumer : 0, contributor : 0};

	return rolesService.getRoles()
		.then(function (roles) {
			users.forEach(function (user) {
				if (user.roleId) {

					var roleId = user.roleId;

					if (typeof roleId === 'string') {
						if (dbUtils.isObjectId(roleId)) {
							roleId = new objectId(roleId);
						} else {
							throw new commonErrors.ObjectIdNotValidError('role', user.roleId);
						}
					}

					var role = _.find(roles, _.matchesProperty('_id', roleId));
					if (!role) {
						throw new rolesErrors.RoleNotFoundError(roleId);
					}

					if (role.baseRoleName === 'super') {
						throw new usersErrors.UserRoleSuperNotAllowedError();
					}

					rolesCount[role.baseRoleName] += 1;
				} else {
					rolesCount.consumer++;
				}
			});

			return verifyRolesAccordingToLicense(rolesCount);
		})
		.then(function () {
			return users;
		});
}

function verifyRolesAccordingToLicense(rolesCount) {
    return licenseService.getLeftLicenses()
        .then(function (leftLicenses) {
            if (rolesCount.admin > leftLicenses.admins) {
            	throw new usersErrors.UserExceedLicenseError(leftLicenses.admins, rolesCount.admin, 'admin');
            }
            else if (rolesCount.contributor > leftLicenses.contributors) {
            	throw new usersErrors.UserExceedLicenseError(leftLicenses.contributors, rolesCount.contributor, 'designer');
            }
            else if (rolesCount.consumer > leftLicenses.consumers) {
            	throw new usersErrors.UserExceedLicenseError(leftLicenses.consumers, rolesCount.consumer, 'viewer');
            }
        });
}

function deleteUsers(usersIds) {

	if (!Array.isArray(usersIds)) {
		throw new usersErrors.UsersMustBeAnArrayError(usersIds);
	}

	if (_.isEmpty(usersIds)) return Q.when([]);

	var uniqIds = _.uniq(usersIds);

	return Q.all([getUsers({ids: uniqIds}), rolesService.getRoles({name: 'super'})])
		.then(function (result) {
			var users = result[0];
			var superRole = result[1][0];

			var usersIds = _.map(users, '_id').map(function (userId) {
				return userId.toHexString();
			});

			var notFoundIds = _.difference(uniqIds, usersIds);

			if (!_.isEmpty(notFoundIds)) {
				throw new usersErrors.UserNotFoundError(notFoundIds);
			}

			var superUser = _.find(users, {roleId: superRole._id});

			if (superUser) {
				throw new usersErrors.UserWithSuperRoleCannotBeDeletedError(superUser._id);
			}

			return usersDal.deleteUsers(uniqIds);
		}).then(function (deletedUser) {
			var principals = uniqIds.map(function (deletedUserId) {
				return { id : deletedUserId, type : 'user'};
			});
			principalRemoval.notifyObservers(principals);
		});
}

function parseStringUserToUsernameAndDomain(stringUser) {
	var parsedUser = {
		username: stringUser,
		domain: ''
	}

	var domainSeperatorPos = stringUser.indexOf('\\');

	if (domainSeperatorPos !== -1) {
		parsedUser.domain = stringUser.substr(0, domainSeperatorPos);
		parsedUser.username = stringUser.substr(domainSeperatorPos + 1);
	} else {
		var domainSeperatorPos = stringUser.lastIndexOf('@');

		if (domainSeperatorPos !== -1) {
			parsedUser.username = stringUser.substr(0, domainSeperatorPos);
			parsedUser.domain = stringUser.substr(domainSeperatorPos + 1);
		}
	}

	return parsedUser;
}

function simpleGetUser(userLoginName) {
	return usersDal.getUsersByEmailOrUsernameIgnoreCase(userLoginName)
		.then(users => {
			return (users.length === 0) ? Promise.resolve([]) : Promise.all(users.map(user => {
					if (!user.activeDirectory) return user;

					return ldapDomainsService.getLdapDomain(user.ldapDomainId)
						.then(function (ldapDomain) {
							return (ldapDomain && ldapDomain.enabled) ? user : undefined;
						});
				}));
		})
		.then(users => {
			return users.filter(user => user !== undefined);
		});
}

function getUserByLoginName(userLoginName) {
	var parsedUser = parseStringUserToUsernameAndDomain(userLoginName);

	if (parsedUser.domain) {
		return ldapDomainsService.getLdapDomains({name: parsedUser.domain, enabled: true})
			.then(function (ldapDomains) {
				var ldapDomain = ldapDomains[0];
				if (ldapDomain) {
					return getUsers({ldapDomainId: ldapDomain._id, userName: parsedUser.username, active: true})
						.then(function (users) {
							var user = users[0];
							if (user) {
								return [user];
							} else {
								return simpleGetUser(userLoginName);
							}
						});
				} else {
					return simpleGetUser(userLoginName);
				}
			});
	} else {
		return simpleGetUser(userLoginName);
	}
}

function updateUserPreferences(user, newUserPreferences) {
    return updateUser(user._id, { preferences: newUserPreferences }, user);
}
