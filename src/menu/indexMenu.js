// index page menu
const { app }   = require( 'electron' ),
      recording = require( '../lib/record.js' ).Recording,
      recordConfig = require( '../conf/recordConfig.js' );

module.exports = [
  {
    label: '파일',
      submenu:[
        {
          label: 'Quit',
          accelerator:process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
          click(){
            app.quit();
          }
        }
      ]
  },
  {
    label: '녹화',
      submenu:[
        {
          label:'시작',
          accelerator:'Ctrl+1',
          click() {
            console.log('GoGoGo')
            var request = require('request');
            var path = require('path');
            var fs = require('fs');
            
            var filename = path.join(__dirname, '../record/sample_3.mp4')
            var target = 'http://localhost:7777/record/'+ 'councel' + '/' + path.basename(filename);
            
            var rs = fs.createReadStream(filename);
            var ws = request.post(target);
            
            ws.on('drain', function () {
              console.log('drain', new Date());
              rs.resume();
            });
            
            rs.on('end', function () {
              console.log('uploaded to ' + target);
            });
            
            ws.on('error', function (err) {
              console.error('cannot send file to ' + target + ': ' + err);
            });
            
            rs.pipe(ws);

          }
        },
        {
          label: '중지',
          accelerator:'Ctrl+2',
          click(){
            if ( recordConfig.possible ) {
              console.log('Recrod stop');
              let rec = new recording();
              rec.end();
            } else {
              console.log('이용할 수 x')
              
            }              
          }
        }
      ]
  }       
]