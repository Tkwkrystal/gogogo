const env_config = require('config');
const appLogger = require('./src/common/logger').default('appInit');

if(env_config.webServer.forkEnable) {
    const cluster = require('cluster');

    if (cluster.isMaster) {
        appLogger.info('start cluster');
        var numCPUs = env_config.webServer.forkWorkers || require('os').cpus().length;

        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        appLogger.info('start cluster with', numCPUs, 'workers');

        cluster.on('exit', function () {
            appLogger.info('A worker process died, restarting...');
            cluster.fork();
        });

        return;
    }
}


var swaggerInit = require('./src/infra/swagger/swaggerInit');
var Q = require('q');
var express = require('express'),
    app = express(),
    subpath = express(),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    morgan = require('morgan'),
    compression = require('compression'),
    cookieParser = require('cookie-parser'),
    migration = require('./src/common/migration/mainMigration'),
    booter = require('./src/common/bootstrap'),
    server =  require('./src/common/server'),
    logger = require('./src/common/oldLogger'),
    requestLogger = require('./src/common/logger').default('request'),
    jobBridge = require('./src/common/jobs/jobBridge'),
    moment = require('moment'),
    cors = require('./src/common/middlewares/cors.middleware');

const cookieSessionMid  = require('./src/common/middlewares/cookie.middleware');
var nodeMessenger = require('./src/common/rabbitmq/nodeMessenger.util');
var brokerMessenger = require('./src/common/rabbitmq/brokerMessenger.util');
var featureFlags = require('./src/common/featureFlags');
var osUtils = require('./src/common/utils/os.util');
var pug = require('pug');
var device = require('express-device');
const license =  require('./src/common/services/oxygenLicense.service');
let GlobalizationService = require('./src/features/settings/v1/settings.globalization.service');
let globalizationService = new GlobalizationService();
const ApplicationService = require('./src/features/application/v1/application.service');
var crypto = require('crypto');
const application = require('./src/common/application');
const featuresDal = require('./src/features/featureToggle/v1/features.dal');
const configMongo = require('./src/common/dal/appConfigMongo');
const sso = require('./src/common/middlewares/sso.middleware');
const samlAuthentication = require('./src/common/middlewares/samlAuthentication.middleware.js');
let featuresDalInstance = new featuresDal();
const activitiesService   = require('./src/features/activities/activities.service');
const BaseApiError = require('./src/common/errors/baseApiError').BaseApiError;

var pluginsRoutes = require('./src/features/plugins/plugins.router');
var pluginsNewRoutes = require('./src/features/plugins/plugins_new.router');

const SAML_SSO = 'saml';
const JWT_SSO = 'jwt';
const SAML_HANDLER = '<script>window.location = "/saml?address=" + encodeURIComponent(location.href);</script>';
const LOGIN_HANDLER = '<script>window.location = "/spotway/#/access/signin?src=" + encodeURIComponent(location.href);</script>';
const mobileSSORedirect = '/mobileSSO/success';

var APIv0 = express.Router(),
    swaggerUiRouter = express.Router(),
    swaggerYamlRouter = express.Router();

var pluginsService = require('./src/features/plugins/plugins.service');

// Log host to keep track if IP address changes while app is running
var hostAndPort = osUtils.getHostAndPort();
appLogger.info('osUtils.getHostAndPort() returned ', JSON.stringify(hostAndPort));


//app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: env_config.webServer.jsonLimit }));
app.use(passport.initialize()); // for saml authentication

app.use(function(req, res,next) {
    logger.request(req, res,next);
});

app.use(function(req, res,next) {
    requestLogger.request(req, res);
    next();
});

app.use(compression());
///must be here!!
app.use(cookieParser());

app.use('/jwt', sso);
app.use('/saml', samlAuthentication.validateSamlAuthenticationResponse);

app.use(function(req, res,next) {
    return cookieSessionMid.validate(req, res,next).then((authObj)=>{
        if (req.path.includes('%23')) return res.redirect(req.url.replace('%23', '#'));
        req.authentication = authObj;
        return next();
    }).catch((err) => {
        const isMobileSSO = ((req.path === '/mobileSSO/login') || (req.path === '/mobileSSO/success'));
        if (req.path.startsWith('/app') || req.path == '' || req.path == '/' || req.path === '/sisense.js' || req.path === '/STATIC/saml-auth.html' || isMobileSSO) {
            res.clearCookie(env_config.cookie.name);
            res.clearCookie(env_config.jwtCookie.name);
            if(req.path.startsWith('/app/account')) {
                if (req.path.includes('%23')) return res.redirect(req.url.replace('%23', '#'));
                next();
            } else {
                configMongo.findOne({ name : 'sso' }, null, true)
                    .then(function (config) {
                        if (config && config.enabled) {
                            if (config.ssoType.toLowerCase() === JWT_SSO && config.loginUrl) {
                                res.redirect(config.loginUrl + '?return_to=' + (isMobileSSO ? mobileSSORedirect : req.url));
                            } else if (config.ssoType.toLowerCase() === SAML_SSO && config.loginUrlSaml) {
                                if (req.path !== '/STATIC/saml-auth.html') {
                                    res.send(SAML_HANDLER);
                                } else if (isMobileSSO) {
                                    res.redirect('/saml?address=' + mobileSSORedirect);
                                } else {
                                    res.send('<script>window.location = "/saml?address=" + encodeURIComponent(location.href.split("?return_to=")[1]);</script>');
                                }
                            } else {
                                res.status(500).send('error sso');
                            }
                        } else {
                            res.send(LOGIN_HANDLER);
                        }
                    });
            }
        } else if(req.url.includes('/api')) {
            if (err instanceof BaseApiError) req.authenticationError = err;
            next();
        } else {
            server.sendError(req, res, err);
        }
    });
});

