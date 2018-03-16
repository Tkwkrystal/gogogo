var _ = require('underscore');
var Q = require('q');
var hashService = require('../../common/security/hash');
var rolesMigration = require('../roles/roles.migration');
var roleReadService = require('../roles/roleRead.service');
var userService = require('./users.service');
var license =  require('../../common/services/oxygenLicense.service');
var userFactory = require('./users.factory');
var userMongo = require('./users.dal');
var authenticationService = require('../authentication/v1/authentication.service');
const logger = require('../../common/logger').default('superUser-service');

function superUserService() {
    var self = this;


    /**
     * bring the license user from oxygen
     * this is a wrapper and simple validator
     * @return {[type]} [description]
     */
    function getLicenseUser(){
        var licInfo;
        return license.getLicense()
        .then(function(licenseInfo){
            if(licenseInfo && licenseInfo.user && licenseInfo.user.email) {
                return licenseInfo.user;
            }
            throw ('no license user found!');
        });
    }

    function upsertSuperUserFromLicense(licenseUserObj){
        var query = {email : licenseUserObj.email};
        return userFactory.createSuper(licenseUserObj)
        .then(function (userObject){
            return userMongo.upsertWithQuery(query, userObject);
        });
    }

    this.verifySuperUser = function(licenseUserDetails){
        var superExists;
        var licenseUserObj;

        // Verify that super role exists
        return roleReadService.getRoleByIdOrName("super", true)
        .then(function(superRole){
            if (superRole){
                // super role exist, keep going
                return Q.when();
            }
            // Super role doesn't exist, add base roles again
            // This api called during the installation and may be called
            // before the migration has run, so we want to make sure the
            // super roles exist so we can assign the super user
            // the super role
            return rolesMigration.addBaseRoles();
        }).then(function(){
            // Check if there is license user details
            // The installation pass the license user details directly
            if (licenseUserDetails && licenseUserDetails.email && licenseUserDetails.password){
                return Q.when(licenseUserDetails);
            }
            // There is no license user details, take it from oxygen
            // (the migration process take it from oxygen)
            return getLicenseUser();
        }).then(function(luDetails){
            licenseUserObj = luDetails;
            return hashService.create(licenseUserObj.password).then(function (newHash) {
                licenseUserObj.hash = newHash;
                return userService.findByRoleName("super");
            });
        }).then(function(superUser){
            // Check if there is already super user, if yes don't add
            // another one
            if (superUser && !_.isEmpty(superUser)){
                logger.info('system have super user with email : ', superUser[0].email);
                return;
            }
            // If there is no super user exist, change the license user
            // to be the super user
            return upsertSuperUserFromLicense(licenseUserObj);
        }).then(function(){
            return true;
        });
    }
}

superUserService.instance = null;

superUserService.getInstance = function(){
    if(this.instance === null){
        this.instance = new superUserService();
    }
    return this.instance;
};

module.exports = superUserService.getInstance();
