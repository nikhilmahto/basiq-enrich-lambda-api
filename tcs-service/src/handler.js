'use strict';
const index = require('./index');
exports.getTCS = async (event) => {
  if((event.headers !=null  && event.headers != undefined) && (event.headers['x-correlationid'] !=null  && event.headers['x-correlationid'] != undefined && event.headers['x-correlationid'] != "" ))
    {
    if(event.body != null && event.body != undefined)  
    {
     let jsonEventBody=JSON.parse(event.body);
     if(jsonEventBody.transaction_narration!= null && jsonEventBody.transaction_narration!= undefined && jsonEventBody.transaction_narration!= "")
     {
        let result = await index.callBasiq(jsonEventBody.transaction_narration,event.headers['x-correlationid']);
    

   if(/[2]\d\d/.test(result.statusCode))
   {
       const response = {
        "statusCode": result.statusCode,
        "headers": result.headers,
        "body": JSON.stringify({
            "response": result.body,
            "x-correlationid": result.request.headers['x-correlationid']
        })    
    };
    return response;
   }
   else
   {
    if(/[4]\d\d/.test(result.statusCode))
    {
        const response = {
        "statusCode": result[0].statusCode,
        "headers": result[0].options.headers,
        "body": JSON.stringify({
            "response": result[0].error,
            "x-correlationid": result[0].options.headers['x-correlationid']
        })  
    };
    return response;
   }
   else if(/[5]\d\d/.test(result.statusCode)){
    const response = {
        "statusCode": result[0].statusCode,
        "headers": result[0].options.headers,
        "body": JSON.stringify({
            "response": result[0].error,
            "attempts": result[1],
            "x-correlationid": result[0].options.headers['x-correlationid']
        })
    };
    return response;
   }
   
  } 
    }
    else{
         const response = {
       // "statusCode": 400,
       "headers": event.headers,
        "body": JSON.stringify({
           "response": "Bad Request - Please enter the 'transaction_narration'."
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
        "body": JSON.stringify({
           "response": "Bad Request - Request Body can't be blank. Please enter the 'transaction_narration'."
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
