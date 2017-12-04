'use strict'

function except (device, callback) {

    const audioDevices = device.audioDevices
    const videoDevices = device.videoDevices
    const { BrowserWindow }  = require('electron').remote;
    
    let virtualAudio;
    
    const download = function (url) {
        var winOptions = { width: 500,
            height: 500,
            show: false,
            nodeIntegration: false,
            webPreferences: {
                webSecurity: false
            }
        };
        var downloadWindow = new BrowserWindow(winOptions);
        downloadWindow.loadURL(url)
        downloadWindow.show()

    }

    const virtualAudioCheck = function (micCheck) {
        for (let i = 0 ; i < audioDevices.length ; i ++) {
            console.log(audioDevices[i].name)
            if (audioDevices[i].name === 'virtual-audio-capturer') {
                virtualAudio = true
                break

            } else {
                virtualAudio = false
            }
        }
        
        if (virtualAudio) {
            console.log('virtual audio가 존재합니다')
            micCheck()
        } else {
            if(confirm("동영상 저장을 위한 프로그램이 필요합니다. 다운로드 받으시겠습니까?")) {
                download("https://sourceforge.net/projects/screencapturer/")
                callback('설치 후 다시 실행하십시오.')
                //return
            } else {
                callback('동영상 저장 프로그램이 없어 녹화를 진행할 수 없습니다.')
                //return
            }
        }
    }

    virtualAudioCheck (function() {
        let mic
        for (let i = 0 ; i < audioDevices.length ; i ++) {
            console.log(audioDevices[i])
            if (audioDevices[i].name.match(/마이크/) || audioDevices[i].name.match(/Microphone/) ) {
                mic = true
                break
                //callback(null)
                //return
            } else {
                mic = false
                //callback('마이크 연결을 확인해주세요')
                //return
            }
        }

        mic ? callback(null) : callback('마이크 연결을 확인해주세요')
    })
}

module.exports = { except }

