exports.region = "us-east-1";

exports.config_fdl_tables = ['fdl_config_table', 'ffdls_info_table', 'topics_info_table', 'functions_info_table', 'security_policies_info_table', 'security_roles_info_table', 'ffdl_icc_topics_table' ];

exports.fdl_config_table = 'fdl_config_table';
exports.ffdls_info_table = 'ffdls_info_table';
exports.topics_info_table = 'topics_info_table';
exports.functions_info_table = 'functions_info_table';
exports.security_policies_info_table = 'security_policies_info_table';
exports.security_roles_info_table = 'security_roles_info_table';
exports.ffdl_icc_topics_table = 'ffdl_icc_topics_table';


exports.config_fdl_tables_attribute_definitions = 'attribute_definitions';
exports.config_fdl_tables_key_schema = 'key_schema';
exports.config_fdl_tables_provisioned_throughput = 'provisioned_throughput';



// TABLE tbl_fdl_config

exports.fdl_config_table_attribute_definitions = 
    {
	AttributeName: 'id', /* required */
	AttributeType: 'S' /* required */
    };
exports.fdl_config_table_key_schema = 
    {
	AttributeName: 'id', /* required */
	KeyType: 'HASH' /* required */
    };

exports.fdl_config_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.fdl_config_table_id_definition = 'id';




// TABLE topics_info_table

exports.topics_info_table_attribute_definitions = 
    {
	AttributeName: 'topicName', /* required */
	AttributeType: 'S' /* required */
    };
exports.topics_info_table_key_schema = 
    {
	AttributeName: 'topicName', /* required */
	KeyType: 'HASH' /* required */
    };

exports.topics_info_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.topics_info_table_id_definition = 'topicName';




// TABLE functions_info_table

exports.functions_info_table_attribute_definitions = 
    {
	AttributeName: 'functionName', /* required */
	AttributeType: 'S' /* required */
    };
exports.functions_info_table_key_schema = 
    {
	AttributeName: 'functionName', /* required */
	KeyType: 'HASH' /* required */
    };

exports.functions_info_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.functions_info_table_id_definition = 'topicName';




// TABLE security_policies_info_table

exports.security_policies_info_table_attribute_definitions = 
    {
	AttributeName: 'securityPolicyName', /* required */
	AttributeType: 'S' /* required */
    };
exports.security_policies_info_table_key_schema = 
    {
	AttributeName: 'securityPolicyName', /* required */
	KeyType: 'HASH' /* required */
    };

exports.security_policies_info_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.security_policies_info_table_id_definition = 'securityPolicyName';






// TABLE ffdl_icc_topics_table

exports.ffdl_icc_topics_table_attribute_definitions = 
    {
	AttributeName: 'ffdlName', /* required */
	AttributeType: 'S' /* required */
    };
exports.ffdl_icc_topics_table_key_schema = 
    {
	AttributeName: 'ffdlName', /* required */
	KeyType: 'HASH' /* required */
    };

exports.ffdl_icc_topics_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.ffdl_icc_topics_table_id_definition = 'ffdlName';




// TABLE security_roles_info_table

exports.security_roles_info_table_attribute_definitions = 
    {
	AttributeName: 'securityRoleName', /* required */
	AttributeType: 'S' /* required */
    };
exports.security_roles_info_table_key_schema = 
    {
	AttributeName: 'securityRoleName', /* required */
	KeyType: 'HASH' /* required */
    };

exports.security_roles_info_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.security_roles_info_table_id_definition = 'securityRoleName';


// TABLE tbl_info_ffdls
exports.ffdls_info_table_attribute_definitions = 
    {
	AttributeName: 'name', /* required */
	AttributeType: 'S' /* required */
    };
exports.ffdls_info_table_key_schema = 
    {
	AttributeName: 'name', /* required */
	KeyType: 'HASH' /* required */
    }

exports.ffdls_info_table_provisioned_throughput = 
    {
	ReadCapacityUnits: 1, /* required */
	WriteCapacityUnits: 1 /* required */
    };

exports.ffdls_info_table_id_definition = 'name';



exports.ffdl_inbound_comm_channel_prefix = 'ficcp_';
exports.ffdl_inbound_comm_channel_function_prefix = 'trigger_on_ibdl_comm_from_';
exports.ffdl_inbound_comm_channel_function_template_prefix = './trigger_on_ibdl_comm_from_template.js';



exports.fdl_security_policies = ['icc_policy'];
exports.fdl_security_policy_prefix = "fdl_security_";

exports.fdl_security_icc_policy = 'icc_policy';
exports.fdl_security_icc_policy_params = {
    PolicyName: 'icc_policy',
    PolicyDocument: {
	"Version": "2012-10-17",
	"Statement": [
	    {
		"Effect": "Allow",
		"Action": [
		    "logs:*"
		],
		"Resource": "arn:aws:logs:*:*:*"
	    },
	    {
		"Effect": "Allow",
		"Action": [
		    "s3:GetObject",
		    "s3:PutObject"
		],
		"Resource": "arn:aws:s3:::*"
	    }
	]
    },
    
    Description: 'Policy for controlling the security envelope of lambda function executing on an fdl wide inbound channel ',
    Path: '/fdl/'
};

exports.fdl_security_roles = ['iccrole'];
exports.fdl_security_role_prefix = "fdl_security_";
exports.fdl_security_icc_role = 'iccrole';

exports.fdl_security_iccrole_params = {
    PolicyArn: {processingDirective: true,
		pFunc: 'getPolicyArnFromPolicyName',
		pFuncEvaluateParams: true,
		pFuncParams: ['aws_fdl_config.fdl_security_icc_policy']
	       },
    RoleName: 'iccrole',
    AssumeRolePolicyDocument:   {
	"Version": "2012-10-17",
	"Statement": [
	    {
		"Sid": "",
		"Effect": "Allow",
		"Principal": {
		    "Service": "lambda.amazonaws.com"
		},
		"Action": "sts:AssumeRole"
	    }
	]
    }
};

