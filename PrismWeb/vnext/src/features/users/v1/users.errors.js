/**
 * Custom errors for users
 *
 * @created: 22/10/15
 */

'use strict';

var util = require('util');
var standardApiErrors = require('../../../common/errors/standardApiErrors');
var baseCode = 2000;

module.exports = {
    UserNotFoundError : UserNotFoundError,
    UsersMustBeAnArrayError: UsersMustBeAnArrayError,
    UserMissingRequiredFieldsError: UserMissingRequiredFieldsError,
    UserAlreadyExists: UserAlreadyExists,
    UserDuplicationFoundInRequestError: UserDuplicationFoundInRequestError,
    UserRoleSuperNotAllowedError: UserRoleSuperNotAllowedError,
    UserExceedLicenseError: UserExceedLicenseError,
    UserWithNoPrincipalNameNotAllowedError: UserWithNoPrincipalNameNotAllowedError,
    UserRequierdFieldCannotBeEmpty: UserRequierdFieldCannotBeEmpty,
    UserInvalidGroupsError: UserInvalidGroupsError,
    UserWithSuperRoleCannotBeDeletedError: UserWithSuperRoleCannotBeDeletedError,
    UserPasswordPolicyViolation: UserPasswordPolicyViolation,
    UserSuperUserCannotBeUpdated: UserSuperUserCannotBeUpdated,
    UserBadIdError: UserBadIdError
};

/* Users errors */

function UserNotFoundError(userId, ad, adUserSid, options) {
    var isArray = Array.isArray(userId);
    if (isArray && userId.length === 1) {
        userId = userId[0];
        isArray = false;
    }
    var message = 'User' + (isArray ? 's' : '') + ' not found' + (ad ? ' in Active Directory' : '')  + '.'
    options = options || {};
    if (!ad) {
        if (!Array.isArray(userId)) {
            options._id = userId;
        } else {
            options.ids = userId;
        }
    } else {
        if (userId) options.userName = userId;
        if (adUserSid) options.objectSid = adUserSid;
    }
    var resourceType = 'user';
    var code = baseCode + 1;
    UserNotFoundError.super_.call(this, code, message, resourceType, undefined, options);
}
util.inherits(UserNotFoundError, standardApiErrors.NotFoundError);

function UsersMustBeAnArrayError(users, options) {
    var message = 'Expected the \'users\' parameter to be of type: array but got: ' + typeof users + '.';
    var code = baseCode + 2;
    UsersMustBeAnArrayError.super_.call(this, code, message, options);
}
util.inherits(UsersMustBeAnArrayError, standardApiErrors.BadRequestError);

function UserMissingRequiredFieldsError(requiredFields, options) {
    var message = 'The user object must contain' + ((requiredFields.length === 1) ? ' the field ' : ' at least one of these fields: ') + requiredFields.join(', ');
    var code = baseCode + 3;
    UserMissingRequiredFieldsError.super_.call(this, code, message, options);
}
util.inherits(UserMissingRequiredFieldsError, standardApiErrors.UnprocessableEntityError);

// TODO: change this
function UserAlreadyExists(users, options) {
    var message = 'username/email already exists';
    options = options || {};
    options.existingUsers = users.map(function (user) {
        var limitedUser = {};
        if (user.userName) {
            limitedUser.userName = user.userName;
        }
        if (user.email) {
            limitedUser.email = user.email;
        }

        return limitedUser;
    });
    var resourceType = 'user';
    var code = baseCode + 4;
    UserAlreadyExists.super_.call(this, code, message, options);
}
util.inherits(UserAlreadyExists, standardApiErrors.BadRequestError);

// TODO: this
function UserDuplicationFoundInRequestError(options) {
    var message = 'duplicate users found in request';
    var resourceType = 'user';
    var code = baseCode + 5;
    UserDuplicationFoundInRequestError.super_.call(this, code, message, options);
}
util.inherits(UserDuplicationFoundInRequestError, standardApiErrors.BadRequestError);

