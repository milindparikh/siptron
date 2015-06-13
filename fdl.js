var fdl = require('./fdlsDriver.js');

if (process.argv[4]) {
        fdl[process.argv[2]](process.argv[3], process.argv[4] );
}
else if (process.argv[3]) {
    var parg3 = process.argv[3];
    fdl[process.argv[2]](parg3);
}
else {
    fdl[process.argv[2]]();
}

