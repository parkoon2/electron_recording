(function () {
   
    const electron = require('electron')
    const domify = require('domify')
    const { ipcRenderer, desktopCapturer } = electron
    const capture = require('./lib/capture')

    const captureList = document.querySelector('#capturer-list')
    
    document.addEventListener('DOMContentLoaded', startCapture);


    function startCapture () {
        capture(captureList, function (err, sources) {
            if (err) {
                console.log(err)
            } else {
                console.log(sources)
                let links = captureList.querySelectorAll('a')
                
                for (let i = 0; i < links.length ; i ++) {

                    links[i].onclick = (function (index) {
                        return function (e) {
                            e.preventDefault()
                            ipcRenderer.send('message', {
                                command: 'record:start',
                                id: sources[index].id,
                                title: sources[index].name
                            })
                         }
                     })(i)
                }
            }
        });
    }

})()


    