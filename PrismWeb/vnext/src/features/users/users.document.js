

module.exports.models = {
    "pref": { "id": "pref",
        "properties": {
            "localeId": {"type": "string"},
            "language": {"type": "string"}
        }
    },
    "user":{ "id":"user",
        "properties":{
            "userName":{"type":"string"  ,"readonly": true},
            "roleId":{"type":"string"},
            "email":{"type":"string"},
            "firstName":{"type":"string"},
            "lastName":{"type":"string"},
            "activeDirectory":{"type":"boolean"},
            "groups":{"type":"array", "items" : {"type" : "string"}, "description": "array of group ids"},
            "preferences": {"type": "pref", "items": { "$ref": "pref"}},
            "password":{"type":"string"}
        }
    },
    "userCount": { "id": "userCount",
        "properties": {
            "collection": {"type": "string"},
            "count": {"type": "integer"}
        }
    },
    "userResponse":{ "id":"userResponse",
        "properties":{
            "_id":{"type":"string"  ,"readonly": true},
            "userName":{"type":"string"  ,"readonly": true},
            "hash":{"type":"string"  ,"readonly": true},
            "roleId":{"type":"string"},
            "roleName":{"type":"string"},
            "baseRoleName":{"type":"string"},
            "email":{"type":"string"},
            "firstName":{"type":"string"},
            "lastName":{"type":"string"},
            "active":{"type":"boolean"},
            "changePasswordState":{"type":"boolean"},
            "groups":{"type":"array"},
            "pendingExpiration":{"type":"string", "format":"date-time", "readonly": true},
            "created":{"type":"string", "format":"date-time"},
            "lastUpdated":{"type":"string", "format":"date-time","readonly": true},
            "lastLogin":{"type":"string", "format":"date-time" ,"readonly": true},
            "activeDirectory":{"type":"boolean"},
            "adgroups":{"type":"array"},
            "dn":{"type":"string"},
            "principalName":{"type":"string"},
            "uSNChanged":{"type":"string"},
            "createdSso":{"type":"string"},
            "preferences": {"type": "pref"}
        }
    },
    "ADuserSearchResponse":{ "id":"ADuserSearchResponse",
        "properties":{
            "dn":{"type":"string"},
            "cn":{"type":"string"},
            "givenName":{"type":"string"},
            "whenCreated":{"type":"string"},
            "displayName":{"type":"string"},
            "uSNChanged":{"type":"string"},
            "userAccountControl":{"type":"string"},
            "pwdLastSet":{"type":"string"},
            "objectSid":{"type":"string"},
            "sAMAccountName":{"type":"string"},
            "userPrincipalName":{"type":"string"},
            "adgroups":{"type":"array"},
            "mail":{"type":"string"}
        }
    },
    "leftLicenses":{ "id":"leftLicenses",
        "properties":{
            "admins":{"type":"integer"},
            "contributors":{"type":"integer"},
            "consumers":{"type":"integer"}
        }
    },

    "userEmail":{ "id":"userEmail",
        "properties":{
            "email":{"type":"string"}
        }
    },
    "userExist":{ "id":"userExist",
        "properties":{
            "email":{"type":"string"},
            "isExist":{"type":"boolean"},
            "roleId":{"type":"string"}
        }
    },
    "simulateAdd":{ "id":"simulateAdd",
        "properties":{
            "license":{"type": "leftLicenses"},
            "users":{"type": "array", "items": { "$ref": "userExist"}}
        }
    },
    "userListIds": {
        "id":"userListIds",
        "properties": {
            "idsList": {"type": "array", "items": { "type": "string"}}
        }
    },
    "userActivate":{ "id":"userActivate",
        "properties":{
            "password":{"type":"string"},
            "preferences": {"type": "pref"}
        }
    }

}
