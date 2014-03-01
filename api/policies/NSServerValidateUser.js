/**
 * ValidateUser
 *
 * @module      :: Policy
 * @description :: Add a new user if necessary and retrieve the user's UUID.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    console.log('validate user ... ');
    req.appdev = {};

    // TODO: Implement ADCore.user.current(req).GUID,
    // Assign userLang from session information
//    var guid = ADCore.user.current(req).GUID;
    var guid = null;
    var userLang = 'en'; // get user default language from session info
    if ( req.param('test') ) {
        guid = '9ACB3BAC-C706-5096-4ED0-2557002E3ADE';
        req.body.lastSyncTimestamp = Date.now() - 10;
        req.body.username = 'jon@vellacott.co.uk';
        req.body.password = 'manila';
   }
    else if ( req.param('test2') ) {
        guid = '5678';
        req.body.lastSyncTimestamp = Date.now() - 10;
    }


    var uuid = null;
    NSServerUser.findOne({GUID:guid})
    .done(function(err, userObj){

        if (err) {
            // exit policy chain w/o calling next();
            ADCore.comm.error(res, 'Failed to validate user during sync, ' + err);
        }

        else if (userObj) {
            endValidation('Found existing user, uuid = ' + userObj.UUID, req, userObj, next);
        }

        else { // User doesn't exist in model, create new user
            console.log('creating new user for guid = ' + guid);
            var newUUID = ADCore.util.createUUID();
            NSServerUser.create({UUID:newUUID, GUID:guid, default_lang:userLang})
            .done(function(err, userObj){
                if (err) {
                    // exit policy chain w/o calling next();
                    ADCore.comm.error(res, 'Failed to create user during sync: ' + err);
                } else {
                    endValidation('Created new user record for GUID ' + guid, req, userObj, next);
                }
            });
        } // else

    }); // .done()
};

var endValidation = function(logMsg, req, userObj, next) {
    console.log(logMsg);
    req.appdev.userUUID = userObj.UUID;
    req.appdev.userLang = userObj.default_lang;
    next(); // allow next policy to execute
};
