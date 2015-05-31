module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dust: {
            compile: {
                options: {
                    useBaseName: true,
                    wrapper: "amd",
                    wrapperOptions: {
                        packageName: null,
                        templatesNamesGenerator: function (_info, _path) {
                            var name  = '';
                            _path = _path.replace('.dust', '');
                            _path = _path.split('/');
                            _path = _path.slice(4, _path.length);
                            for (var i = 0; i < _path.length; i++) {
                                if (i > 0) {
                                    name += "_";
                                }
                                name += _path[i];
                            };
                            return name;
                        },
                        deps: {
                            dust: "dust",
                            "dust-helpers": "dust-helpers"
                        }
                    }
                },
                files: {
                    "modules/web/public/javascripts/web/tpl.js": "modules/web/views/web/**/*.dust",
                    // "modules/web/public/javascripts/web/tpl.js": "modules/web/views/web/{,*/}*.dust",
                    "modules/web/public/javascripts/admin/tpl.js": "modules/web/views/admin/**.dust"
                }
            }
        },
        watch: {
            files: ['**/*.dust'],
            options: {
                livereload: true,
            },
            tasks: ['dust'],
        },
    });




    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-dust');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Default task(s).
    grunt.registerTask('default', ['dust', 'watch']);
};
