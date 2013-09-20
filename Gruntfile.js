module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		clean: {
			build: ['amd']
		},
		transpile: {
			main: {
				type: 'amd',
				anonymous: true,
				indent: 'tab',
				eol: '\r\n',
				strict: false,
				squotes: true,
				dontIndentDefine: true,
				dontIndentDefineFn: true,
				files: [{
					expand: true,
					cwd: 'es6/',
					src: ['**/*.js'],
					dest: 'amd/'
				}]
			}
		}
    //uglify: {
    //  options: {
    //    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    //  },
    //  build: {
    //    src: 'src/<%= pkg.name %>.js',
    //    dest: 'build/<%= pkg.name %>.min.js'
    //  }
    //}
  });

  // Load the plugin that provides the "uglify" task.
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-es6-module-transpiler');

  // Default task(s).
  //grunt.registerTask('default', ['uglify']);
	grunt.registerTask('build', ['clean', 'transpile']);

};