const jsonWebToken = require('jsonwebtoken');
const env_config = require('config');
const Q = require('q');
const configMongo = require('../dal/appConfigMongo');
const userService = require('../../features/users/v1/users.service');
const uuid = require('node-uuid');
var logger = require('../logger').default('sso-middleware');

const JWT_SSO = 'jwt';
const TIME_WINDOW_MINUTES = 5;

module.exports = sso;

function sso(req, res, next) {
	let ssoPromise = Promise.resolve();

	if (!req.cookies[env_config.cookie.name] && !req.cookies[env_config.jwtCookie.name]) {
		ssoPromise = configMongo.findOne({ name : 'sso' }, null, true)
			.then(config => {
				if (!config || !config.enabled || config.ssoType.toLowerCase() !== JWT_SSO || !config.loginUrl) {
					throw new Error('sso config problem');
				}

				let enforceJti;

				return Q.ninvoke(jsonWebToken, 'verify', req.query.jwt, config.sharedSecret)
					.then(jwt => jwt)
					.catch(err => { throw err; })
					.then(jwt => {
						if (!config.lowSecurityJwtSso || jwt.jti) {
							enforceJti = true;
						}

						validateJwtFields(jwt, enforceJti);
						validateJwtExpiration(jwt);

						if (jwt.domain) {
							jwt.sub += '@' + jwt.domain;
						}

						return userService.getUserByLoginName(jwt.sub)
							.then(users => {
								let user;

								if (users.length > 1) {
									user =  users.find(user => (user.email && (jwt.sub.toLowerCase() === user.email.toLowerCase()))) ||
											users.find(user => !user.activeDirectory);

									if (!user) throw new Error('Unable to authenticate user');
								} else {
									user = users[0];
								}

								if (user) return user;

								if (jwt.domain) throw new Error('Domain user not found');

								return userService.addUsers([{ userName: jwt.sub, email: jwt.sub, firstName: jwt.sub, sso: true }],
																undefined, undefined, {sso: true}).then(users => users[0]);
							}).then(user => {
								if (enforceJti) {
									validateJwtJti(jwt.iat, jwt.jti, user);
								}

								const userExistingSsoToken = user.secrets && user.secrets.tokens && user.secrets.tokens.sso;

								const ssoToken = userExistingSsoToken || uuid();

								return updateUser(user, jwt.iat, jwt.jti, ssoToken)
									.then(updatedUser => {
										if (user && user._id) {
											return setJwtCookie(res, addUserDataToJwt(jwt, user._id, ssoToken, config.sharedSecret));
										} else {
											throw new Error('Unable to authenticate user');
										}
									});
							});
				});
		});
	}

	ssoPromise
		.then(finished => res.redirect(req.query['return_to'] || '/app/main'))
		.catch(err => {
            logger.error(err.message);
			res.send('An error occurred while trying to authenticate you using Single-Sign-On. Please ask your administrator for assistance.<br>' +
            'Administrators may log in using the manual <a href=\"/spotway/#/access/signin\">Login page</a>');
		});
}

function validateJwtFields(jwt, enforceJti) {
	if (!jwt.sub) {
		throw new Error('jwt must contain sub');
	}

	if (!jwt.iat) {
		throw new Error('jwt must contain iat');
	}

	if (enforceJti && !jwt.jti) {
		throw new Error('jwt must contain jti');
	}
}

function validateJwtExpiration(jwt) {
	const currentTime = new Date().getTime() / 1000;

	// fallback to 5 minutes default expiration
	if ((currentTime - jwt.iat) > (TIME_WINDOW_MINUTES * 60)) {
		// Wrong creation time
		throw new Error('Creation time not synched');
	}
}

function validateJwtJti(iat, jti, user) {
	// First, we check if the jwt-iat is not older than the one that was saved for the user
	if (user.ssoTokenIat && (user.ssoTokenIat > iat))
	{
		throw new Error('Invalid Token, please initiate a new one');
	}

	// Second, we check if the same jti was already used
	if (user.ssoToken && (user.ssoToken === jti))
	{
		throw new Error('Invalid Token, please initiate a new one');
	}
}

function updateUser(user, iat, jti, ssoToken) {
	// TODO: migrate ssoToken to be called jti (ssoToken and the parameter with the same name are two different things)
	let updateFields = {
		ssoToken: jti,
		ssoTokenIat: iat,
		secrets: user.secrets || {}
	};

	updateFields.secrets.tokens = updateFields.secrets.tokens || {};

	updateFields.secrets.tokens.sso = ssoToken;

	return userService.updateUser(user._id, updateFields, undefined, true);
}

function addUserDataToJwt(jwt, userId, ssoToken, secret) {
	jwt.userId = userId;
	jwt.ssoToken = ssoToken;

	return jsonWebToken.sign(jwt, secret);
}

function setJwtCookie(res, jwt) {
	const today = new Date();

	return configMongo.findOne({'name' : 'security'}, null, true)
		.then(config => {
			// Cookie expiration is in milliseconds
			var cookieDaysExpiration = config.cookieExp || 7;
			var expires = config.sessionOnlyCookie ? 0 : new Date(today.getTime() +(cookieDaysExpiration * 24 * 60 * 60 * 1000));

			res.cookie(env_config.jwtCookie.name, jwt, { expires: expires, httpOnly: true, secure: (config.secureCookie === true) });
		});
}
