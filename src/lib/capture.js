
const electron = require( 'electron' );
const domify = require('domify')
const { ipcRenderer, desktopCapturer } = require('electron')
const a = 'a'


const sourceType = {
    types: ['window', 'screen']
}


function capture () {

    let captureList = []

    console.log('desktopCapturer',desktopCapturer)
    console.log('ipcRenderer',ipcRenderer)
    console.log('a',a)
    console.log('electron',electron)
    // return new Promise (function (resolve, reject) {
    //     desktopCapturer.getSources(sourceType, function (err, sources) {
           
    //         if ( err ) reject( err );
    
    //         for(let source of sources) {
                
    //             let thumb = source.thumbnail.toDataURL()
    //             if ( !thumb ) continue
    //             let name = source.name

    //             captureList.push( thumb + name );
    //         }
    
    //         resolve(captureList)
    //     })
    // })


}

module.exports = { capture }