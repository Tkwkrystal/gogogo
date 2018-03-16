var token = require('./token'),
    jwt = require('jsonwebtoken');


function grant() {

    this.generatPasswordToken = function(done,error) {

        token(this, 'passwordToken', function (err, token) {
            if(err)
            {
                error(err);
            }
            done(token);
        });

    }
    this.issueJWToken = function(payload,secret,config){

        return  jwt.sign(payload, secret, config);


    };
    this.verifyJWToken = function(payload,secret,config,callback){

        jwt.verify(payload, secret, config, function(err, decoded) {

            callback(decoded);

        });


    };
    
    this.verifyWXToken = function(payload,secret,config,callback){
        jwt.verify(payload, secret, config, function(err, decoded) {
            callback(err,decoded);

        });


    };

}


grant.instance = null;

grant.getInstance = function(){
    if(this.instance === null){
        this.instance = new grant();
        //this.instance.init();
    }
    return this.instance;
}


module.exports = grant.getInstance();



