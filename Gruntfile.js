/**
 * Created by wwymak on 05/12/2015.
 */

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: 'es6_js/',      // Src matches are relative to this path.
                        src: ['**/*.js'], // Actual pattern(s) to match.
                        dest: 'js/',   // Destination path prefix.
                        ext: '.js',   // Dest filepaths will have this extension.
                    },
                ]
            }
        },
        watch: {
            scripts: {
                files: 'es6_js/**/*.js',
                tasks: ["babel"]
            },
        }
    });

    grunt.registerTask('default', ['babel', 'watch']);
}

