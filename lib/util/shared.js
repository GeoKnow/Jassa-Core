var shared = {
    Promise: null,
    ajax: function() {
        throw new Error('not set!');
    },
};

module.exports = shared;
