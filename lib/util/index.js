// as test require all files in the folder
require('fs').readdirSync('./lib/util').forEach(function(file) {
    if(file.indexOf('.js') !== -1) {
        require('./' + file);
    }
});