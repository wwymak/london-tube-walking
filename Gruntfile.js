/**
 * Grunt file-- at the moment it only does the compiling from es6 to es5.
 */

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        paths : {
            scss: 'public/scss',
            css : 'public/css'
        },

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
                        dest: 'public/js/',   // Destination path prefix.
                        ext: '.js',   // Dest filepaths will have this extension.
                    },
                ]
            }
        },
        sass: {
            // Development target
            development : {
                // Any dev-specific options are declared here (e.g. sourceMaps)
                options: {
                    sourceMap       : true,                   // The default source map - generate with relative URIs
                    sourceComments  : false,
                    trace           : true,                   // Generate a full traceback on error
                    style           : 'expanded',             // Show compiled neatly and readable - best for debugging
                    compass         : false,                  // Current false, but may be used if we import the Platon core CSS
                    cacheLocation   : '/tmp/sasscache',  // Stores the SASS cache files in /tmp/, to keep the repo cle
                    lineNumbers     : true                    // Show source line numbers in compiled output
                },
                // The files to compile. This is in the format DESTINATION.CSS:SOURCE.SCSS
                files: {
                    //'<%= paths.css %>/bootstrap.css' : '<%= paths.scss %>/bootstrap_custom.scss',
                    '<%= paths.css %>/tube-walking.css' : '<%= paths.scss %>/tube-walking.scss'
                }
            },
            // Production target
            production : {
                // Any production-specific options are declared here
                options: {
                    sourcemaps   : 'none',         // The default source map - diasabled in production
                    style        : 'compressed',   // Minify and strip comments from compiled source
                    compass      : false           // Current false, but may be used if we import the Platon core CSS
                },
            }
        },
        //copy: {
        //    main: {
        //
        //    }
        //},
        watch: {
            scripts: {
                files: ['es6_js/**/*.js', 'public/scss/*.scss'],
                tasks: ["babel", 'sass:development']
            },
            //sass: {
            //    files : ['scss/*.scss'],
            //    tasks : ['sass:development']
            //}
        }
    });

    grunt.registerTask('default', ['sass:development', 'babel', 'watch']);
}

