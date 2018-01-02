var table = document.querySelector("body > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr > td > font > table > tbody")
var rows = table.children
var database = {}
for (var i = 1; i < rows.length; i++) {
    var record = {};
    var slot = rows[i].children[1].textContent;
    var code = rows[i].children[2].textContent;
    record.name = rows[i].children[3].textContent;
    record.credit = parseInt(rows[i].children[4].textContent);
    record.structure = rows[i].children[5].textContent;
    record.coordinator = rows[i].children[6].textContent;
    record.limit = rows[i].children[7].textContent;
    if(!database.hasOwnProperty(code)){
        database[code] = {}
    }
    database[code][slot] = record
}
function saveJSON(data, filename) {

    if (!data) {
        console.error('No data')
        return;
    }

    if (!filename) filename = 'console.json'

    if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], { type: 'text/json' }),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}
saveJSON(database,"sem2-2017-18.json");
