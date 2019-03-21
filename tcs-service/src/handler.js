'use strict';
const index = require('./index');
exports.getTCS = async (event) => {
    console.log("NN:" + event.headers);
   if((event.headers !=null  && event.headers != undefined) && (event.headers['x-correlationid'] !=null  && event.headers['x-correlationid'] != undefined && event.headers['x-correlationid'] != "" )
  && (event.headers['x-nab-e2eTraceId'] !=null  && event.headers['x-nab-e2eTraceId'] != undefined && event.headers['x-nab-e2eTraceId'] != "" )
  && (event.headers['x-nab-clientApplication'] !=null  && event.headers['x-nab-clientApplication'] != undefined && event.headers['x-nab-clientApplication'] != "" )
  && (event.headers['x-nab-consumer'] !=null  && event.headers['x-nab-consumer'] != undefined && event.headers['x-nab-consumer'] != "" )
  && (event.headers['x-nab-requestDateTime'] !=null  && event.headers['x-nab-requestDateTime'] != undefined && event.headers['x-nab-requestDateTime'] != "" ))
    {
       
    if(event.body != null && event.body != undefined)  
    {
     let jsonEventBody=JSON.parse(event.body);
     if((jsonEventBody.transaction_narration!= null && jsonEventBody.transaction_narration!= undefined && jsonEventBody.transaction_narration!= "")
     && (jsonEventBody.institutionId!= null && jsonEventBody.institutionId!= undefined && jsonEventBody.institutionId!= ""))
     {
        console.log("Event_Headers: " + event.headers);   
        let result = await index.callBasiq(jsonEventBody.transaction_narration,jsonEventBody.institutionId,event.headers);
    

   if(/[2]\d\d/.test(result.statusCode))
   {
       const response = {
        "statusCode": result.statusCode,
        "headers": result.headers,
        "body": JSON.stringify({
            "message": result.body,
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
            "message": result[0].error,
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
            "message": result[0].error,
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
        "statusCode": 400,
       "headers": event.headers,
        "body": JSON.stringify({
           "message": "Bad Request - Please enter the 'transaction_narration' and 'institutionId'."
        })   // body must be returned as a string
    };
    return response;
    }
}
  else
   {
        const response = {
       "statusCode": 400,
       "headers": event.headers,
        "body": JSON.stringify({
           "message": "Bad Request - Please enter the 'transaction_narration' and 'institutionId'."
        })   // body must be returned as a string
    };
    return response;
   }
}
else
{
    
    const response = {
        "statusCode": 400,
        "headers": event.headers,
         "body": JSON.stringify(
             {"message": "Bad Request - Please enter the mandatory headers 'x-correlationid','x-nab-e2eTraceId','x-nab-clientApplication','x-nab-consumer','x-nab-requestDateTime'."}
      )
     };
     return response;
}
}

