'use strict';
const AWS= require('aws_sdk');
const index = require('./index');
const lambda = new AWS.Lambda();

exports.getTCS = async (event,context) => {

 // Install watchdog timer as the first think you do
  setupWatchdogTimer(event, context);

   if((event.headers !=null  && event.headers != undefined)  
  && (event.headers['x-correlationid'] !=null  && event.headers['x-correlationid'] != undefined && event.headers['x-correlationid'] != "" )
  && ((event.headers['x-nab-e2eTraceId'] !=null  && event.headers['x-nab-e2eTraceId'] != undefined && event.headers['x-nab-e2eTraceId'] != "" ) || (event.headers['x-nab-e2etraceid'] !=null  && event.headers['x-nab-e2etraceid'] != undefined && event.headers['x-nab-e2etracetd'] != "" ))
  && ((event.headers['x-nab-clientApplication'] !=null  && event.headers['x-nab-clientApplication'] != undefined && event.headers['x-nab-clientApplication'] != "" ) || (event.headers['x-nab-clientapplication'] !=null  && event.headers['x-nab-clientapplication'] != undefined && event.headers['x-nab-clientapplication'] != "" ))
  && (event.headers['x-nab-consumer'] !=null  && event.headers['x-nab-consumer'] != undefined && event.headers['x-nab-consumer'] != "" )
  && ((event.headers['x-nab-requestDateTime'] !=null  && event.headers['x-nab-requestDateTime'] != undefined && event.headers['x-nab-requestDateTime'] != "" )|| (event.headers['x-nab-requestdatetime'] !=null  && event.headers['x-nab-requestdatetime'] != undefined && event.headers['x-nab-requestdatetime'] != "" )))
    {
       
    if(event.body != null && event.body != undefined)  
    {
     let jsonEventBody=JSON.parse(event.body);
     if((jsonEventBody.transaction_narration!= null && jsonEventBody.transaction_narration!= undefined && jsonEventBody.transaction_narration!= "")
     && (jsonEventBody.institution!= null && jsonEventBody.institution!= undefined && jsonEventBody.institution!= ""))
     {  
     
   let result = await index.callBasiq(jsonEventBody.transaction_narration,jsonEventBody.institution);
   if(/[2]\d\d/.test(result.statusCode))
   {
       var response = {
        'statusCode': result.statusCode,
        'headers': {'Content-Type': 'application/json',
                    'x-correlationid': event.headers['x-correlationid']},
        'body': JSON.stringify({
            "message": result.body
        }),
        'isBase64Encoded': false
    };
   return response;
   }
   else if(/[4]\d\d/.test(result[0].statusCode)){
    var response = {
        'statusCode': result[0].statusCode,
        'headers': {'Content-Type': 'application/json',
                    'x-correlationid': event.headers['x-correlationid']},
        'body': JSON.stringify({
            "message": "Bad request - " + result[0].error.data[0].detail          
        }),
        'isBase64Encoded': false
    };
   return response;
   }
   else {
    var response = {
        'statusCode': result[0].statusCode,
        'headers': {'Content-Type': 'application/json',
                    'x-correlationid': event.headers['x-correlationid']},
        'body': JSON.stringify({ 
           "message": result[0].error,
           "attempts": result[1]
        }),
        'isBase64Encoded': false
    };
return response;
   }
   
  } 
    else{
        var response = {
        "statusCode":  400,
       "headers": {'Content-Type': 'application/json',
                   'x-correlationid': event.headers['x-correlationid']},
        "body": JSON.stringify({
           "message": "Bad request - Required query parameters 'transaction_narration' and 'institution'."
        }),
        'isBase64Encoded': false
    };
    return response;
    }
}
  else
   {
    var response = {
       "statusCode": 400,
       "headers": {'Content-Type': 'application/json',
                   'x-correlationid': event.headers['x-correlationid']},
        "body": JSON.stringify({
           "message": "Bad request - Required query parameters 'transaction_narration' and 'institution'."
        }),
        'isBase64Encoded': false
    };
    return response;
   }
}
else
{
    
    var response = {
        "statusCode":  400,
        "headers": {'Content-Type': 'application/json'},
        "body": JSON.stringify({
            "message": "Bad request - Required headers x-correlationid,x-nab-e2eTraceId,x-nab-clientApplication,x-nab-consumer and x-nab-requestDateTime."
         }),
         'isBase64Encoded': false
     };
     return response;
}
}

function setupWatchdogTimer(event, context) {
  // When timer triggers, emit an event to the 'myErrorHandler' function
  const timeoutHandler = () => {
    // Include original event and request ID for diagnostics
    const message = {
      message: 'Function timed out',
      originalEvent: event,
      originalRequestId: context.awsRequestId
    };

    // Invoke with 'Event' handling so we don't want for response
    const params = {
      FunctionName: 'myErrorHandler',
      InvocationType: 'Event',
      Payload: JSON.stringify(message)
    };

    // Emit event to 'myErrorHandler', then callback with an error from this
    // function
  //  lambda.invoke(params).promise()
    //  .then(() => callback(new Error('Function timed out')));
 }

  // Set timer so it triggers one second before this function would timeout
  setTimeout(timeoutHandler, context.getRemainingTimeInMillis() - 1000);
}
