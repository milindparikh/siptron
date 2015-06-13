var fdl = require("./aws_fdl.js");
var ffdl = require("./aws_ffdl.js");

var pfunc = function(err, data) { 
    if (err) {
        console.log(err, err.stack);
    } else {
        console.log(data);
    }
}


module.exports = 
    {


	//   FDL Functions
	create_fdl: function() {
	    fdl.create();
	},
	
	// version 06052015 expects 
	//   { name=<name>, canonical_user_id = <cui>, account_id=<acct_id> }

	define_fdl: function(value) {
	    fdl.define(value);
	},
	describe_fdl: function() {
	    fdl.describe();
	},
	delete_fdl: function() {
	},


	// Foreign FDL Functions
	// "{\"name\":\"main2\", \"canonical_user_id\": \"973a015fb3ed6481a683a21ce9dee208cbf3729a2169e0a4fe172691a47d07db\"}"
	add_ffdl: function(value) {
	    ffdl.add(JSON.parse(value));
	},	
	list_ffdls: function() {
	    ffdl.list();
	},
	remove_ffdl: function(value) {
	    ffdl.remove(JSON.parse(value));
	},
	register_ffdl: function(value) {
	    ffdl.register(JSON.parse(value));
	},
	deregister_ffdl: function() {
	    ffdl.deregister(JSON.parse(value));
	},
	add_comm_topic_ffdl: function (value) {
	    ffdl.add_comm_topic(JSON.parse(value));
	},
	activate_ffdl: function(value) {
	    ffdl.activate(JSON.parse(value));
	},
	approve_ffdl: function() {
	},
	disapprove_ffdl: function() {
	},
	subscribe_to_ffdl: function() {
	},
	unsubscribe_from_ffdl: function() {
	},	



	// Source Functions 
	register_source: function() {
	},
	deregister_source: function() {
	},
	list_registered_sources: function() {
	},
	
	subscribe_to_source: function() {
	},
	unsubscribe_to_source: function() {
	},
	
	approve_subscription_to_source: function() {
	},
	disapprove_subscription_to_source: function() {
	},
	renege_subscription_to_source: function() {
	},

}
