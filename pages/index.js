

var jsmediatags = window.jsmediatags;
let usersettings = localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')) : {
    "devmode": false,
    "experimental": {
        "localstorage-playlist": false,
        "custom-plugins": false,
        "offical-plugins": true,
        "url-upload": false
    },
    "version-made-with": "beta 26.1.0"
}; 
let tab = 'home';
let elements = {};
if (usersettings.experimental['localstorage-playlist']) {
    var playlist = localStorage.getItem('playlist') ? JSON.parse(localStorage.getItem('playlist')) : {};
} else {
    var playlist = {};
}

// PLUGIN VARS
let pluginvars = {
    "plugin":{
        "name":"Plugin name",
        "auth":"Author's name",
        "quick":"Quick description of the plugin",
        "longer":"A longer description of your plugin",
        "contents":{
            "javascript":"(URL to your raw js file)",
            "css":"(leave blank if no custom css)"
        } // }
    },
    "placeholder":true
    // CHANGE TO FALSE
}
// edit the pluginvars thru a bookmarklet for testing
// javascript:(()=>{pluginvars={"plugin":{"name":"Plugin name","auth":"Author's name","quick":"Quick description of the plugin","longer":"A longer description of your plugin","contents":{"javascript":"","css":""}},"placeholder":false};})()

let maintextcolor = '#000000';  // for text color, because it changes for dynamic content and the css will not override it

maintextcolor = document.body.style.color;


function getIDs() {
    fetch('/id.json')
        .then(response => response.json())
        .then(data => {
            
            data.forEach(element => {
                elements[element] = document.getElementById(element);
            });
        });
    for (let i = 0; i < 22; i++) {
        elements[`item-main-${i}`] = document.getElementById(`item-main-${i}`);
        console.log(`item-main-${i}`);
    }
}
getIDs();

function display([contentJSON, title]) {
    fetch(contentJSON)
    .then (response => response.json())
    .then (data => {
        Object.keys(data).forEach(key => {
            let value = data[key];
            console.debug(key, value);
            if (value.startsWith('!')) { // if the value in ur json starts with ! it will be treated as a 'click to upload file' button
                value = value.substring(1);
                elements[key].innerHTML = value;
                elements[key].onclick = uploadFile;
            } else {
                elements[key].innerHTML = value;
            }
            elements[key].innerHTML = value;
            if (data[key] === '[dynamic]') {
                elements[key].style.color = '#ffffff00'
            } else {
                elements[key].style.color = maintextcolor;
            }
            elements[key].onclick = '';
        });
});
}
function clear() {
    Object.keys(elements).forEach(key => {
        elements[key].innerHTML = '';
        elements[key].onclick = null;
    });
}


function tabby(tab) {
    if (tab == 'home') {
        tab = 'home';
        display(['/content/home.json', 'Home']);
    } else if (tab == 'plugins') { // PLEASE MAKE PLUGINS :PLEADING-FACE: I WANT TO SEE COMMUNITY PLUGINS AAAAAAAAAAAAAAAAAAAAAAAAA
        tab = 'plugins';
        display(['/content/plugins.json', 'Plugins']);
        setTimeout(() => {
            elements['item-main-3'].onclick = () => showplugininfo(elements['item-main-3']);
            elements['item-main-4'].onclick = () => showplugininfo(elements['item-main-4']);
        }, 500);
    } else if (tab == 'playlist') {
        tab = 'playlist';
        if (playlist == {}) {
        display(['/content/playlist.json', 'Playlist']);
        } else {
        displayPlaylist();
        }
    } else if (tab == 'settings') {
        tab = 'settings';
        display(['/content/settings.json', 'Settings']);
        setTimeout(settings, 500);
    } else if (tab == 'online') {
        tab = 'online';
        display(['/content/online.json', 'Online']);
    }
}

