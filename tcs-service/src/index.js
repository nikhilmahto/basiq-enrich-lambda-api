
const rp = require('request-promise');

if(process.env.BASIQ_USER_TOKEN == undefined &&  process.env.COUNTRY == undefined && process.env.BASIQ_API_URL == undefined)
{
 // console.log("Fetching Data from properties file for testing purpose");
   require('dotenv').config({path: __dirname + '/../test/data/localenv.env'});
}

const apitoken = process.env.BASIQ_USER_TOKEN;
const country = process.env.COUNTRY;
const basiqUrl = process.env.BASIQ_API_URL;
//console.log("Data Fetched from LAMBDA service environment variables: ");

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
    json: true 
   });
}
};

var enrich = {
 getDetails: function(token,narration,institutionId){
return rp({
   method: 'GET',
    uri: basiqUrl + '/enrich?q='+ narration +'&country='+ country +'&institution='+ institutionId,
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token.access_token
    },
    json: true,
   resolveWithFullResponse: true
   });
}
};

const callBasiq = async (narration,institutionId,retries=0) =>
{
try
{
const btoken = await basiq.getToken();
const response = await enrich.getDetails(btoken,narration,institutionId);
return response;
}
catch(err)
{
 var jsonerrcontent=JSON.parse(JSON.stringify(err));
 if( /[4]\d\d/.test(err.statusCode))
 {
   console.log("Operation Failed: " + " --- " + err.statusCode + " --- " + jsonerrcontent.error.data[0].type + " --- " +  jsonerrcontent.error.data[0].code + " --- " + jsonerrcontent.error.data[0].title);
  
}
 else if( /[5]\d\d/.test(err.statusCode) && retries < 3 )
 {
    console.log("Basiq API Servers Connectivity Issue: Retry Attempt: " + retries + ". Error Code: " +  err.statusCode);
    const turnsLeft = retries + 1;
    return callBasiq(narration,institutionId,turnsLeft);
 }
 else{
    console.log("Operation Failed: " + " --- " + err.statusCode + " --- " + jsonerrcontent.error.data[0].type + " --- " +  jsonerrcontent.error.data[0].code + " --- " + jsonerrcontent.error.data[0].title);
 }
return [err,retries];
}
}

module.exports.basiq = basiq;
module.exports.enrich = enrich;
module.exports.callBasiq = callBasiq;

