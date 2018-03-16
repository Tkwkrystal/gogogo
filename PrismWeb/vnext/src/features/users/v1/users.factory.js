var Q				= require('q');
var _				= require('lodash');
var crypto			= require('crypto');
var objectId		= require('mongodb').ObjectID;
var usersErrors		= require('./users.errors');
var rolesService	= require('../../roles/v1/roles.service');
var hashService			= require('../../../common/security/hash');
var dbUtils			= require('../../../common/dal/dbUtils');

module.exports = {
	createNewUserModel: createNewUserModel,
	createUpdatedUserModel : createUpdatedUserModel
};

var newUserCopyFields = [
	"email",
	"userName",
	"firstName",
	"lastName",
	"preferences"
];

var newAdUserCopyFields = [
	"firstName",
	"lastName",
	"preferences",
	"groups",
	"uSNChanged",
	"dn"
];

function createNewUserModel(user, ad) {
	var shouldAttachRole = false;
	var newUser = _.extend({}, _.pick(user, ad ? newAdUserCopyFields : newUserCopyFields));
    var passwordCalcPromise = Q.when();

	var now = new Date();
	newUser.created = now;
	newUser.lastUpdated = now;

	if (user.groups) {
		newUser.groups = _.uniq(user.groups);
	}

	if (user.preferences && user.preferences.localeId) {
		newUser.preferences = {localeId: user.preferences.localeId};
	}

	if (!ad) {
		newUser.userName = user.userName || user.email;

		if (!user.firstName && user.email) {
			var  fname = user.email?user.email.split('@')[0].trim():'';
			if (fname.charAt(0) === '(') {
                var end = fname.indexOf(')');
                fname = fname.substring(1,end);
            }
			newUser.firstName = fname.trim();
		}

		if (user.password){
            passwordCalcPromise = hashService.create(user.password).then(function (newHash) {
                newUser.hash = newHash;
                newUser.active = true;
                return;
            });
		} else if (user.sso) {
			newUser.active = true;
		} else {
			newUser.active = false;
		}
	}

	if (ad) {
		newUser.active = true;
		newUser.activeDirectory = true;

		newUser.ldapDomainId = dbUtils.createId(user.ldapDomainId);

		var uname;
		var sid;
		var adgroups;
		var principalName = user.principalName || user.userPrincipalName;
		if (!principalName) throw new usersErrors.UserWithNoPrincipalNameNotAllowedError(user);
		if (principalName && principalName.indexOf('@') !== -1) {
		    uname = principalName.substr(0, principalName.indexOf('@'));
		} else {
		    uname = principalName;
		}

		if (user.adgroups){
		    adgroups = _.map(user.adgroups, "objectSid");
		    if (adgroups[0] === undefined) {
		        adgroups = user.adgroups;
		    } else {
		        adgroups = _.map(adgroups, function(adgroup) {
		            if (_.isArray(adgroup)) {
		                return new Buffer(adgroup);
		            } else {
		                return adgroup;
		            }
		        });
		    }

		    newUser.adgroups = adgroups;
		}

		if (user.objectSid && _.isArray(user.objectSid)) {
		    newUser.objectSid = new Buffer(user.objectSid);
		} else if (user.objectSid) {
			newUser.objectSid = user.objectSid;
		}

		if (uname) newUser.userName = uname;
		if (user.givenName) newUser.firstName = user.givenName;
		if (user.sn) newUser.lastName = user.sn;
		if (user.mail) newUser.email = user.mail;
		if (principalName) newUser.principalName = principalName;
	}

	return passwordCalcPromise
		.then(function () {
			if (!user.roleId) {
				shouldAttachRole = true;
				return rolesService.getRoles();
			} else {
				newUser.roleId = new objectId(user.roleId);
			}
		}).then(function (roles) {
			if (shouldAttachRole) {
				var consumerRole = _.find(roles, _.matchesProperty('name', 'consumer'));
				newUser.roleId = consumerRole._id;
			}

			return newUser;
		});
}

function createUpdatedUserModel(updateFields) {
	var allowedFields = ['firstName', 'lastName', 'groups', 'roleId'];
    var objectForSave = _.pick(updateFields, allowedFields);
    if(updateFields.preferences) {
        objectForSave = _.merge(objectForSave, createUserPreferencesModel(updateFields.preferences));
    }

	var now = new Date();
    objectForSave.lastUpdated = now;

	if (objectForSave.roleId) {
        objectForSave.roleId = new objectId(objectForSave.roleId);
	}

	return objectForSave;
}

function createUserPreferencesModel(updateFields) {
    return {
        'preferences.localeId': updateFields.localeId,
        'preferences.language': updateFields.language
    };
}