function sound(file, filetype, action, type) {
    const player = document.getElementById('audioplayer');
    const source = document.getElementById('audiosource');
    if (type == 'cont') {
        if (action == 'play') {
            if (source.src.length > 0) {
            player.play();
            console.debug('playing');
            } else {
                console.error('No file loaded to continue playback. Correct use: \n sound(file, filetype, "play", "repl")');
            }
        } else if (action == 'pause') {
            player.pause();
            console.debug('paused');
        } else if (action == 'stop') {
            player.pause();
            player.currentTime = 0;
            console.debug('stopped');
        } else {
            console.error(`Invalid action '${action}' for type 'cont'`);
        }
    } else if (type == 'repl') {
        if (action == 'play') {
            source.src = file;
            player.load();
            player.play();
            console.debug('playing');
        } else if (action == 'pause') {
            player.pause();
            console.debug('paused');
        } else if (action == 'stop') {
            player.pause();
            player.currentTime = 0;
            console.debug('stopped');
        } else {
            console.error(`Invalid action '${action}' for type 'repl'`);
        }
    }
}
    
function testPlaylist() {
    let url = prompt('url: ');
    sound(url, null, 'play', 'repl');
}

function uploadFile() {
    const infoboxbefore = elements['info-infobox'].innerHTML;
    if (!usersettings.experimental['url-upload']) {
        urltxt = '';
    } else {
        urltxt = '<p>Or put the URL of the direct file here:</p><input type="text" id="urlInput" placeholder="https://example.com/file.mp3"><button id="urlSubmit">Submit</button>';
    }
    elements['info-infobox'].innerHTML = '<p>Upload a file:</p><label for="fileInput">Choose File</label>' + urltxt;
    function handleFileChange(event) {
        const file = event.target.files[0];
        document.getElementById('fileInput').removeEventListener('change', handleFileChange);
        elements['info-infobox'].innerHTML = infoboxbefore;
        sound(URL.createObjectURL(file), null, 'play', 'repl');
        playlistAdd(file);
        updateMetadata();
    }
    function handleFileChangeURL() {
        const textbox = document.getElementById('urlInput');
        const file = fetch(textbox.value)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            });
        document.getElementById('urlSubmit').removeEventListener('click', handleFileChange);
        elements['info-infobox'].innerHTML = infoboxbefore;
        sound(file, null, 'play', 'repl');
        
        playlistAdd(file);
        updateMetadata();
    }

    document.getElementById('fileInput').addEventListener('change', handleFileChange);
    document.getElementById('urlSubmit').addEventListener('click', handleFileChangeURL);

}

function playlistAdd(file) {
    if (!file) {
        console.error('No file provided to playlistAdd. Please provide a file object.');
        return;
    }
    const fileObj = { name: file.name, url: URL.createObjectURL(file) };
    fetch('/content/playlist.json')
        .then(response => response.json())
        .then(data => {
            let added = false;
            Object.keys(data).forEach(key => {
                if (elements[key] != 'info-infobox') {
                if (!added && data[key] === '[dynamic]' && !playlist[key]) {
                    playlist[key] = fileObj;
                    elements[key].innerHTML = file.name;
                    elements[key].style.color = maintextcolor;
                    elements[key].onclick = () => {
                        sound(fileObj.url, null, 'play', 'repl');
                        updateMetadata();
                    };
                    added = true;
                    if (usersettings.experimental['localstorage-playlist']) {
                        localStorage.setItem('playlist', JSON.stringify(playlist));
                    }
                }
            }
            });
            if (!added) {
                console.warn('No available slot to add the file.');
            }
        });
}
function displayPlaylist() {
    fetch('/content/playlist.json')
        .then(response => response.json())
        .then(data => {
            Object.keys(data).forEach(key => {
                if (playlist[key]) {
                    elements[key].innerHTML = playlist[key].name;
                    elements[key].onclick = () => {
                        sound(playlist[key].url, null, 'play', 'repl');
                        updateMetadata();
                    };
                } else {
                    if(data[key].startsWith('!')) {
                    elements[key].innerHTML = data[key].substring(1);
                    elements[key].onclick = uploadFile;
                    }else {
                    elements[key].innerHTML = data[key];
                    elements[key].onclick = null;

                    }
                    if (data[key] === '[dynamic]') {
                        elements[key].style.color = '#ffffff00'
                    } else {
                        elements[key].style.color = maintextcolor;
                    }
                }
            });
        });
}
function playlistAdvance() {
    const player = document.getElementById('audioplayer');
    const source = document.getElementById('audiosource');
    playlistKeys = Object.keys(playlist);
    if (playlistKeys.length === 0) {
        console.warn('Playlist is empty. Cannot advance.');
        return;
    }
    const currentIndex = playlistKeys.findIndex(key => playlist[key].url === source.src);
    const nextIndex = (currentIndex + 1) % playlistKeys.length;
    const nextKey = playlistKeys[nextIndex];
    source.src = playlist[nextKey].url;
    player.load();
    player.play();
    updateMetadata();
}

