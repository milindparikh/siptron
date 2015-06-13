
var aws_fdl_config = require("./aws_fdl_config.js");

var AWS = require("aws-sdk");
AWS.config.update({region: aws_fdl_config.region });

var DOC = require("dynamodb-doc");
var dynamodb = new AWS.DynamoDB();
var docClient = new DOC.DynamoDB();

var jt = require("./json-template.js").jsontemplate;
var fs = require('fs');

var AdmZip = require('adm-zip');

var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
var uuid = require('uuid');



var pfunc = function(err, data) { 
    if (err) {
        console.log(err, err.stack);
    } else {
        console.log(data);
    }
}


// version 06052015 expects 
//   { name=<name>, canonical_user_id = <cui>, account_id=<acct_id> }


exports.add = function(value) {

    add_ffdl (value.name, value);
}

exports.remove = function(value) {
    remove_ffdl(value.name);
}

exports.list = function() {
    list_ffdls();
}

exports.register = function(value) {
    register_ffdl(value.ffdlName);
}

exports.deregister = function(value) {
    deregister_ffdl(value.name);
}

exports.activate = function(value) {
    activate_ffdl(value.ffdlName) ;
}

exports.add_comm_topic = function(value) {
    
    add_comm_topic_ffdl(value.ffdlName, value);
}


// value : {ffldName: fn, topicArn: ta}

function add_comm_topic_ffdl (ffdlName, value) {

    var params = {};
    params.TableName = aws_fdl_config.ffdl_icc_topics_table;
    params.Item = {    
	ffdlName: ffdlName,
	value: value
    }
    docClient.putItem(params, function (err, data) {
	if (err) console.log(err) 
	else console.log("ok");
    });
    
}

function activate_ffdl(ffdlName) {

    var subscriptionProtocol = "lambda";
    var topicName = aws_fdl_config.ffdl_inbound_comm_channel_prefix + ffdlName;    

    console.log(ffdlName);

    var params = {};
    params.TableName = aws_fdl_config.ffdl_icc_topics_table;
    params.Key = {ffdlName: ffdlName};
    
    console.log(params);
    
    docClient.getItem(params, function (err, data) {
	if (err) {
	    console.log(err) ;
	}
	else {
	    console.log(data);
	    var publishTopicArn = data.Item.value.topicArn;
	    console.log(data);
	    
	    var params = {};
	    params.TableName = aws_fdl_config.topics_info_table;
	    params.Key = {topicName: topicName};
	    docClient.getItem(params, function (err, data) {
		if (err) {
		    console.log(err) ;
		}
		else {
		    var subscriptionOrigination  = data.Item.topicArn;
		    

		    var funcName = aws_fdl_config.ffdl_inbound_comm_channel_function_prefix + ffdlName
		    var fileName = "/tmp/"+funcName+".js";
		    var zipFile = "/tmp/"+funcName+".zip";
		    var templateFile = aws_fdl_config.ffdl_inbound_comm_channel_function_template_prefix;
		    

		    function createLambdaFunction() {
			console.log(templateFile);
			console.log(publishTopicArn);
			
			fs.readFile(templateFile, 'utf8', function (err, data) {
			    if (err) throw err;
			    var jsonText = jt.expand(data, {'publishTopic': publishTopicArn});
			    fs.writeFile(fileName, jsonText, function(err) {
				if(err) {
				    return console.log(err);
				}
				else {
				    
				    console.log("File written");
				    var zip = new AdmZip();
				    zip.addLocalFile(fileName);
				    // get everything as a buffer
				    zip.writeZip(zipFile);
				    console.log("zip File written");
				    writeLambdaFunc(zipFile, funcName, 'lambda', subscriptionOrigination );
				}
			    });
			});
		    }
		    

		    function writeLambdaFunc(zipFile, funcName, subscriptionProtocol, subscriptionOrigination) {
			console.log("now in lambda1");
			var params = {};
			params.TableName = aws_fdl_config.security_roles_info_table;
			params.Key = {securityRoleName: aws_fdl_config.fdl_security_icc_role};
			
			
			docClient.getItem(params, function (err, data) {
			    if (err) {
				console.log(err);
				
			    }
			    else {
				var roleArn = data.Item.value.Arn;


				var fileBuffer = fs.readFileSync(zipFile);
				var params = {
				    Code: {
					ZipFile: fileBuffer
				    },
				    FunctionName: funcName, /* required */
				    Handler: funcName+'.'+ 'handler', /* required */
				    Role: roleArn, /* required */
				    Runtime: 'nodejs', /* required */
				    Description: 'Some',
				    MemorySize: 128,
				    Timeout: 3
				};
				console.log("now in lambda");
				
				lambda.createFunction(params, function(err, data) {
				    if (err) {
					console.log(err, err.stack); // an error occurred
				    }
				    else       { 
					console.log(data);
					var endPoint = data.FunctionArn;
					var params = {
					    Action: 'lambda:invokeFunction', /* required */
					    FunctionName: funcName, /* required */
					    Principal: "sns.amazonaws.com", /* required */
					    StatementId: uuid.v4() /* required */
					};
					lambda.addPermission(params, function(err, data) {
					    if (err) {
						console.log(err);
					    }
					    else {
						console.log(data);
						var params = {
						    Protocol: subscriptionProtocol,
						    TopicArn: subscriptionOrigination,
						    Endpoint: endPoint
						};
						var sns2 = new AWS.SNS();
						
						sns2.subscribe(params, function (err, data) {
						    if (err) {
							console.log(err);
						    }
						    else {
							console.log(data);
						    }
						    
						});
					    }
					});
				    }
				});
			    }
			});
		    }
		    createLambdaFunction();
		}
	    });
	}
    });
}


