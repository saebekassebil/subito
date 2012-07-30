var path    = require('path'),
    fs      = require('fs'),
    mingler = require('mingler'),
    colors;

try {
  colors = require('colors');
} catch(e) {
  // Nothing to do...
}

// Default Settings
var settings = {
  minify: false,
  silent: false,
  colors: true,
  font: false,
  standalone: false,
  noparsers: false
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
var kBuildFontFilename = 'subito.font.js';
var kBuildMinFilename = 'subito.min.js';
var kBuildMinFontFilename = 'subito.font.min.js';

// Utility function which respects the 'silent' setting
function log(text, type, acolor, nolabel) {
  type = (type in console && typeof console[type] == 'function') ? type : 'info';

  if(!settings.silent) {
    if(!nolabel) {
      text = ' ['+type.toUpperCase()+'] ' + text;
    } else {
      text = ' ' + text;
    }

    if(settings.colors && colors) {
      color = logcolors[acolor || type] || 'grey';
      console[type](text[color]);
    } else {
      console[type](text);
    }
  }
}

// Utility function which collects files in  directory recursively
// Inspired by jshint's source
function collect(filepath, files, ignore) {
  if(ignore && filepath.search(ignore) != -1) {
    return false;
  }

  if(fs.statSync(filepath).isDirectory()) {
    fs.readdirSync(filepath).forEach(function(f) {
      collect(path.join(filepath, f), files, ignore);
    });
  } else if(filepath.match(/\.js$/)) {
    files.push(filepath)
  }
}

// Default task - build
desc('Default both lints and builds the project');
task({'default': ['lint', 'build']}, function(parameters) {
  // Nothing to do here...
});

// Builds the files required for running the examples
desc('Builds the files required by the examples');
task('examples', function() {
  // Build the subito.font.min.js
  var buildTask = jake.Task['build'], active, i, tasks;
  tasks = {
    'minified font file': {
      args: ['font', 'minify'],
      run: false
    },

    'minified file': {
      args: ['minify'],
      run: false
    }
  };

  function taskCallback() {
    console.log('');

    // Reset settings
    if(active) {
      tasks[active].args.forEach(function(arg) {
        settings[arg] = !settings[arg];
      });
    }

    for(i in tasks) {
      if(!tasks[i].run) {
        active = i;
        log('Building ' + i);
        tasks[i].run = true;
        buildTask.reenable();
        buildTask.invoke.apply(buildTask, tasks[i].args);

        return;
      }
    }

    complete();
  }

  buildTask.addListener('complete', taskCallback);
  taskCallback();
}, {async: true});

// Building, which means concatenating and 
// optionally minifying all source files.
desc('Concatenates all files into build/subito.js');
task('build', function() {
  var params, exists, concatenation, filename;
  filename = kBuildFilename;

  // List settings
  params = Array.prototype.slice.call(arguments);
  params.forEach(function(el) {
    if(el in settings) {
      settings[el] = !settings[el];
    } else {
      log('Ignoring invalid settings: ' + el, 'warn');
    }
  });

  log('Building Subito');

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
      var ugly, ast, ratio, compressed;
      try {
        ugly = require('uglify-js');
      } catch(e) {
        return log('uglify-js module doesn\'t appear to be installed. Use:'
                  + '`npm install uglify-js`', 'error');
      }

      log('Minifying');

      ast = ugly.parser.parse(concatenation);
      ast = ugly.uglify.ast_mangle(ast);
      ast = ugly.uglify.ast_squeeze(ast);

      compressed = ugly.uglify.gen_code(ast);
      ratio = 100 - (compressed.length/concatenation.length) * 100;
      ratio = ratio.toString().substr(0, 4);

      log('Saved ' + ratio + '% of the original size');
      concatenation = compressed;
      filename = (settings.font) ? kBuildMinFontFilename : kBuildMinFilename;
    } else if(settings.font) {
      filename = kBuildFontFilename;
    }

    // Write to file and close!
    log('Writing to output file \'' + filename + '\'');
    fs.writeFileSync(kBuildDir + filename, concatenation, 'utf8');
    log('Concatenation completed - Goodbye!');

    // Clear listeners
    mingler.un('complete');
    mingler.un('error');
    mingler.un('warning');
    mingler.un('concatenate');
    complete();
  });

  mingler.on('error', function(error) {
    log(error, 'error');
    process.exit(1);
  });

  mingler.on('warning', function(warning) {
    log(warning, 'warn');
  });

  mingler.on('concatenate', function(feedback) {
    if(!settings.font && feedback.filename.indexOf('fonts/') == 0) {
      feedback.discard();
      log('Ignoring font file ' + feedback.filename, 'info', 'grey');
    } else if(!settings.standalone && feedback.filename == 'standalone.js') {
      feedback.discard();
      log('Ignoring standalone helper ' + feedback.filename, 'info', 'grey');
    } else if(settings.noparsers && feedback.filename.indexOf('parsers/') == 0) {
      feedback.discard();
      log('Ignoring parser file ' + feedback.filename, 'info', 'grey');
    } else {
      log("Concatenating: " + feedback.filename, 'info', 'grey');
    }
  });
  
  mingler.mingle(kMainFile, function(concatenation) {
    process.chdir('../');
  });
}, {async: true});

// Lints the files according to .jshintrc
desc('Lint all files according to coding standards');
task('lint', function() {
  var jshint;
  try {
    jshint = require('jshint');
  } catch(e) {
    log('jshint doesn\'t appear to be installed. Do a `npm install -g jshint`',
      'error');
    return false;
  }

  // Load configuration
  var config = fs.readFileSync('./.jshintrc', 'utf8');
  config = JSON.parse(config);

  // List all files in src/
  var files = [], errors = [], errorfilecount = 0;
  collect('src/', files, /fonts\/|fonts\\.*/); 
  files.forEach(function(file) {
    var content, results;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch(e) {
      log('Unable to open file ' + file, 'error');
    }

    content = content.replace(/^\uFEFF/, ''); // Remove Unicode BOM
    if(!jshint.JSHINT(content, config)) {
      errorfilecount++;
      jshint.JSHINT.errors.forEach(function(error) {
        if(error) {
          errors.push({file: file, error: error});
        }
      });
    }
  });

  log(files.length.toString() + ' files linted, ' + (files.length-errorfilecount)
    + ' successfully, ' + errorfilecount + ' with errors!', 'info');
  errors.forEach(function(error) {
    log(error.file + ': line ' + error.error.line 
        + ', col ' + error.error.character + ', ' + error.error.reason, 
        'error', 'grey', true);
  });

  if(errors.length == 0) {
    log('Lint passed', 'info');
  } else {
    log('Lint failed!', 'error');
  }
});
