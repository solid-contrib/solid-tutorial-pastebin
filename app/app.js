'use strict';
var solid = require('solid');
var vocab = solid.vocab;

var Pastebin = Pastebin || {};
Pastebin = (function () {
    // Default publish location
    // ATTENTION: this variable must be set for the app to create new bins
    var defaultContainer = '';

    // Bin structure
    var bin = {
        url: '',
        title: '',
        body: ''
    }

    function init() {
        document.getElementById('edit').classList.add('hidden');
        document.getElementById('view').classList.add('hidden');

        if (defaultContainer.lastIndexOf('/') != defaultContainer.length - 1) {
            defaultContainer += '/';
        }
        console.log(defaultContainer)

        if (queryVals['view'] && queryVals['view'].length > 0) {
            load(queryVals['view']);
        } else if (queryVals['edit'] && queryVals['edit'].length > 0) {
            load(queryVals['edit'], true);
        } else {
            console.log('new pastebin form');
            document.getElementById('submit')
                .setAttribute('onclick', 'Pastebin.publish()');
            document.getElementById('edit').classList.remove('hidden');
        }
    }

    function load (url, showEditor) {
        solid.web.get(url).then(function(response) {
            var graph = response.parsedGraph();
            // set url
            bin.url = response.url;
            var subject = $rdf.sym(response.url);
            // add title
            var title = graph.any(subject, vocab.dct('title'));
            if (title) {
                bin.title = title.value;
            }
            // add body
            var body = graph.any(subject, vocab.sioc('content'));
            if (body) {
                bin.body = body.value;
            }

            if (showEditor) {
                document.getElementById('edit-title').value = bin.title;
                document.getElementById('edit-body').innerHTML = bin.body;
                document.getElementById('submit').setAttribute('onclick',
                    'Pastebin.update()');
                document.getElementById('edit').classList.remove('hidden');
            } else {
                document.getElementById('view-title').innerHTML = bin.title;
                document.getElementById('view-body').innerHTML = bin.body;
                document.getElementById('view').classList.remove('hidden');
            }
        }).catch(function(err) {
            // do something with the error
            console.log(err);
        });
    }

    function publish () {
        bin.title = document.getElementById('edit-title').value;
        bin.body = document.getElementById('edit-body').value;

        var graph = $rdf.graph();
        var thisResource = $rdf.sym('');
        graph.add(thisResource, vocab.dct('title'), $rdf.lit(bin.title));
        graph.add(thisResource, vocab.sioc('content'), $rdf.lit(bin.body));
        var data = new $rdf.Serializer(graph).toN3(graph);

        solid.web.post(defaultContainer, data).then(function(meta) {
            // view
            var url = meta.url;
            if (url && url.slice(0,4) != 'http') {
                if (url.indexOf('/') === 0) {
                    url = url.slice(1, url.length);
                }
                url = defaultContainer + url.slice(url.lastIndexOf('/') + 1, url.length);
            }
            window.location.search = "?view="+encodeURIComponent(url);
        }).catch(function(err) {
            // do something with the error
            console.log(err);
        });
    }

    function update () {
        bin.title = document.getElementById('edit-title').value;
        bin.body = document.getElementById('edit-body').value;

        var graph = $rdf.graph();
        var thisResource = $rdf.sym('');
        graph.add(thisResource, vocab.dct('title'), bin.title);
        graph.add(thisResource, vocab.sioc('content'), bin.body);
        var data = new $rdf.Serializer(graph).toN3(graph);

        solid.web.put(bin.url, data).then(function(meta) {
            // view
            window.location.search = "?view="+encodeURIComponent(meta.url);
        }).catch(function(err) {
            // do something with the error
            console.log(err);
        });
    }

    // Utility function to parse URL query string values
    var queryVals = (function(a) {
        if (a === "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=', 2);
            if (p.length === 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    init();

    // return public functions
    return {
        publish: publish,
        update: update
    };
}(this));
