'use strict';
const index = require('./index');
exports.getTCS = async (event) => {
    if((event.headers !=null  && event.headers != undefined) && (event.headers['x-correlationid'] !=null  && event.headers['x-correlationid'] != undefined))
    {
    let jsonEventBody=JSON.parse(event.body);
    if((jsonEventBody != null && jsonEventBody != undefined)  &&  (( jsonEventBody.transaction_narration != null && jsonEventBody.transaction_narration != undefined )))
    {
        let result = await index.callBasiq(jsonEventBody.transaction_narration,event.headers['x-correlationid']);
    

   if(/[2]\d\d/.test(result.statusCode))
   {
       const response = {
        "statusCode": result.statusCode,
        "headers": result.headers,
        "body": JSON.stringify({
            "response": result.body,
            "x-correlationid": result.headers['x-correlationid']
        })    
    };
    return response;
   }
   else
   {
    if(/[4]\d\d/.test(result.statusCode))
    {
        const response = {
        "statusCode": result.statusCode,
        "headers": result.options.headers,
        "body": JSON.stringify({
            "response": result.error,
            "attempts": 1,
            "x-correlationid": result.options.headers['x-correlationid']
        })  
    };
    return response;
   }
   else if(/[5]\d\d/.test(result.statusCode)){
    const response = {
        "statusCode": result.statusCode,
        "headers": result.options.headers,
        "body": JSON.stringify({
            "response": result.error,
            "attempts": 3,
            "x-correlationid": result.options.headers['x-correlationid']
        })
    };
    return response;
   }
   }
  } 
  else
   {
        const response = {
       // "statusCode": 400,
       "headers": event.headers,
        "body": JSON.stringify({
           "response": "Bad Request - Request Body can't be blank. Please enter the 'transaction_narration'.",
           "x-correlationid": event.headers['x-correlationid']
        })   // body must be returned as a string
    };
    return response;
   }
}
else
{
    const response = {
        // "statusCode": 400,
        "headers": event.headers,
         "body": JSON.stringify(
             {"response": "Bad Request - Please enter the mandatory header 'x-correlationid'."}
      )
     };
     return response;
}
}
