module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        handlebars: {
          compile: {
            options: {
                amd: true,
                processName: function(filename) {
                    return filename.replace(/.*\/(\w+)\.hbs/, "$1");
                },
                namespace: function(filename) {
                    var name = filename.split("/");
                    name = name[1];
                    return name;
                },
                /*processContent: function(content, filepath) {
                    content = "define(function () {" + content + "});";
                    return content;
                }*/
            },
            files: {
              "modules/chat/public/javascripts/tpl.js": "modules/chat/views/shared/**.hbs"
            }
          }
        },
        watch: {
            options: {
                livereload: true,
            },
            files: ['modules/chat/views/shared/**.hbs'],
            tasks: ['handlebars'],
        },
    });
    
    

    
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Default task(s).
    grunt.registerTask('default', ['handlebars', 'watch']);
};