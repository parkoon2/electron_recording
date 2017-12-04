const electron = require('electron')
const domify = require('domify')
const { ipcRenderer, desktopCapturer } = electron

const sourceType = {
    types: ['window', 'screen']
}


function capture (views, callback) {

    let captureList = []

    desktopCapturer.getSources(sourceType, function (err, sources) {
       
        if (err) callback(err, null)

        for(let source of sources) {
            
            let thumb = source.thumbnail.toDataURL()
            if (!thumb) continue
            let title = source.name
            let el = domify(`
            <li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>
            `)

            views.appendChild(el)

        }

        callback(null, sources)
    })

}

module.exports = capture