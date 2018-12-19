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

//console.log(process.env.BASIQ_USER_TOKEN);

describe('Basiq Enrich API Call - Get API Token', () => {
 beforeEach( () => {
  nock(process.env.BASIQ_API_URL,{
    reqheaders: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '2.0',
      'Authorization': 'Basic ' +  process.env.BASIQ_USER_TOKEN,
      'x-correlationid': process.env.X_CORRELATIONID
      }
  })
  .post('/token')
  .reply(200, response1);
});
 
 it('It should return basiq access token for API', () => {
sourceFile.basiq.getToken(process.env.X_CORRELATIONID)
      .then(response1 => {
      //  console.log("3: ");
       expect(response1.token_type).to.equal(tokenType);
       expect(response1.expires_in).to.be.equal(expireIn);
       expect(response1.access_token).to.equal(jsonApiToken.access_token);
      
      });
  });
});

describe('Basiq Enrich API Call - Get Transaction Details', () => {
  beforeEach( () => {
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

 });


   it('It should return Enrich details for the transaction', () => {
    sourceFile.enrich.getDetails(jsonApiToken,narration,process.env.X_CORRELATIONID)
    .then(response2 => {
      var jsoncontent = JSON.parse(JSON.stringify(response2));
     expect(jsoncontent.body.merchant.businessName).to.equal(mybusinessName);
     expect(jsoncontent.body.merchant.website).to.equal(mywebsite);
    });
 
}); 

});


