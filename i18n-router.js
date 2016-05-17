// Copyright (c) 2016 IBM Corp. All rights reserved.
// Use of this source code is governed by the Apache License,
// Version 2.0, a copy of which can be found in the LICENSE file.

const gp = require('g11n-pipeline');
const express = require('express');
const router  = express.Router();
const Q = require('q');
const sourceLanguage = 'en';

const VERBOSE = false;

function getBundleInfoOrCreate(bundle) {
    var deferred = Q.defer();
    bundle.getInfo({}, function(err, data) {
        if(err && (err.toString().indexOf('ResourceNotFoundException') !== -1)) {
            // does not exist, create
            console.log('g11n-pipeline creating bundle',bundle.id );
            return deferred.resolve(Q.ninvoke(bundle, 'create', {
                sourceLanguage: sourceLanguage,
                targetLanguages: [] // start empty                
            })
            // .then(Q.fcall(function(){
            //     return bundle;
            // })
            .then(function() {
                var deferred2 = Q.defer();
                // console.log('..getting info');
                // return Q.ninvoke(bundle, 'getInfo', {}); < did not work?!
                // get info again on our newly created bundle
                bundle.getInfo({}, function(err2, data2) {
                    if(err2) return deferred2.reject(err2);
                    return deferred2.resolve(data2);
                });
                return deferred2.promise;
            }));
        }
        if(err) return deferred.reject(err);
        console.log('g11n-pipeline using existing bundle',bundle.id );
        return deferred.resolve(data);
    });
    return deferred.promise;
}

// need appEnv to get the client.
module.exports = function(appEnv) {
    const gpClient = gp.getClient({appEnv: appEnv});
    const bundleName = appEnv.name + (appEnv.isLocal?'-local':'');
    const bundle = gpClient.bundle(bundleName);
    console.log('g11n-pipeline bundle name',bundleName);
    
    // Promise with full bundle info
    var bundleInfoPromise = 
        getBundleInfoOrCreate(gpClient.bundle(bundleName));
    
    if(VERBOSE) console.dir(require('./public/scripts/en.json'));
    
    // Promise for the bundle: for reading, only after bundle is created and populated.
    var bundlePromise = 
        bundleInfoPromise
        // upload our strings
        .then(function() {
            return Q.ninvoke(gpClient.bundle(bundleName),
            'uploadStrings',
            {languageId: sourceLanguage, strings: require('./public/scripts/en.json')});
        })
        .then(function() {
            return bundle;
        }); 
        
    // A promise for the array of all languages:  [ 'en', 'de', … ]
    var targetLanguagesPromise = 
        bundleInfoPromise
        .then(function(bundleInfo) {
            // extract just the list of languages
            var langs = [bundleInfo.sourceLanguage]
                    .concat(bundleInfo.targetLanguages||[]);
            return langs;
        })
        // Convert to map:  { en: 'en' }
        .then(function(langs) {
            return langs.reduce(function(p, v) {
                p[v] = v;
                return p;
            }, {});
        })
        // add exceptions
        .then(function(langs) {
            if(langs['zh-Hans']) langs.zh = langs['zh-Hans'];
            if(langs['zh-Hans']) langs['zh-cn'] = langs['zh-Hans'];
            if(langs['zh-Hant']) langs['zh-tw'] = langs['zh-Hant'];
            if(langs['pt-BR'] && !langs.pt) langs.pt = langs['pt-BR'];
            if(langs.pt && !langs['pt-PT']) langs['pt-PT'] = langs.pt;
            return langs;
        });
        
    // Make sure the target langs are ready.
    bundleInfoPromise.then(function(b) {
       console.log('Bundle ready!', bundleName,
             'Source language:', b.sourceLanguage, 
             'Target languages:', b.targetLanguages,
             'Updated:', b.updatedAt.toLocaleString());
    }).done();

    // Make sure we can fetch English
    bundlePromise
        .then(function() {return 'en'; })
        .then(fetchBundle)
        .done();
    
    /**
     * Returns a promise to fetch the specified language bundle.
     */
    function fetchBundle(lang) {
            return bundlePromise.then(function(bundle){
                bundle = gpClient.bundle(bundleName);
                // need to unpack bundle into a 'get' call
                // return Q.ninvoke(bundle, 'getStrings', {languageId: lang});
                var deferred = Q.defer();
                bundle.getStrings({languageId: lang}, function(err, data) {
                    if(err) return deferred.reject(err);
                    return deferred.resolve(data);
                });
                return deferred.promise;
            })
            .then(function(result) {
                // Restructure data
                return {
                    lang: lang,
                    data: result.resourceStrings
                };
            });
        };

    // Return the bundle as javascript
    router.get('/auto.js', function(req, res) {
        targetLanguagesPromise
        .then(function(langs) {
            const acceptLanguage = require('accept-language');
            acceptLanguage.languages(Object.keys(langs));
            var lang = acceptLanguage.get(req.headers['accept-language']) 
                || sourceLanguage;
            if(VERBOSE) console.log(req.headers['accept-language'], lang);
            return langs[lang] || sourceLanguage; // follow map
        })
        .then(fetchBundle)
        .then(function(json) {
            res.end('i18n_bundle=' + JSON.stringify(json)+';\n'); // fallback.
        }, function(e) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Error');
            console.error(e);
        })
        .done();
    });
    
    return { 
        router: router
    };
}