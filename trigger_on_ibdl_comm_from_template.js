var publishToTopic = '{publishTopic}';


exports.handler = function(event, context) { 
    console.log("Got event from " + "");

    console.log(event.Records[0].Sns.Message);

    var jsonObj = JSON.parse(event.Records[0].Sns.Message);

    
    function endCall(err, data) {
	if (err) {
	    context.fail("Unknown command type"); 
	} 
	else {
	    context.succeed("ok"); 
	}
    }
    

    if (jsonObj.type == 'request') {
	funcRequest (jsonObj, publishToTopic, endCall);
    }
    else if (jsonObj.type == 'response') {
	funcResponse (jsonObj, endCall);
    }
    else {
	context.succeed("Unknown command type"); 
    }
}

function funcRequest (obj, topic, endCall) {
    if (obj.command == 'ping') {
	console.log("should respond with a pong");
	endCall(null, "ok");
    }
    else {
	endCall("error", "");
    }
}
    
function funcResponse(obj, endCall) {
    endCall(null, "ok");
}
