
const rp = require('request-promise');

//Only needed when Lambda is running locally or NOCK testing is being done
//require('dotenv').config({path: __dirname + '/../test/data/localenv.env'});
// PLEASE COMMENT THE ABOVE LINE IF RUNNING the command from console

const apitoken = process.env.BASIQ_USER_TOKEN;
const institutionId = process.env.INSTITUTION_ID;
const country = process.env.COUNTRY;
const basiqUrl = process.env.BASIQ_API_URL;



var basiq = {
 getToken: function(){
 return rp({ 
   method: 'POST',
    uri: basiqUrl + '/token',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'basiq-version': '2.0',
    'Authorization': 'Basic ' + apitoken
    },
    json: true // Automatically stringifies the body to JSON
   //resolveWithFullResponse: true
   });
}
};

var enrich = {
 getDetails: function(token,narration){
return rp({
   method: 'GET',
    uri: basiqUrl + '/enrich?q='+ narration +'&country='+ country +'&institution='+ institutionId,
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token.access_token
    },
    json: true, // Automatically stringifies the body to JSON
    resolveWithFullResponse: true
   });
}
};

const callBasiq = async (narration,retries=1) =>
{
try
{
const btoken = await basiq.getToken();
const response = await enrich.getDetails(btoken,narration);
 return response;
}
catch(err)
{
 var jsonerrcontent=JSON.parse(JSON.stringify(err));
 if( /[4]\d\d/.test(err.statusCode))
 {
   console.log("Operation Failed: " + " --- " + err.statusCode + " --- " + jsonerrcontent.error.data[0].type + " --- " +  jsonerrcontent.error.data[0].code + " --- " + jsonerrcontent.error.data[0].title);
 }
 else if( /[5]\d\d/.test(err.statusCode) && retries < 4 )
 {
    console.log("Basiq API Servers Connectivity Issue: Retry Attempt: " + retries + ". Error Code: " +  err.statusCode);
    const turnsLeft = retries + 1;
    return callBasiq(turnsLeft);
 }
 else{
    console.log("Operation Failed: " + " --- " + err.statusCode + " --- " + jsonerrcontent.error.data[0].type + " --- " +  jsonerrcontent.error.data[0].code + " --- " + jsonerrcontent.error.data[0].title);
 }
return err;
}
}

module.exports.basiq = basiq;
module.exports.enrich = enrich;
module.exports.callBasiq = callBasiq;


