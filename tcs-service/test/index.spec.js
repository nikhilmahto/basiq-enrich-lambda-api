'use strict'
const expect = require('chai').expect;
const nock = require('nock');
const sourceFile = require('../src/index');
const response1 =  require('./data/response1');
const response2 =  require('./data/response2');
require('dotenv').config({path: __dirname + '/data/localenv.env'});
var apitoken = require('./data/token.json');
 var jsonApiToken=JSON.parse(JSON.stringify(apitoken));
 var tokenType = "Bearer";
 var expireIn = 3600;
 var narration = "Garfish Manly NS";
 var mybusinessName = 'Garfish Manly';
 var mywebsite = 'http://garfish.com.au/garfish-manly/';
 let nockscope;

//console.log(process.env.BASIQ_USER_TOKEN);

describe('Unit Testing of TCS Lambda Service using Nock', () => {
 
 it('It should return basiq access token for user\'s API token', () => {
 nockscope = nock(process.env.BASIQ_API_URL,{
    reqheaders: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '2.0',
      'Authorization': 'Basic ' +  process.env.BASIQ_USER_TOKEN,
      'x-correlationid': process.env.X_CORRELATIONID
      }
  })
  .post('/token')
  .reply(200, response1);

return sourceFile.basiq.getToken(process.env.X_CORRELATIONID)
      .then(res1 => {
       expect(res1.token_type).to.equal(tokenType);
       expect(res1.expires_in).to.be.equal(expireIn);
       expect(res1.access_token).to.equal(jsonApiToken.access_token);
      
      });
  });


  it('It should return Enrich details for the transaction narration', () => {

    nock('https://au-api.basiq.io',{
      reqheaders: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jsonApiToken.access_token,
        'x-correlationid': process.env.X_CORRELATIONID
        }
    })
    .get('/enrich')
    .query({q: narration, country: process.env.COUNTRY, institution: process.env.INSTITUTION_ID})
    .reply(200, response2);

  return  sourceFile.enrich.getDetails(jsonApiToken,narration,process.env.X_CORRELATIONID)
    .then(res2 => {
      var jsoncontent = JSON.parse(JSON.stringify(res2));
     expect(jsoncontent.body.response.merchant.businessName).to.equal(mybusinessName);
     expect(jsoncontent.body.response.merchant.website).to.equal(mywebsite);
    });
 
}); 

afterEach(function() {
  nock.cleanAll();
});

});


