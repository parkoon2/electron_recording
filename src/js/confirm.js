const electron = require('electron'),
      domify = require('domify'),
      { ipcRenderer } = electron

const confirmList = document.querySelector('#confirmList');

ipcRenderer.on('message', function (evt, data) {
    Object.keys( data.result ).map( function (key) {
        let val,
            el,
            downloadBtn;
            
        if ( key === 'virtual') {
            val = data.result[key] ? '설치 완료' : '설치 필요'
            el = domify(`
            <li> ${ key } : ${ val } <a id="download" href="#" >설치하기</a></li>
            `)
        }

        if ( key === 'microphone') {
            val = data.result[key] ? '연결 완료' : '연결 필요'
            el = domify(`
            <li> ${ key } : ${ val } </li>
            `)
        }
                
        confirmList.appendChild(el)
        
        downloadBtn = document.querySelector('#download');
        if ( downloadBtn ) {
            downloadBtn.addEventListener( 'click', downloadHandler );
        }

    })
});


ipcRenderer.send('message', {
    command: 'check:device'
})

function downloadHandler () {
    ipcRenderer.send('message',{
        command: 'download:device' , 
        url:'https://sourceforge.net/projects/screencapturer/'
    });
}