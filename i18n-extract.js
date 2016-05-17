// Copyright (c) 2016 IBM Corp. All rights reserved.
// Use of this source code is governed by the Apache License,
// Version 2.0, a copy of which can be found in the LICENSE file.

// this file extracts source-language (English) content out of the HTML doc
// in order to produce public/scripts/en.json

const jsdom = require('jsdom');
const jquery = require('jquery');
const fs = require('fs');

var virtualConsole = jsdom.createVirtualConsole();
virtualConsole.on("jsdomError", function (error) {
  console.error(error.stack, error.detail);
});

const htmlFile = './public/index.html';

jsdom.env({ 
        // url: 'file://' + process.cwd() + '/public/index.html',
        html: fs.readFileSync(htmlFile),
        scripts: [/*fs.readFileSync(*/'node_modules/jquery/dist/jquery.min.js'/*)*/,
                  /*fs.readFileSync(*/'./node_modules/jquery-selectorator/dist/selectorator.min.js'/*)*/],
    virtualConsole: virtualConsole,
    done: function(err, window) {
    if(err) {
        console.error(err);
        return;
    }

    console.log('read:', htmlFile);
    // var $ = jquery(window);
    var $ = window.$;
    
    // Now, determine which objects should be extracted
    var m = require('./public/scripts/en-extra.json'); // output map. Start with extra list.
    
    function extract(stuff) {
        $(stuff).each(function() {
            const t = $(this);
            if(t.hasClass('no-t')) return; // skip
            
            if (t.text() && t.text() !== '') {
                m[t.getSelector()] = t.html()
                                        .replace(/</g,'{')
                                        .replace(/>/g,'}');
            }
            if (t.attr('title') && t.attr('title') !== '') {
                m[ 'title::' + t.getSelector()] = t.attr('title');
            }
            if (t.attr('placeholder') && t.attr('placeholder') !== '') {
                m[ 'placeholder::' + t.getSelector()] = t.attr('placeholder');
            }
        });
    }
    
    // the options
    extract($('option'));
    // the window title
    // extract($('title'));
    // buttons
    extract($('.t'));
    
    // log it to screen
    //console.dir(m);
    console.log('Extracted', Object.keys(m).length, 'items');
    
    const jsonFile = 'public/scripts/en.json';
    // write the .json version
    fs.writeFileSync(jsonFile,
        JSON.stringify(m));
    console.log('wrote: ', [jsonFile] );
  }
});