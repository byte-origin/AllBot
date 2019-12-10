// @ts-nocheck
const https = require('https');
const http = require('http');
const dns = require('dns');


let icons = {};
let devtoolsView = document.getElementById('devtools')
let input = document.getElementById('lookup');
let webview = document.getElementById('results');
let currentURL = document.getElementById('currentURL');
icons.startPage = document.getElementById('startPage');
let searchbar = document.getElementById('searchBar');
icons.nextPage = document.getElementById('nextPage');
icons.lastPage = document.getElementById('lastPage');
icons.refresh = document.getElementById('refresh');
icons.home = document.getElementById('home');
icons.zoom = document.getElementById('zoom');
let zoomBox = document.getElementById('zoomBox')
let zoomInput = document.getElementById('zoomInput');
let zoomValue = document.getElementById('zoomValue');
webview.setAttribute("useragent", `AllBot/0.0.2 (${require("os").type()} ${require("os").arch()}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.113 Safari/537.36`);
function searchForPage(searchInput) {
    webview.addEventListener('dom-ready', function() {
        currentURL.value = "";
        currentURL.setAttribute('placeholder', webview.getURL());
    });
    webview.setAttribute('class', '');
    icons.startPage.setAttribute('class', 'w3-hide');
    searchbar.setAttribute('class', 'albi-sticky albi-small-height');
    if(searchInput.startsWith('https://')) {
        https.get(searchInput, function() {
            webview.setAttribute('src', searchInput);
        }).on('error', function(error) {
            if(error.errno == 'ECONNREFUSED') {
                webview.setAttribute('src', './errorResponses/connectionRefused.html');
            } else if(error.errno == 'ENOTFOUND') {
                dns.lookup("google.com", function(error) {
                    if(error != null) {
                        webview.setAttribute('src', './errorResponses/noInternet.html');
                    } else {
                        webview.setAttribute('src', './errorResponses/notFound.html');
                    }
                });
            } else if(error.errno == 'ECONNRESET') {
                webview.setAttribute('src', './errorResponses/connectionReset.html')
            }
            console.log(error.errno);
        });
    } else if(searchInput.startsWith('http://')) {
        http.get(searchInput, function() {
            webview.setAttribute('src', searchInput);
        }).on('error', function(error) {
            if(error.errno == 'ECONNREFUSED') {
                webview.setAttribute('src', './errorResponses/connectionRefused.html');
            } else if(error.errno == 'ENOTFOUND') {
                dns.lookup("google.com", function(error) {
                    if(error != null) {
                        webview.setAttribute('src', './errorResponses/noInternet.html');
                    } else {
                        webview.setAttribute('src', './errorResponses/notFound.html');
                    }
                });
            } else if(error.errno == 'ERR_INTERNET_DISCONNECTED') {
                webview.setAttribute('src', './errorResponses/noInternet.html');
            } else if(error.errno == 'ECONNRESET') {
                webview.setAttribute('src', './errorResponses/connectionReset.html')
            }
            console.log(error.errno);
        });
    } else if(searchInput.startsWith('file:')) {
        webview.setAttribute('src', searchInput);
    } else {
        webview.setAttribute('src', `https://www.google.com/search?q=${searchInput}`);
    }
    input.value = "";
}

input.addEventListener('keyup', function(event) {
    if(event.keyCode === 13) {
        event.preventDefault();
         searchForPage(input.value);
    }
});

currentURL.addEventListener('keyup', function(event) {
    if(event.keyCode === 13) {
        event.preventDefault();
        searchForPage(currentURL.value);
    }
});

icons.lastPage.addEventListener('click', function() {
    if(webview.canGoBack() == true) {
        webview.goBack();
    } else {
        alert('There is no page to go back too.');
    }
});

icons.nextPage.addEventListener('click', function() {
    if(webview.canGoForward() == true) {
        webview.goForward();
    } else {
        alert('There is no page to go forward too.')
    }
})

//TODO: Implement <webview>.goToIndex()

icons.zoom.addEventListener('click', function() {
    if(zoomBox.classList.contains('w3-hide')) {
        zoomBox.setAttribute('class', 'w3-right');
    } else if(zoomBox.classList.contains('w3-right')) {
        zoomBox.setAttribute('class', 'w3-hide');
    }
});

zoomInput.addEventListener('keyup', function(event) {
    if(event.keyCode === 13) {
        event.preventDefault();
        webview.setZoomFactor(zoomInput.value / 100);
        zoomValue.innerHTML = zoomInput.value + '%';
    }
});

icons.refresh.addEventListener('click', function() {
    webview.reload();
});

icons.home.addEventListener('click', function() {
    webview.setAttribute('src', '');
    webview.setAttribute('class', 'w3-hide')
    icons.startPage.setAttribute('class', '');
    searchbar.setAttribute('class', 'w3-hide');
});

webview.addEventListener("did-start-loading", function() {
    document.getElementById("loader").setAttribute("class", "");
});

webview.addEventListener("did-stop-loading", function() {
    document.getElementById("loader").setAttribute("class", "w3-hide");
});