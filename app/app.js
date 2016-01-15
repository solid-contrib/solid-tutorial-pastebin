var Pastebin = Pastebin || {};

Pastebin = (function () {
    'use strict';

    // common RDF vocabs
    var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
    var SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#");
    var SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/terms#");

    // Bin structure
    var bin = {
        url: '',
        title: '',
        body: ''
    };

    // Default publish location
    // ATTENTION: this variable must be set for the app to create new bins
    var defaultContainer = '';

    function init() {
        document.getElementById('edit').classList.add('hidden');
        document.getElementById('view').classList.add('hidden');

        if (queryVals['view'] && queryVals['view'].length > 0) {
            load(queryVals['view']);
        } else if (queryVals['edit'] && queryVals['edit'].length > 0) {
            load(queryVals['edit'], true);
        } else {
            console.log('showing');
            document.getElementById('submit').setAttribute('onclick', 'Pastebin.publish()');
            document.getElementById('edit').classList.remove('hidden');
        }
    }

    function load (url, showEditor) {
        Solid.web.get(url).then(function(g) {
            // set url
            bin.url = url;
            // add title
            var title = g.any($rdf.sym(url), DCT('title'));
            if (title) {
                bin.title = title.value;
            }
            // add body
            var body = g.any($rdf.sym(url), SIOC('content'));
            if (body) {
                bin.body = body.value;
            }

            if (showEditor) {
                document.getElementById('edit-title').value = bin.title;
                document.getElementById('edit-body').innerHTML = bin.body;
                document.getElementById('submit').setAttribute('onclick', 'Pastebin.update()');
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

        var g = new $rdf.graph();
        g.add($rdf.sym(''), DCT('title'), bin.title);
        g.add($rdf.sym(''), SIOC('content'), bin.body);
        var data = new $rdf.Serializer(g).toN3(g);

        Solid.web.post(defaultContainer, undefined, data).then(function(meta) {
            // view
            window.location.search = "?view="+encodeURIComponent(meta.url);
        }).catch(function(err) {
            // do something with the error
            console.log(err);
        });
    }

    function update () {
        bin.title = document.getElementById('edit-title').value;
        bin.body = document.getElementById('edit-body').value;

        var g = new $rdf.graph();
        g.add($rdf.sym(''), DCT('title'), bin.title);
        g.add($rdf.sym(''), SIOC('content'), bin.body);
        var data = new $rdf.Serializer(g).toN3(g);

        Solid.web.put(bin.url, data).then(function(meta) {
            // view
            window.location.search = "?view="+encodeURIComponent(meta.url);
        }).catch(function(err) {
            // do something with the error
            console.log(err);
        });
    }

    // Utility function to parse URL query string values
    var queryVals = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=', 2);
            if (p.length == 1)
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
