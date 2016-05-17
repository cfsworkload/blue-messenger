$(document).ready(function(){
    if(!i18n_bundle || !i18n_bundle.data) return;
    
    for(var k in i18n_bundle.data) {
        if(k.indexOf('_') === 0) {
            continue; // skip _*
        }
        
        var v = i18n_bundle.data[k];
        
        if(k.indexOf('title::') === 0) {
            var o = $(k.substr(7));
            if(!o) {
                console.log('Nothing: '+k);
            } else if(o.length === 0) {
                console.log('0 length: '+k);
            } else if(o.length !== 1) {
                console.log((o.length) + ' length: '+k);
            } else {
                console.log('OK, was: ' + o.attr('title'));
                o.attr('title', i18n_bundle.data[k]);
            }
        } else if(k.indexOf('placeholder::') === 0) {
            var o = $(k.substr(13));
            if(!o) {
                console.log('Nothing: '+k);
            } else if(o.length === 0) {
                console.log('0 length: '+k);
            } else if(o.length !== 1) {
                console.log((o.length) + ' length: '+k);
            } else {
                console.log('OK, was: ' + o.attr('placeholder'));
                o.attr('placeholder', i18n_bundle.data[k]);
            }
        } else {
            var o = $(k);
            // console.log(k);
            if(!o) {
                console.log('Nothing: '+k);
            } else if(o.length === 0) {
                console.log('0 length: '+k);
            } else if(o.length !== 1) {
                console.log((o.length) + ' length: '+k);
            } else {
                console.log('OK, was: ' + o.text());
                o.html(i18n_bundle.data[k]
                        .replace(/{/g,'<')
                        .replace(/}/g,'>'));
            }
        }
    }

    // update counts
    $('.t-num').each(function() {
        $(this).text(Number($(this).val()).toLocaleString());
    });

    
    // add language
    $('title').text($('title').text() + ' ' + i18n_bundle.lang);
});