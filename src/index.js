const electron = require('electron')
const device = require('./lib/parse.js').parse
const except = require('./lib/except').except
const exec = require('child_process').exec

const { ipcRenderer } = electron
const recButton = document.querySelector('#start-recording')
const endButton = document.querySelector('#end-recording')

const options = {
	ffmpegPath: null
}

let cmdProcess;

recButton.addEventListener('click', recStart)
endButton.addEventListener('click', recEnd)

endButton.disabled = true

ipcRenderer.on('message', function (evt, data) {
    if (data.command === 'record:start') { 
        endButton.disabled = false
    
        device(options, function (result) {
            except(result, function (err) {
                if (err) {
                    alert(err)
                } else {

                    let command = `ffmpeg -f gdigrab -rtbufsize 1500M -i title="${data.title}" -f dshow -rtbufsize 1500M -i audio="virtual-audio-capturer" -f dshow -i audio="${getRecordAudio(result)}" -filter_complex "[1:0][2:0]amix=inputs=2:duration=shortest" -vcodec libx264 -preset ultrafast -pix_fmt yuv420p -r 15 -ab 64k -ac 2 -ar 16000 afdfdzxczxcfdf.avi`;
                    
                    console.log(command)
                    cmdProcess = exec(command , function(err, stdout, stderr){
                        if (err) console.log(err)
                        if (stderr) console.log(err)
                    })
    
                }
            })
            
        })

        const getRecordAudio = function (result) {
            for (let audioDevice of result.audioDevices) {
                if ( audioDevice.name.match( /마이크/ ) || audioDevice.name.match( /Microphone/i ))
                    return audioDevice.name
            }
        }
    }
});

function recStart () {
    const data = {
        command: 'show:menu'
    }
    ipcRenderer.send('message', data)
} 

function recEnd () {
    //endButton.disabled = true
    console.log(cmdProcess)
	//cmdProcess.stdin.setEncoding('utf8');
	cmdProcess.stdin.write('q');    
}