function UserRoleSuperNotAllowedError(options) {
    var message = 'It\'s impossible to add a user with sysadmin (super) role through the API.';
    var resourceType = 'user';
    var code = baseCode + 6;
    UserRoleSuperNotAllowedError.super_.call(this, code, message, options);
}
util.inherits(UserRoleSuperNotAllowedError, standardApiErrors.BadRequestError);

function UserExceedLicenseError(numberLeft, numberAttempted, role, options) {
    var message = 'You are trying to add ' + numberAttempted + ' users with "' + role + '" role, but your license allows for ' + numberLeft + ' more users with this role.';
    var resourceType = 'user';
    var code = baseCode + 7;
    UserExceedLicenseError.super_.call(this, code, message, options);
}
util.inherits(UserExceedLicenseError, standardApiErrors.BadRequestError);

function UserWithNoPrincipalNameNotAllowedError(user, options) {
    var message = 'Cannot add user with no principal name.';
    options = options || {};
    options.user = user;
    var resourceType = 'user';
    var code = baseCode + 8;
    UserWithNoPrincipalNameNotAllowedError.super_.call(this, code, message, options);
}
util.inherits(UserWithNoPrincipalNameNotAllowedError, standardApiErrors.BadRequestError);

function UserRequierdFieldCannotBeEmpty(field, options) {
    var message = 'The property ' + field + ' is required and cannot be empty.';
    options = options || {};
    var resourceType = 'user';
    var code = baseCode + 9;
    UserRequierdFieldCannotBeEmpty.super_.call(this, code, message, options);
}
util.inherits(UserRequierdFieldCannotBeEmpty, standardApiErrors.BadRequestError);

function UserInvalidGroupsError(field, options) {
    var message = 'invalid groups for user';
    options = options || {};
    var resourceType = 'user';
    var code = baseCode + 10;
    UserInvalidGroupsError.super_.call(this, code, message, options);
}
util.inherits(UserInvalidGroupsError, standardApiErrors.BadRequestError);

function UserWithSuperRoleCannotBeDeletedError(userId, options) {
    var message = 'Cannot delete user with role \'super\'. user id: ' + userId;
    options = options || {};
    var resourceType = 'user';
    var code = baseCode + 11;
    UserWithSuperRoleCannotBeDeletedError.super_.call(this, code, message, options);
}
util.inherits(UserWithSuperRoleCannotBeDeletedError, standardApiErrors.BadRequestError);

function UserPasswordPolicyViolation(users, options) {
    options = options || {};
    var message = options.message;
    var _users = Array.isArray(users) ? users : [users];

    options.userPasswordViolation = _users.map(function (user) {
        var limitedUser = {};
        if (user.userName) {
            limitedUser.userName = user.userName;
        }
        if (user.email) {
            limitedUser.email = user.email;
        }

        return limitedUser;
    });
    var resourceType = 'user';
    var code = baseCode + 12;
    UserPasswordPolicyViolation.super_.call(this, code, message, options);
}
util.inherits(UserPasswordPolicyViolation, standardApiErrors.BadRequestError);

function UserSuperUserCannotBeUpdated(options) {
    var message = 'You cannot update the sys admin user\'s details';
    var resourceType = 'user';
    var code = baseCode + 13;
    UserSuperUserCannotBeUpdated.super_.call(this, code, message, options);
}
util.inherits(UserSuperUserCannotBeUpdated, standardApiErrors.ForbiddenError);

function UserBadIdError(userId) {
    var message = "Invalid user ID: The user ID '" + userId + "' could not be parsed." +
        ((userId.length && userId.length != 24) ? " Provided ID contains " + userId.length + " characters, but should be 24 characters long." : "");
    var resourceType = "user";
    var code = baseCode + 12;
    UserBadIdError.super_.call(this, code, message);
}
util.inherits(UserBadIdError, standardApiErrors.BadRequestError);
