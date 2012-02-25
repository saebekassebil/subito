var path    = require('path'),
    fs      = require('fs'),
    mingler = require('mingler'),
    colors  = null;

try {
  colors = require('colors');
} catch(e) {
  colors = null;
}

// Default Settings
var settings = {
  minify: false,
  silent: false,
  colors: true,
  nofont: false
};

// Log colors if the npm module colors is available
var logcolors = {
  info: 'cyan',
  warn: 'yellow',
  error: 'red'
};

// Constants
var kBuildDir = 'build/';
var kSourceDir = 'src/';
var kMainFile = 'subito.js';
var kBuildFilename = 'subito.js';
var kBuildMinFilename = 'subito.min.js';

// Utility function which respects the 'silent' setting
function log(text, type, acolor) {
  type = (type in console && typeof console[type] == 'function') ? type : 'info';

  if(!settings.silent) {
    text = ' ['+type.toUpperCase()+'] ' + text;
    if(settings.colors && colors) {
      color = logcolors[acolor || type] || 'grey';
      console[type](text[color]);
    } else {
      console[type](text);
    }
  }
}

// Default task - build
desc('Default task is an alias for \'build\'');
task({'default': ['build']}, function(parameters) {
  // Nothing to do here...
});

// Building, which means concatenating and 
// optionally minifying all source files.
desc('Concatenates all files into build/subito.js');
task('build', function() {
  var params, exists, concatenation, filename;
  log('Building Subito');

  filename = kBuildDir + kBuildFilename;

  // List settings
  params = Array.prototype.slice.call(arguments);
  params.forEach(function(el) {
    if(el in settings) {
      settings[el] = !settings[el];
    } else {
      log('Ignoring invalid settings: ' + el, 'warn');
    }
  });

  // Ensure build directory exists
  exists = path.existsSync(kBuildDir);
  if(!exists) {
    log('Creating build directory');
    fs.mkdirSync(kBuildDir, 0777);
  }

  // Concatenate files
  process.chdir(kSourceDir);

  // When concatenation is completed
  mingler.on('complete', function(concatenation) {
    // Should the source be minified?
    if(settings.minify) {
      var ugly, jsp, pro, ast, ratio, compressed;
      try {
        ugly = require('uglify-js');
      } catch(e) {
        return log('uglify-js module doesn\'t appear to be installed. Use:'
                  + '`npm install uglify-js`', 'error');
      }

      log('Minifying');
      jsp = ugly.parser;
      pro = ugly.uglify;

      ast = jsp.parse(concatenation);
      ast = pro.ast_mangle(ast);
      ast = pro.ast_squeeze(ast);

      compressed = pro.gen_code(ast);
      ratio = 100 - (compressed.length/concatenation.length) * 100;
      ratio = ratio.toString().substr(0, 4);

      log('Saved ' + ratio + '% of the original size');
      concatenation = compressed;
      filename = kBuildDir + kBuildMinFilename;
    }

    // Write to file and close!
    log('Writing to output file \'' + filename + '\'');
    fs.writeFileSync(filename, concatenation, 'utf8');
    log('Concatenation completed - Goodbye!');
  });

  mingler.on('error', function(error) {
    log(error, 'error');
    process.exit(1);
  });

  mingler.on('warning', function(warning) {
    log(warning, 'warn');
  });

  mingler.on('concatenate', function(feedback) {
    if(settings.nofont && feedback.filename.indexOf('fonts/') == 0) {
      feedback.discard();
      log('Ignoring font file ' + feedback.filename, 'info', 'grey');
    } else {
      log("Concatenating: " + feedback.filename, 'info', 'grey');
    }
  });
  
  mingler.mingle(kMainFile, function(concatenation) {
    process.chdir('../');
  });
});

