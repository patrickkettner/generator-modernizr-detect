'use strict';
var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var findModernizr = function(_path) {
  var exists = false;

  if (fs.existsSync(_path)) {
    console.log(_path);
    try {
      exists = JSON.parse(fs.readFileSync(_path + '/package.json')).name === 'modernizr';
    } catch (e) {}
    if (!exists) {
      _path = path.resolve(_path + '/..');
      if (fs.existsSync(_path) && _path !== path.sep) {
        return findModernizr(_path);
      }
      return false;
    }
    else {
      return _path;
    }
  }
};

var ModernizrDetectGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();
    var modernizrPath = findModernizr(process.cwd())

    if (!modernizrPath) {
      this.log(yosay(
        'Oh bother! This must be run from within a modernizr repo. Clone github.com/Modernizr/Modernizr, and then run this from within it.', {
        maxLength: 35
      }
      ));
      process.exit(1);
    }


    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the Modernizr Detect generator!'
    ));

    var detectPath = modernizrPath + '/feature-detects/';
    var prompts = [{
      type: 'list',
      name: 'detectType',
      message: 'What type of detect is it',
      choices: (function () {
        var choices = fs.readdirSync(detectPath).filter(function(file) {
          return fs.statSync(detectPath + file).isDirectory();
        });

        choices.unshift('Other (doesn\'t fit into other detects)');

        return choices;

      })(),
      default: true
    }, {
      type: 'input',
      name: 'detectName',
      message: 'What is the detect\'s full name (e.g. W3C Touch Events)',
      validate: function(input) {
        return input.length > 0;
      }
    }, {
      type: 'input',
      name: 'detectProperty',
      message: 'What is the detect\'s property name (e.g. touchevents)',
      validate: function(input) {
        return input.length > 0 && !input.match(/\s/);
      }
    }, {
      type: 'input',
      name: 'detectDoc',
      message: 'What is a brief description of the detect, for documentation',
      validate: function(input) {
        return input.length > 0;
      }
    }, {
      type: 'checkbox',
      name: 'detectReqs',
      message: 'Which bits of the api will you be requiring? (Don\'t worry - you can add more later)',
      choices: [{
        'value': 'addTest',
        'name': 'addTest',
        'checked': false
      },{
        'value': 'attrs',
        'name': 'attrs',
        'checked': false
      },{
        'value': 'contains',
        'name': 'contains',
        'checked': false
      },{
        'value': 'createElement',
        'name': 'createElement',
        'checked': false
      },{
        'value': 'docElement',
        'name': 'docElement',
        'checked': false
      },{
        'value': 'domPrefixes',
        'name': 'domPrefixes',
        'checked': false
      },{
        'value': 'getBody',
        'name': 'getBody',
        'checked': false
      },{
        'value': 'hasEvent',
        'name': 'hasEvent',
        'checked': false
      },{
        'value': 'inputElem',
        'name': 'inputElem',
        'checked': false
      },{
        'value': 'inputattrs',
        'name': 'inputattrs',
        'checked': false
      },{
        'value': 'inputs',
        'name': 'inputs',
        'checked': false
      },{
        'value': 'inputtypes',
        'name': 'inputtypes',
        'checked': false
      },{
        'value': 'is',
        'name': 'is',
        'checked': false
      },{
        'value': 'modElem',
        'name': 'modElem',
        'checked': false
      },{
        'value': 'mq',
        'name': 'mq',
        'checked': false
      },{
        'value': 'prefixed',
        'name': 'prefixed',
        'checked': false
      },{
        'value': 'prefixes',
        'name': 'prefixes',
        'checked': false
      },{
        'value': 'smile',
        'name': 'smile',
        'checked': false
      },{
        'value': 'testAllProps',
        'name': 'testAllProps',
        'checked': false
      },{
        'value': 'testProp',
        'name': 'testProp',
        'checked': false
      },{
        'value': 'testStyles',
        'name': 'testStyles',
        'checked': false
      },{
        'value': 'testXhrType',
        'name': 'testXhrType',
        'checked': false
      },{
        'value': 'toStringFn',
        'name': 'toStringFn',
        'checked': false
      }]

    }];

    this.prompt(prompts, function (props) {
      this.modernizrPath = modernizrPath;
      this.detectType = props.detectType;
      this.detectName = props.detectName;
      this.detectProperty = props.detectProperty;
      this.detectDoc = props.detectDoc;
      this.detectReqs = props.detectReqs;
      this.detectPathPrefix =
        (this.detectType.indexOf('Other') === 0 ) ? '' : this.detectType + '/';
      this.detectPath = 'feature-detects/' +
        this.detectPathPrefix + this.detectProperty + '.js';

      this.detectReqs.unshift('Modernizr');


      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      var configPath = this.modernizrPath + '/lib/config-all.json';
      var config = require(configPath);
      config['feature-detects'].push('test/' + this.detectPathPrefix + this.detectProperty);
      config['feature-detects'] = config['feature-detects']
        .sort(function(c,d){var a=(""+c).toLowerCase(),b=(""+d).toLowerCase();return a==b?0:a>b?1:-1});

      this.template('_detect.js', 'feature-detects/' + this.detectProperty + '.js');
      fs.writeFileSync(configPath, JSON.stringify(config, 0, 2));
    },

  }

});

module.exports = ModernizrDetectGenerator;