app.use(device.capture());

//app.use(express.bodyParser());

// move booter run to run only after migration finished
// for more details see comment in the new place (down this file)
//booter.run(app);

app.use(function(req, res,next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    //res.header('SiSense-API-Version', 'Beta');

    next();
});

app.use(env_config.webServer.virtualDir, subpath);
app.use(logErrors);
app.use(clientErrorHandler);
app.set('view engine', 'jade');
//swagger.setAppHandler(subpath);

app.logger = requestLogger;


//init server module
server.init(subpath);
//Retrieve all Widgets  shares for a user
subpath.get('/test',function(req,res){
    res.json({test: 'pass'});
});

migration.run()
    .then(function() {
        return featureFlags.init();
    })
    .then(function() {
        return brokerMessenger.init();
    })
    .then(function(){
        // init the job bridge
        appLogger.info('Job bridge init');
        jobBridge.init();

        // Load application object only after migration finished to run.
        // otherwise there is sometime application object doesn't sync
        // with the mongo values, because migration changes not update the
        // application object.
        appLogger.info('Bootstrap loading configuration');
        booter.run(app);

    })
    .catch(function (){

    });

//registerRouter();

function logErrors(err, req, res, next) {
    res.err = err;
    appLogger.error(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    server.sendError(req, res, err);
    //res.send(500, { error: 'internal server error' });
}

app.use('/', (req, res,next) => {
    if(req.url === '/') {
        if(req.authentication && req.authentication.userObj) {
            res.redirect('/app/main#/home');
        } else {
            res.redirect('/app/account');
        }

    } else {
        next();
    }
});

app.use('/sisense.js',(req, res, next) => {
    if(req.query['src'] == 'mobileapp') {
        let activityInfo = {
             platform: req.header['User-Agent'] || '',
             type:'info',
             cat: 'SisenseMobileBI',
             prod: 'webserver',
             vendor: req.query['vendor'] || '',
             version: req.query['version'] || '',
             webuser: req.authentication.userObj.userName
        };
        activitiesService.addDirectActivity('app usage', 'sisense.js', req, activityInfo, undefined, true);
    }

    next();
});

app.use('/sisense.js', express.static('static/sisense.js',{'Content-Encoding': 'gzip'}));

app.use((req, res, next) => {
    let httpUserAgent =  req.header['HTTP_USER_AGENT'] || req.header['http_user_agent'];

    if(httpUserAgent) {
        let activityInfo = {
            platform: httpUserAgent,
            type:'info',
            cat:'NativePhoneApp',
            prod: 'webserver',
            vendor: req.query['vendor'] || '',
            version: req.query['version'] || '',
            webuser: req.authentication.userObj.userName
        };
        activitiesService.addDirectActivity('dashboard view', 'NativePhoneApp', req, activityInfo, undefined, true);
    }

    next();
});

const DEFAULT_CLIENT_PROPERTIES = ['key','active'];
const CLIENT_PROPERTIES_PROPERTY = 'clientProperties';

app.use('/app',(req, res) => {
    Q.all([license.getLicense().then((licenseInfo) => {
        return [{
            'isTrial': (licenseInfo.trial == 'true'),
            'isValid': true,
            'expirationDate': licenseInfo.expires,
            'creationDate': licenseInfo.created,
            'daysLeft': Math.round((new Date(licenseInfo.expires) - new Date()) / (1000 * 3600 * 24)) + 1,
            'isHASupported': licenseInfo.high_availability,
            'licenseUser': licenseInfo.user.email,
            'isNarration': (licenseInfo.isNarration === 'true')
        },licenseInfo.web_rbrnd];
    }).catch(()=>{
       return [undefined,undefined];
    }), globalizationService.get().then((glob) => {
		if (!glob) appLogger.warn('globalization settings are missing!');
		return {localization: (glob && glob.localization) || { default: 'en-US', autoDetectEnabled: true }};
    }), ApplicationService.getVersion(),
        Q.when(application.getSecurity()),
        Q.when(application.getBranding()),
        featuresDalInstance.getFeatures().then(features => {
            let returnFeatures = [];
            let clientProperties = returnFeatures[CLIENT_PROPERTIES_PROPERTY] ? returnFeatures[CLIENT_PROPERTIES_PROPERTY] : DEFAULT_CLIENT_PROPERTIES;

            for(let feature of features) {
                let featureObj = {};
                for(let prop of clientProperties) {
                    featureObj[prop] = feature[prop];
                }
                returnFeatures.push(featureObj);
            }

            return returnFeatures;
        }),
        pluginsService.getBuilder().getBuildInfo()
            .catch(()=>{
                return undefined;
            })
    ]).then(([
        [licenseObject, canRebrand],
        globalizationObject,
        versionObject,
        securityObject,
        brandingObject,
        featuresObject,
        pluginsInfoObject
    ]) => {

        let app = req.path.substring(1);

        // Check if license exists
        if(!licenseObject) {
            res.redirect('/license_not_found.html');
            return;
        }

        // Check if license is vaild
        if(licenseObject && new Date(licenseObject.expirationDate).getTime() < new Date().getTime()) {
            res.redirect('/license_expired.html');
            return;
        }

        // Reqirect root route
        if(app === '') {
            if(req.authentication && req.authentication.userObj) {
                res.redirect('/app/main#/home');
            } else {
                res.redirect('/app/account');
            }
            return;
        }

        if((!req.authentication || !req.authentication.userObj) && app !== 'account') {
            res.redirect('/app/account');
            return;
        }

        if(req.authentication && req.authentication.userObj && app === 'account') {
            res.redirect('/app/main#/home');
            return;
        }

        if(app === 'settings' && !['super','admin'].includes(req.authentication.userObj.baseRoleName)) {
            res.redirect('/app/main#/error?status=404');        // HTTP status 404: Not found
        return;
    }
        let versionHash = crypto.createHash('md5').update(versionObject).digest('hex');
        let props = {
            timeLeft: licenseObject.daysLeft,
            isHASupported: licenseObject.isHASupported,
            isTrial: licenseObject.isTrial,
            pRegex: securityObject.passwordRegex ? securityObject.passwordRegex : null,
            pError: securityObject.passwordError ? securityObject.passwordError : null,
            sessionOnlyCookie: securityObject.sessionOnlyCookie ? securityObject.sessionOnlyCookie : null,
            isNarration: licenseObject.isNarration || null,
            pluginsInfo: pluginsInfoObject
        };
        if (brandingObject && Object.keys(brandingObject).length != 0) brandingObject["enabled"] = canRebrand;
        let param = {
            platform: req.device.type,
            versionHash: versionHash,
            user: '{}',
            version: versionObject,
            props: JSON.stringify(props),
            globalization: JSON.stringify(globalizationObject),
            brand: JSON.stringify(brandingObject ? brandingObject : {}),
            features: JSON.stringify(featuresObject),
            favicon: (brandingObject && brandingObject.favicon) || '/resources/base/images/favicon.ico'
        };
        if (fs.existsSync('./src/features/apps/' + app + '.pug')) {
            let html = pug.renderFile('./src/features/apps/' + app + '.pug', param);
            res.send(html);
        } else {
            res.redirect('/app/main#/error?status=404');
        }

    }).catch(e => {
            res.status(500).send('error app');
            let message = e.message ? e.message : JSON.stringify(e);
            appLogger.error(message);
    });
});

//app.use(/^\/api\/docs(\/.*)?$/, swaggerUiRouter);
app.use('/api', APIv0);
//app.use(/^\/dev\/api\/docs\//, swaggerUiRouter);
//app.use('/dev/api/docs', swaggerUiRouter);
app.use('/dev/api', swaggerUiRouter);
app.use('/dev/api', swaggerYamlRouter);


// Entry for the plugins loader
app.use('/systemPlugins', pluginsNewRoutes);
app.use('/plugins', pluginsRoutes);

app.use('/mobileSSO/success', (req, res, next) => {
    res.end();
});

app.use('/mobileSSO/login', (req, res, next) => {
    res.redirect(mobileSSORedirect);
});

/**
 * oauth endpoint. Needed because oauth providers doesn't support #
 */
app.use('/oauth/:service/callback', function(req, res){
    res.redirect('/app/oauth#/auth/' + req.params.service + req.url.slice(1));
});

swaggerInit.swaggerInit(app, swaggerUiRouter, swaggerYamlRouter).then(function () {
    //iis node configuration
    var port = process.env.PORT ? process.env.PORT : env_config.webServer.port;
    var expressServer = app.listen(port);
    expressServer.timeout = 360000;
    appLogger.info('Listening on port ' +port + ' ...');
    nodeMessenger.connect(expressServer);
}).catch(function(err) {
	appLogger.error(err, err.stack);
});
swaggerInit.swaggerV0Init(APIv0);

