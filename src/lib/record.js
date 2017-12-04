const Recording = (function () {
    
    const getDevice = require('./parse.js').device,
          appConfing = require('../conf/appConfig.js'),
          recordConfig = require('../conf/recordConfig.js'),
          exec = require('child_process').exec,
          spawn = require('child_process').spawn,
          path = require('path');

    let ffmpeg;

    function Recording () { }

    Recording.prototype = {
        
        start: function () {
            console.log( 'record start' );
            let title = appConfing.indexTitle,
                microphone = appConfing.microphone,
                storePath = path.join( __dirname, `../record` ),
                filename = recordConfig.yours + '_' + recordConfig.time + '.mp4';

                let args = [
                    '-y', 
                    '-framerate', '7', 
                    '-rtbufsize', '1500M',  
                    '-f', 'gdigrab', '-i', `title=${ appConfing.indexTitle }`, 
                    '-f', 'dshow', '-i', 'audio=virtual-audio-capturer', 
                    '-f', 'dshow', '-i', `audio=${ appConfing.microphone }`, 
                    '-filter_complex', '[1:0][2:0]amix=inputs=2:duration=shortest', 
                    '-crf', '0', 
                    '-vcodec', 'libx264' ,
                    '-preset', 'ultrafast', 
                    '-pix_fmt', 'yuv420p', 
                    '-r', '7', 
                    '-ab', '192k', 
                    '-ac', '2', 
                    '-ar', '22050', 
                    `${ storePath }/${ filename }`
                ]
                ffmpeg = spawn( 'ffmpeg', args );
      
                // let command = `ffmpeg -framerate 3 -rtbufsize 1500M -f gdigrab -i title="${ appConfing.indexTitle }" -f dshow -i audio="virtual-audio-capturer" -f dshow -i audio="${ appConfing.microphone }" -filter_complex "[1:0][2:0]amix=inputs=2:duration=shortest" -crf 0 -vcodec libx264 -preset ultrafast -pix_fmt yuv420p -r 3 -ab 192k -ac 2 -ar 22050 ${ storePath }/${ filename }`;
    
        },
        end: function () {
            return new Promise (function (resolve, reject) {
            
                ffmpeg.stdin.write( 'q' );
                
                ffmpeg.on( 'close', function () {
                    console.log('record end')
                    resolve();
                });
                ffmpeg.on( 'error', function ( err ) {
                    reject( err )
                });
            })
        }
    }
    
    return Recording;

})();

module.exports = { Recording }