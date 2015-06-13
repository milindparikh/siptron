
var aws_fdl_config = require("./aws_fdl_config.js");

var AWS = require("aws-sdk");
AWS.config.update({region: aws_fdl_config.region });
var iam = new AWS.IAM();

var DOC = require("dynamodb-doc");
var dynamodb = new AWS.DynamoDB();
var docClient = new DOC.DynamoDB();


exports.create = function  () {

    create_fdl_tables(aws_fdl_config.config_fdl_tables, eolforcreate);
    
//    create_fdl_security_policies();
//    create_fdl_security_roles();

}

// version 06052015 expects 
//   { name=<name>, canonical_user_id = <cui>, account_id=<acct_id> }


exports.define = function(value) {
   define_fdl (aws_fdl_config.fdl_config_table_id_definition, value);
}
exports.describe = function() {
    describe_fdl();
}


exports.status = function() {
    status_fdl();
}

function status_fdl() {
    console.log("ok");    
}


function describe_fdl() {
    params = {};
    params.Key = {id : aws_fdl_config.fdl_config_table_id_definition};
    params.TableName = aws_fdl_config.fdl_config_table;


    docClient.getItem(params, function (err, data) {
	if (err) console.log(err) 
	else console.log(data);
    });
    
 }

function define_fdl (key, value) {
    var params = {
	TableName: aws_fdl_config.fdl_config_table /* required */
    };
    dynamodb.describeTable(params, function(err, data) {
	if(err) {console.log(err)}
	else {

	    if (data.Table.TableStatus == 'ACTIVE') {
		var params = {};
		params.TableName = aws_fdl_config.fdl_config_table;
		params.Item = {    
		    id: key,
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




function create_fdl_security_roles() {
    var fdlSecurityRoles = aws_fdl_config.fdl_security_roles;
    var totalRoles = fdlSecurityRoles.length;
    function decr() {
	totalRoles = totalRoles - 1;
	if (totalRoles == 0) {
	    eolforcreate();
	}
    }
    
    for (index = 0; index < fdlSecurityRoles.length; index++) {
	create_fdl_security_role(fdlSecurityRoles[index], decr);
    }

    
}







function create_fdl_security_role(roleName, callFunc) {

    var vSecurityRoleParams = "aws_fdl_config" + "." + aws_fdl_config.fdl_security_role_prefix+roleName+"_params";
    console.log(vSecurityRoleParams);
    
    var securityRoleParams = eval(vSecurityRoleParams);

    function getPolicyArnFromPolicyName(roleName, securityRoleParams, callFunc) {
	
	if (securityRoleParams.PolicyArn.pFuncEvaluateParams == true) {
	    var policyName = eval(securityRoleParams.PolicyArn.pFuncParams[0]);
	    
	    console.log("POLICY: " + policyName);
	    
	    var params = {};
	    params.TableName = aws_fdl_config.security_policies_info_table;
	    params.Key = {securityPolicyName: policyName};    
	    
	    docClient.getItem(params, function (err, data) {
		if (err) {
		    console.log(err);
		    callFunc();
		}
		else {
		    console.log("POLICY2: " + policyName);
		    console.log(policyName);
		    console.log(data);
		    var policyArn = data.Item.value.Arn;
		    console.log(policyArn);
		    createRole(roleName, securityRoleParams, policyArn, callFunc);
		}
	    });
	}
			     
	else {
	    var policyArn = securityRoleParams.PolicyArn;
	    createRole(roleName, securityRoleParams, policyArn, callFunc);
	}
    }

    function createRole (roleName, securityRoleParams, policyArn, callFunc) {

	var params = {
	    AssumeRolePolicyDocument: JSON.stringify(securityRoleParams.AssumeRolePolicyDocument), 
	    RoleName: securityRoleParams.RoleName, /* required */
	};
	iam.createRole(params, function(err, data) {
	    if (err) {
		console.log(err, err.stack);
		callFunc();
	    }
	    else   {
		console.log(data);
		var fullRole = data.Role;
		
		var params = {
		    PolicyArn: policyArn, /* required */
		    RoleName: roleName /* required */
		};
		iam.attachRolePolicy(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack);
			callFunc();
		    }
		    else {    
			console.log(data);  
			var params = {};
			params.TableName = aws_fdl_config.security_roles_info_table;
		 	params.Item = {
			    securityRoleName: roleName,
			    value: fullRole
			}
			console.log(params);
			
			docClient.putItem(params, function (err, data) {
			    if (err) {
				console.log(err);
				callFunc();
			    }
			    else {
				console.log(data);
				callFunc();
			    }
			});

		    }
		});
	    }
	});
    }

    if (securityRoleParams.PolicyArn.processingDirective) {
	
	if (securityRoleParams.PolicyArn.processingDirective == true) {
	    var pFunc = eval(securityRoleParams.PolicyArn.pFunc);
	    pFunc(roleName, securityRoleParams, callFunc);
	}
    }
    else {
	createRole (roleName, securityRoleParams, securityRoleParams.PolicyArn, callFunc) ;
    }
    

}




function create_fdl_security_policies() {
    var fdlSecurityPolicies = aws_fdl_config.fdl_security_policies;
    var totalPolicies = fdlSecurityPolicies.length;
    function decr() {
	totalPolicies = totalPolicies - 1;
	if (totalPolicies == 0) {
	    eolforcreate();
	}
    }
    
    for (index = 0; index < fdlSecurityPolicies.length; index++) {
	create_fdl_security_policy(fdlSecurityPolicies[index], decr);
    }

}




function create_fdl_security_policy(policy, callFunc) {

    var vSecurityPolicyParams = "aws_fdl_config" + "." + aws_fdl_config.fdl_security_policy_prefix+policy+"_params";
    console.log(vSecurityPolicyParams);
    
    var securityPolicyParams = eval(vSecurityPolicyParams);
    securityPolicyParams.PolicyDocument = JSON.stringify(securityPolicyParams.PolicyDocument);
    
    console.log(securityPolicyParams);
    
    iam.createPolicy(securityPolicyParams, function(err, data) {
	if (err) {
	    console.log(err, err.stack);
	    callFunc();
	} // an error occurred
	else {
	    console.log(data);     

	    var params = {};
	    params.TableName = aws_fdl_config.security_policies_info_table;
	    params.Item = {    
		securityPolicyName: data.Policy.PolicyName,
		value: data.Policy
	    }
	    docClient.putItem(params, function (err, data) {
		if (err) {
		    console.log(err) ;
		    callFunc();		    
		}
		else  { 
		    console.log(data);
		    callFunc();		    
		}
	    });
	}
    });
}

function eolforcreate() {
    console.log("ok");
}
