var apiAuthorization         = require('../../common/middlewares/apiAuthorization.middleware'),
    groupParamsValidation    = require('./groupsParamsValidation.middleware'),
    groupRulesValidation     = require('./groupsRulesValidation.middleware'),
    groupController          = require('./groups.controller'),
    groupModel               = require('./groups.document'),
    sw                       = require('swagger-node-express'),
    param                    = require('../../common/paramTypes'),
    swe                      = sw.errors;


module.exports = function(app,swagger) {

    this.app = app;
    this.swagger = swagger;

    /**
     * init the module
     **/
    this.init = function() {
        this.registerRoutes();
    };

    /**
     * routing's
     **/
    this.registerRoutes = function() {
        // Validate authentication
        app.all('/groups*',[ apiAuthorization.validate ]);

        //Retrieve all groups
        app.get('/groups', [apiAuthorization.validatePermission("manage/groups/get"), groupParamsValidation.getGroups], groupController.getAll);
        //Retrieve AD groups from AD
        app.get('/groups/ad', [apiAuthorization.validatePermission("manage/groups/get"), groupParamsValidation.getAdGroups], groupController.getAdGroups);
        //Retrieve groups from all directories
        app.get('/groups/allDirectories', [apiAuthorization.validatePermission("manage/groups/get"), groupParamsValidation.getAdGroups], groupController.getAllDirectoriesGroups);
        //Count all groups
        app.get('/groups/count', [apiAuthorization.validatePermission("manage/groups/get"), groupParamsValidation.count], groupController.count);
        //Retrieve the group with the specified _id
        app.get('/groups/:group', [], groupController.findByIdName);
        //Retrieve list of groups with the specified _ids
        app.post('/groups/byIds', [ apiAuthorization.validatePermission("manage/groups/get"), groupParamsValidation.findByIds], groupController.findByIds);
        //Retrieve the users of the group with the specified _id
        app.get('/groups/:group/users', [apiAuthorization.validatePermission("manage/groups/get"), groupParamsValidation.getGroupUsers], groupController.getGroupUsers);
        // Add a new group
        app.post('/groups', [ apiAuthorization.validatePermission("manage/groups/add"), groupParamsValidation.addGroup, groupRulesValidation.addGroup], groupController.addGroup);
        // Add a new AD group
        app.post('/groups/ad', [ apiAuthorization.validatePermission("manage/groups/add"), groupParamsValidation.addADGroup], groupController.addAdGroups);
        //Add users to group with the specified _id
        app.post('/groups/:group/users', [ apiAuthorization.validatePermission("manage/groups/modify"), groupParamsValidation.addGroupUsers, groupRulesValidation.addGroupUsers], groupController.addGroupUsers);
        // validate a group name
        app.post('/groups/validateName',[ apiAuthorization.validatePermission("manage/groups/modify"), groupParamsValidation.validateName],groupController.validateName);
        //Update Group with the specified _id
        app.put('/groups/:group', [ apiAuthorization.validatePermission("manage/groups/modify"), groupParamsValidation.updateGroup, groupRulesValidation.updateGroup], groupController.updateGroup);
        // Delete Groups
        app.delete('/groups',[ apiAuthorization.validatePermission("manage/groups/remove"), groupParamsValidation.deleteGroups, groupRulesValidation.deleteGroups], groupController.deleteGroups);
        //Delete the Group with the specified _id
        app.delete('/groups/:group',[ apiAuthorization.validatePermission("manage/groups/remove"), groupParamsValidation.deleteGroup, groupRulesValidation.deleteGroup], groupController.deleteGroupByIdName);
        //Delete users to group with the specified _id
        app.delete('/groups/:group/users', [ apiAuthorization.validatePermission("manage/groups/remove"), groupParamsValidation.deleteGroupUsers], groupController.deleteGroupUsers);

        //add api documentation
        swagger.addModels(groupModel)
            .addGet(this.getGroups)
            .addGet(this.getAdGroups)
            .addGet(this.getAllDirectoriesGroups)
            .addGet(this.getGroupById)
            .addGet(this.getGroupUsers)
            .addPost(this.byIds)
            .addPost(this.addGroup)
            .addPost(this.addAdGroup)
            .addPost(this.addGroupUsers)
            .addPost(this.validateName)
            .addPut(this.updateGroup)
            .addDelete(this.deleteGroups)
            .addDelete(this.deleteGroup)
            .addDelete(this.deleteGroupUsers);
    };

    //document spec  - for api docs
    this.getGroups = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups",
            "notes" : "Returns all user groups with metadata.",
            "summary" : "Returns all user groups with metadata.",
            "method": "GET",
            "parameters" : [
                sw.queryParam("limit", "Limits the result set to a defined number of results. Enter 0 (zero) or leave blank not to limit.", "int", false, false),
                sw.queryParam("skip", "Defines how many items to skip before returning the results. ", "int", false, false),
                sw.queryParam("search", "Enter a search query to return results matching the query.", "string", false, false),
                sw.queryParam("dn", "Search for a group using an Active Directory dn as the search query. Use the semi-colon ; delimiter to search multiple groups.", "string", false, false),
                sw.queryParam("orderby", "Orders the results by field name. You can add multiple sort fields separated by a comma delimiter ',' ", "string", false, false),
                sw.queryParam("desc", "Defines the order of the results. True returns results in a descending order.", "boolean", false, false),
                sw.queryParam("onlyAD", "Searches only Active Directory user groups.", "boolean", false, false),
                sw.queryParam("noAD", "Search only for non-Active Directory groups.", "boolean", false, false),
                sw.queryParam("exactMatch", "Searches exact matches when searching by the Active Directory dn.", "boolean", false, false),
                sw.queryParam("usersCount", "Counts the number of users in each group.", "boolean", false, false),
                sw.queryParam("includeDomain", "Returns the domain details of each AD group.", "boolean", false, false)
            ],
            "type" : "array",
            "items" : {"$ref" : "group"},
            "responseMessages" : [swe.invalid('search'),swe.invalid('skip'), swe.forbidden()],
            "nickname" : "getGroups"
        }
    };

    //document spec  - for api docs
    this.getAdGroups = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/ad",
            "notes" : "This operation does not search for groups created directly in Sisense.",
            "summary" : "Searches for groups directly in Active Directory.",
            "method": "GET",
            "parameters" : [
                sw.queryParam("limit", "Limits the result set to a defined number of results. Enter 0 (zero) or leave blank not to limit. - 0 or blank to not limit", "int", false, false),
                sw.queryParam("checkExist", "Check if a group exists in Active Directory, and if not, searches groups created in Sisense.", "boolean", false, false),
                sw.queryParam("search", "Enter a search query to return results matching the query.", "string", false, false),
                sw.queryParam("domain", "Enter a domain name or id.", "string", false, false)
            ],
            "type" : "array",
            "items" : {"$ref" : "ADgroup"},
            "responseMessages" : [swe.invalid('search'),swe.invalid('skip'), swe.forbidden()],
            "nickname" : "getAdGroups"
        }
    };

    this.getAllDirectoriesGroups = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/allDirectories",
            "notes" : "This function searches groups created in Sisense, and if not found, will search in Active Directory groups.",
            "summary" : "Searches for groups in all directories.",
            "method": "GET",
            "parameters" : [
                sw.queryParam("limit", "Limits the result set to a defined number of results. Enter 0 (zero) or leave blank not to limit. - 0 or blank to not limit", "int", false, false),
                sw.queryParam("search", "Enter a search query to return results matching the query.", "string", false, false),
                sw.queryParam("usersCount", "Returns the number of users per group.", "boolean", false, false),
                sw.queryParam("includeDomain", "Returns the domain details of each AD group.", "boolean", false, false)
            ],
            "type" : "array",
            "items" : {"$ref" : "group"},
            "responseMessages" : [swe.invalid('search'),swe.forbidden()],
            "nickname" : "getAllDirectoriesGroups"
        }
    };

    this.getCountGroups = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/count",
            "notes" : "count groups",
            "summary" : "count groups",
            "method": "GET",
            "type" : "count",
            "parameters" : [ sw.queryParam("search", "start with", "string", false, false) ],
            "responseMessages" : [swe.invalid('search'),swe.forbidden()],
            "nickname" : "countGroups"
        }
    };

    this.getGroupById = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/{group}",
            "notes" : "Metadata includes name, role ID, created date and time, and last update date and time.",
            "summary" : "Returns metadata for a group by group ID or name.",
            "method": "GET",
            "parameters" : [ sw.pathParam("group", "The ID or username of the group", "string") ],
            "type" : "group",
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "getGroupById"
        }
    };

    this.getGroupUsers = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/{group}/users",
            "notes" : "Metadata includes the user's username, role ID, email, first and last names, active state, created date, last login, and last update date.",
            "summary" : "Returns a list of users in a group together with each user's metadata.",
            "method": "GET",
            "parameters" : [ sw.pathParam("group", "The group's ID or username.", "string") ],
            "type" : "array",
            "items" : {"$ref" : "userResponse"},
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "getGroupUsers"
        }
    };

    this.byIds = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/byIds",
            "notes" : "Returns a list of groups by groups IDs.",
            "summary" : "Returns a list of groups by groups IDs.",
            "method": "POST",
            "parameters" : [
                sw.bodyParam("List[string]", "List of groups Ids", "List[string]"),
                sw.queryParam("usersCount", "Returns the number of users per group.", "boolean", false, false),
                sw.queryParam("includeDomain", "Returns the domain details of each AD group.", "boolean", false, false)
            ],
            "type" : "array",
            "items" : {"$ref" : "group"},
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "byIds"
        }
    };

    this.addGroup = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups",
            "notes" : "Adds a new Sisense user group.",
            "summary" : "Adds a new Sisense user group.",
            "method": "POST",
            "parameters" : [ sw.bodyParam("List[group]", "The group object that needs to be added.", "List[regularGroup]") ],
            "type" : "regularGroup",
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "addGroup"
        }
    };

    this.addAdGroup = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/ad",
            "notes" : "If you add an objectSid key, then the data will not be imported again from Active Directory. It is recommended to use the Active Directory cn (common name) or name, but not both. The cn is preferred.",
            "summary" : "Adds a new Active Directory user group.",
            "method": "POST",
            "parameters" : [ sw.bodyParam("List[ADgroup]", "The group object that needs to be added to the collection.", "List[ADgroup]") ],
            "type" : "group",
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "addGroup"
        }
    };

    this.addGroupUsers = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/{group}/users",
            "notes" : "Adds users to a Sisense user group.",
            "summary" : "Adds users to a Sisense user group.",
            "method": "POST",
            "parameters" : [
                sw.pathParam("group", "The group's ID or name.", "string"),
                sw.bodyParam("List[string]", "The IDs or usernames of the users that need to be added to the group.", "List[string]")
            ],
            "type" : "array",
            "items" : {"type" : "string"},
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "addGroupUsers"
        }
    };

    this.validateName = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/validateName",
            "notes" : "Checks if the group exists.",
            "summary" : "Checks if the group exists.",
            "method": "POST",
            "parameters" : [sw.bodyParam("group", "The name of the group to validate.", "validateName")],
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "type" : "boolean",
            "nickname" : "validateName"
        }
    };

    this.updateGroup = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/{group}",
            "notes" : "Updates a group by group ID or name. What are we updating? name, role (only for AD)",
            "summary" : "Updates a group by group ID or name. What are we updating? name, role (only for AD)",
            "method": "PUT",
            "parameters" : [
                sw.pathParam("group", "The group's ID or name.", "string"),
                sw.bodyParam("groupUpdate", "The group object that needs to be updated.", "group")
            ],
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "updateGroup"
        }
    };

    this.deleteGroups = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups",
            "notes" : "Deletes multiple groups by group name or ID.",
            "summary" : "Deletes multiple groups by group name or ID.",
            "method": "DELETE",
            "parameters" : [
                sw.bodyParam("deleteGroup", "The IDs of the groups to delete.", "deleteGroup")
            ],
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "deleteGroups"
        }
    };

    this.deleteGroup = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/{group}",
            "notes" : "Deletes a group by group ID or name.",
            "summary" : "Deletes a group by group ID or name.",
            "method": "DELETE",
            "parameters" : [
                sw.pathParam("group", "The group's ID or name.", "string"),
                sw.queryParam("deleteAdUsers", "Select true if you want to delete the users of the Active Directory group.", "boolean", false, false)
            ],
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "deleteGroup"
        }
    };

    this.deleteGroupUsers = {
        'spec': {
            "description" : "Operations about groups",
            "path" :"/groups/{group}/users",
            "notes" : "Removes users from a user group.",
            "summary" : "Removes users from a user group.",
            "method": "DELETE",
            "parameters" : [
                sw.pathParam("group", "The group's ID or name.", "string"),
                sw.bodyParam("List[string]", "The user IDs or usernames to remove from the group.", "List[string]")
            ],
            "type" : "array",
            "items" : {"type" : "string"},
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "deleteGroupUsers"
        }
    };
};
