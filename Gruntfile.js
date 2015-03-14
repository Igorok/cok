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
        dust: {
            compile: {
                options: {
                    useBaseName: true,
                    wrapper: "amd",
                    wrapperOptions: {
                        packageName: null,
                        deps: {
                            dust: "dust",
                            "dust-helpers": "dust-helpers"
                        }
                    }
                },
                files: {
                    "modules/chat/public/javascripts/admin/tpl.js": "modules/chat/views/admin/**.dust"
                }
            }
        },
        watch: {
            options: {
                livereload: true,
            },
            files: ['modules/chat/views/shared/**.hbs', 'modules/chat/views/admin/**.dust'],
            tasks: ['handlebars', 'dust'],
        },
    });
    
    

    
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-dust');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Default task(s).
    grunt.registerTask('default', ['handlebars', 'dust', 'watch']);
};