document.getElementById('audioplayer').addEventListener('ended', playlistAdvance);

function updateMetadata() {
    const source = document.getElementById('audiosource');
    if (source.src.length === 0) {
        console.warn('No file loaded. Cannot update metadata.');
        return;
    }
    fetch(source.src)
        .then(response => response.blob())
        .then(blob => {
            jsmediatags.read(blob, {
                onSuccess: function(tag) {
                    console.log(tag);
                    const title = tag.tags.title || 'Unknown Title';
                    const artist = tag.tags.artist || 'Unknown Artist';
                    elements['meta-title'].innerHTML = title;
                    elements['meta-artist'].innerHTML = artist;
                    const { data, format } = tag.tags.picture;
                    let base64String = "";
                    for (let i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    if (base64String.length > 0) {
                    elements['meta-albumart'].style.backgroundImage = `url(${`data:${format};base64,${btoa(base64String)}`})`;
                    } else {
                        elements['meta-albumart'].style.backgroundImage = 'none';
                    }

                },
                onError: function(error) {
                    console.log(error);
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
}

function settings() {
    elements['item-main-3'].onclick = clearplaylist;
    localStorage.setItem('settings', JSON.stringify(usersettings));
    elements['item-main-5'].onclick = () => {
        display(['/content/settings/es.json', 'ES']);
        es();

    }
}
function es() {
    setTimeout(() => {
    elements['item-main-1'].onclick = () => { tabby('home') };
    elements['item-main-3'].onclick = () => {
        usersettings.experimental['localstorage-playlist'] = !usersettings.experimental['localstorage-playlist'];
        localStorage.setItem('settings', JSON.stringify(usersettings));
        let before = elements['item-main-3'].innerHTML;
        elements['item-main-3'].innerHTML = usersettings.experimental['localstorage-playlist'] ? 'Enabled' : 'Disabled';
        setTimeout(() => {elements['item-main-3'].innerHTML = before;}, 1000);
    }
    elements['item-main-6'].onclick = () => {
        usersettings.experimental['url-upload'] = !usersettings.experimental['url-upload'];
        localStorage.setItem('settings', JSON.stringify(usersettings));
        let before = elements['item-main-6'].innerHTML;
        elements['item-main-6'].innerHTML = usersettings.experimental['url-upload'] ? 'Enabled' : 'Disabled';
        setTimeout(() => {elements['item-main-6'].innerHTML = before;}, 1000);
    }
    elements['item-main-7'].onclick = () => {
        usersettings = {
    "devmode": false,
    "experimental": {
        "localstorage-playlist": false,
        "custom-plugins": false,
        "offical-plugins": true,
        "url-upload": false
    },
    "version-made-with": "beta 26.1.0"
    };
    localStorage.setItem('settings', JSON.stringify(usersettings));
    let before = elements['item-main-7'].innerHTML;
    elements['item-main-7'].innerHTML = 'Updated';
    setTimeout(() => {elements['item-main-7'].innerHTML = before;}, 1000);
    }
    elements['item-main-4'].onclick = () => {
        usersettings.experimental['custom-plugins'] = !usersettings.experimental['custom-plugins'];
        localStorage.setItem('settings', JSON.stringify(usersettings));
        let before = elements['item-main-4'].innerHTML;
        elements['item-main-4'].innerHTML = usersettings.experimental['custom-plugins'] ? 'Enabled' : 'Disabled';
        setTimeout(() => {elements['item-main-4'].innerHTML = before;}, 1000);
    }
}, 500);
}

function clearplaylist() {
    playlist = {};
    localStorage.removeItem('playlist');
    console.debug('Playlist cleared');
}

function loadCustomPlugin() {
    if (!usersettings.experimental['custom-plugins']) {
        console.warn('Custom plugins are disabled in settings. Enable them to use this feature.');
        return;
    };
    if (pluginvars.placeholder) {
        console.warn('No loaded plugin');
        return;
    }
    const script = pluginvars.plugin.contents['javascript'];
    try {
        fetch(script)
        .then(response => response.text())
        .then(eval);
    } catch (error) {
        console.error(`plugin error: ${error}`)
        alert(`plugin error: \n\n${error} \n\nPlease reload.`)
    }
    if (pluginvars.plugin.contents['css'] != '') {
        localStorage.setItem('forcecss', pluginvars.plugin.contents['css']);
        window.location.reload();
    }
    
}
function pluginTest() {
    console.log('woa')
}
function loadfromurl(url) {
    if (!usersettings.experimental['url-upload']) {
        console.warn('URL upload is disabled in settings. Enable it to use this feature.');
        return;
    }
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('they did NOT like you bruh');
        }

        })
}

if (usersettings.experimental['custom-plugins'] && !pluginvars.placeholder) {
    setTimeout(() => {
        console.error(`Roses are red,\nViolets are blue,\nUnexpected '}'\non line 32.`)
        // love whoevers reading this :heart:
    }, Math.random() * 5000);
}

function showplugininfo(element) {
    try {
        let name = element.innerHTML;
        let infobox = elements['info-infobox']
        fetch('content/plugins/plugindata.json')
        .then(response => response.json())
        .then(data => {
            let title = data[name].name;
            let description = data[name].description;
            let author = data[name].author;
            let version = data[name].version;
            infobox.innerHTML = `<h2>${title}</h2><p>${description}</p><p>By ${author} | Version: ${version}</p><button onclick="load('${data[name].name}')">Activate</button>`;
        });
    } catch (error) {
        alert(error)
    }
}

function load(plugin) {
    fetch('content/plugins/plugindata.json')
    .then(response => response.json())
    .then(data => {
        let script = data[plugin].js;
        let css = data[plugin].css;
        if (script != '') {
            try {
                fetch(script)
                .then(response => response.text())
                .then(eval);
            } catch (error) {
                console.error(`plugin error: ${error}`)
                alert(`plugin error: \n\n${error} \n\nplease make an issue on github or tell someone on #musiweb on slack.`)
            }
        }
        if (css != '') {
            localStorage.setItem('forcecss', css);
            if (script != '') {
                localStorage.setItem('forcejs', script);
            }
            window.location.reload();
        }
    });
}

function checkjs() {
    if (!usersettings.experimental['offical-plugins']) {
        alert('you have disabled official plugins in settings.')
        return;
    }
    if (localStorage.getItem('forcejs')) {
        let script = localStorage.getItem('forcejs');
        try {
            
            fetch(script)
            .then(response => response.text())
            .then(eval);
        } catch (error) {
            console.error(`plugin error: ${error}`)
            alert(`plugin error: \n\n${error} \n\nplease make an issue on github or tell someone on #musiweb on slack.`)
        }
        localStorage.removeItem('forcejs');
    }
}

checkjs();