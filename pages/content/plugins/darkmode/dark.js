// dark mode plugin by TheEpicStudent
//version 1.1.0

// this is a perfect example that has no bugs whatsoever and i put so much time into

elements['item-menu-plugin1'].onclick = () => { display(['content/plugins/darkmode/darksettings.json', 'Dark Mode Settings']), E4DT5(); };
setTimeout(() => {
elements['item-menu-plugin1'].innerText = 'Dark Mode Settings';
}, 500);

if (!document.getElementById('colorpick')) {
    let colorpick = document.createElement('input');
    colorpick.type = 'color';
    colorpick.id = 'colorpick';
    colorpick.value = '#000000';
    colorpick.style.position = 'fixed';
    colorpick.style.top = '9999px';
    colorpick.style.left = '9999px';
    colorpick.style.display = 'none';
    document.body.appendChild(colorpick);
}
let type = 'text';

function E4DT5() {
    setTimeout(() => {
        elements['item-main-1'].onclick = () => { type = 'prim'; clickpicker(); }
        elements['item-main-2'].onclick = () => { type = 'sec'; clickpicker(); }
        elements['item-main-3'].onclick = () => { type = 'text'; clickpicker(); }
        elements['item-main-4'].onclick = () => { type = 'background'; clickpicker(); }
        document.getElementById('colorpick').oninput = (e) => {
            color = e.target.value;
            changecolor(type);
        }
    }, 500);
}

function clickpicker() {
    elements['info-infobox'].innerHTML = '<label for="colorpick">Choose Color</label>';
}


function changecolor(type) {
    try {
        if (type == 'text') {
            maintextcolor = document.getElementById('colorpick').value;
            document.body.style.color = maintextcolor;
            localStorage.setItem('pluginE4DT5textcolor', maintextcolor);
        } else if (type == 'background') {
            document.body.style.backgroundColor = color;
            maintextcolor = color;
            localStorage.setItem('pluginE4DT5backcolor', color);
        } else if (type == 'prim') {
            for (let i = 1; i < 21; i += 2) {
                document.getElementById(`item-main-${i}`).style.backgroundColor = color;
            }
        } else if (type == 'sec') {
            for (let i = 2; i < 21; i += 2) {
                document.getElementById(`item-main-${i}`).style.backgroundColor = color;
            }
        } else {
            console.error('E4DT5: invalid type')
        }
    } catch (error) {
        console.error(`E4DT5: ${error.message} ${this.Function ? 'in function ' + this.Function.name : ''}`)
    }
}


