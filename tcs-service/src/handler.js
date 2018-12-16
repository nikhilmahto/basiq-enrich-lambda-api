'use strict';
const index = require('./index');
exports.getTCS = async (event) => {

    let jsonEventBody=JSON.parse(event.body);
    if((jsonEventBody != null && jsonEventBody != undefined)  &&  (( jsonEventBody.transaction_narration != null && jsonEventBody.transaction_narration != undefined ))){
        let result = await index.callBasiq(jsonEventBody.transaction_narration);
    

   if(result.statusCode == 200)
   {
       const response = {
        "statusCode": result.statusCode,
        "headers": result.headers,
        "body": JSON.stringify(result.body)    // body must be returned as a string
    };
    return response;
   }
   else
   {
        const response = {
        "statusCode": result.statusCode,
        "headers": result.options.headers,
        "body": JSON.stringify(result.error)    // body must be returned as a string
    };
    return response;
   }
  } 
  else
   {
        const response = {
       // "statusCode": 400,
    //    "headers": {
     //     "Content-Type": "application/json"
      // },
        "body": JSON.stringify("Bad Request - Please enter the mandatory parameter 'transaction_narration'.")   // body must be returned as a string
    };
    return response;
   }
}