function deactivate_ffdl(key) {
    
}


function deregister_ffdl(key) {
    var sns = new AWS.SNS();
    var topicName = aws_fdl_config.ffdl_inbound_comm_channel_prefix + key;
}


function register_ffdl(key) {
    var sns = new AWS.SNS();
    var topicName = aws_fdl_config.ffdl_inbound_comm_channel_prefix + key;
    
    var params = {};
    params.Key = {name: key};
    params.TableName = aws_fdl_config.ffdls_info_table;


    

    
    docClient.getItem(params, function (err, data) {
	if (err) {
	    console.log("No data in repository for this lake");
	}
	else {
	    console.log(data);
	    var ffdlAccountId = data.Item.value.account_id.replace(/-/g, '');
	    console.log(ffdlAccountId);
	    
	    sns.createTopic({	'Name': topicName     }, 
			    function (err, result) {
				if (err !== null) {
				    console.log(err);
				    return;
				}
				else {
				    console.log(result);
				    var topicArn = result.TopicArn;
				    var params = {};
				    params.TableName = aws_fdl_config.topics_info_table;
				    params.Item = {
					topicName: topicName,
					value: {
					    topicName: topicName, 
					    topicArn: topicArn
					}
				    }
						
				    docClient.putItem(params, function (err, data) {
					if (err) {
					    console.log(err);
					}
					else {

					    console.log(data);
					    
					    var params = {
						AWSAccountId: [ /* required */
						    ffdlAccountId
						    /* more items */
						],
						ActionName: [ /* required */
						    "Publish"
						    /* more items */
						],
						Label: 'Auth for a FFDL to talk with this FDL', /* required */
						TopicArn: topicArn /* required */
					    };
					    sns.addPermission(params, function(err, data) {
						if (err) console.log(err, err.stack); // an error occurred
						else     console.log(data);           // successful response
					    });
					}
				    });
				}
			    });    
	}
    });
}


    
    


function list_ffdls() {
   var params = {
       TableName: aws_fdl_config.ffdls_info_table, /* required */

   }
    dynamodb.scan(params, function(err, data) {
	if (err) console.log(err, err.stack); // an error occurred
	else {
	    console.log(data);
	 
	}
    });
}
    

function remove_ffdl(key) {
    
    console.log(key);
    var params = {
	Key: {name: {S: key}},
	TableName: aws_fdl_config.ffdls_info_table /* required */

    };
    
    dynamodb.deleteItem(params, function(err, data) {
	if (err) console.log(err, err.stack); // an error occurred
	else     console.log(data);           // successful response
    });
}


function add_ffdl (key, value) {

    var params = {
	TableName: aws_fdl_config.ffdls_info_table /* required */
    };
    dynamodb.describeTable(params, function(err, data) {
	if(err) {console.log(err)}
	else {

	    if (data.Table.TableStatus == 'ACTIVE') {
		var params = {};
		params.TableName = aws_fdl_config.ffdls_info_table;
		params.Item = {    
		    name:  key,
		    value: value
		}
		docClient.putItem(params, function (err, data) {
		    if (err) console.log(err) 
		    else console.log("ok");
		});
	    }
	    else {
		console.log("Unable to write...try again shortly");
	    }
	};
    });
	
}


function create_fdl_tables(tables, nextCall) {
    console.log(tables);

    var totalTables = tables.length;
    function decr() {
	totalTables = totalTables - 1;
	if (totalTables == 0) {
	    nextCall();
	}
    }
    
    for (index = 0; index < tables.length; index++) {
	create_fdl_table(tables[index], decr);
    }
}

function create_fdl_table(table, callFunc) {


	var vAttributeDefinitions = "aws_fdl_config"+"."+table+"_"+aws_fdl_config.config_fdl_tables_attribute_definitions;
	var attributeDefinitions = eval(vAttributeDefinitions);

	var vKeySchema = "aws_fdl_config"+"."+table+"_"+aws_fdl_config.config_fdl_tables_key_schema;
	var keySchema = eval(vKeySchema);
	
	var vProvisionedThroughput = "aws_fdl_config"+"."+table+"_"+aws_fdl_config.config_fdl_tables_provisioned_throughput;
	var provisionedThroughput = eval(vProvisionedThroughput);
	

	var params = {
	    TableName: table /* required */
	};
	dynamodb.describeTable(params, function(err, data) {
	    console.log(table);
	    if (err) {
		if (err.code == 'ResourceNotFoundException') { 
		    
		    var paramCreateTable = {
			AttributeDefinitions: [ /* required */
			attributeDefinitions
			],
			KeySchema: [ /* required */
			    keySchema
			],
			ProvisionedThroughput: provisionedThroughput,
			TableName: table, /* required */
		    };
		    dynamodb.createTable(paramCreateTable, function(err, data) {
			if (err) { console.log(err, err.stack); callFunc(); } // an error occurred
			else   {  console.log(data); callFunc(); }        // successful response
		    });
		    
		}
	    }
	    else     {
		console.log(data); 
		callFunc();
	    }
	});
    
}
