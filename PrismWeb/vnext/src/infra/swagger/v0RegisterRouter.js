

function v0RegisterRouter() {

     var routes = [];

        routes.push(
            require('../../obsolete/datasource.router'),
            require('../../features/elasticubes/elasticubes.router'),
            require('../../features/widgets/widgets.router'),
            require('../../features/dashboards/dashboards.router'),
            require('../../features/subscription/subscription.router'),
            require('../../features/users/users.router'),
            require('../../features/groups/groups.router'),
            require('../../features/authentication/authentication.router'),
            require('../../features/shares/shares.router'),
            require('../../features/branding/branding.router'),
            require('../../features/activities/activities.router'),
            require('../../features/servers/servers.router') ,
            require('../../features/logs/logs.router'),
            require('../../features/triggers/triggers.router'),
            require('../../features/geo/geo.router'),
            require('../../features/settings/settings.router'),
            require('../../features/tags/tags.router'),
            require('../../features/metadata/metadata.router'),
            require('../../features/folders/folders.router') ,
            require('../../features/ldap/ldap.router'),
            require('../../features/dashboards/demoSession.router'),
            require('../../features/reporting/reporting.router'),
            require('../../features/roles/roles.router'),
            require('../../features/extplugins/extplugins.router'),
            require('../../features/palettes/palettes.router'),
            require('../../features/datacontext/datacontext.router'),
            require('../../features/hierarchies/hierarchies.router'),
            require('../../features/navver/navver.router'),            
            require('../../features/authConfig/authConfig.router'),
            require('../../features/funAuth/funAuth.router')
        );



    this.register = function(app,sw){

        var instance = null;

        for ( var i = 0, l = routes.length; i < l; i++ ) {
            instance = routes[i];
            instance = new instance(app,sw);

            if(instance.init)
            {
                instance.init(app,sw);
            }

        }

    }


}

v0RegisterRouter.instance =  new v0RegisterRouter();

v0RegisterRouter.getInstance = function(){
    if(this.instance === null){
        this.instance = new v0RegisterRouter();

    }
    return this.instance;
}

module.exports = v0RegisterRouter.getInstance();


