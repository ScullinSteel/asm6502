module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: [
                'Gruntfile.js',
                'js/*.js'
            ],
            options: {
                curly: true,
                forin: true,
                funcscope: true,
                newcap: true,
                node: true,
                quotmark: 'single',
                undef: true,
                unused: true
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', [
        'jshint'
    ]);  
};
