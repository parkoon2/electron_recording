const electron     = require( 'electron' ),
      path         = require( 'path' ),
      url          = require( 'url' ),
      fs           = require( 'fs' ),
      request      = require( 'request' ),
      menuTemplate = require( './src/menu/indexMenu.js' ),
      appConfig    = require( './src/conf/appConfig.js' ),
      recordConfig = require( './src/conf/recordConfig.js' ),
      recording = require( './src/lib/record.js' ).Recording,
      { app, BrowserWindow, Menu, ipcMain, shell } = electron;


let confirmWindow;
let audioResult;
let rec;


const getDevice = require( './src/lib/parse.js' ).device

app.on( 'ready', function( e ) {

    const options = {
        ffmpegPath: null
    }

    rec = new recording();

    getDevice( options, function (result) {
        audioResult = audioCheck( result.audioDevices );
        audioResult.virtual && audioResult.microphone ? succcessProcess() : failProcess();
    });
})

app.on( 'quit', function () {
    console.log( 'Exit app' );
})


function succcessProcess () {
    
    const indexMenu = Menu.buildFromTemplate( menuTemplate );
    
    let index = new BrowserWindow({
        width : appConfig.indexWidth,
        height: appConfig.indexHeight,
        title : appConfig.indexTitle,
        webPreferences: {
            nodeIntegration: true,
        }
    });
    
    
    Menu.setApplicationMenu( indexMenu );
    index.loadURL( appConfig.indexURL );
    
    ipcMain.on( 'message', function (evt, data) {
        console.log(data)
        if ( data.command ==='record:start' ) {
            recordConfig.mine = data.mine;
            recordConfig.yours = data.yours;
            recordConfig.time = data.time;
            recordConfig.filename = `${ data.yours }_${ data.time }`;
            
            
            rec.start();
            return;
        } 

        if ( data.command ==='record:end' ) {

            
           // rec = new recording();
            rec.end().then( function () {

                console.log(' start?')

                let filename = path.join( __dirname, `src/record/${ recordConfig.filename }.mp4` ),
                    target   = appConfig.storePath + path.sep + recordConfig.room + '@' +recordConfig.mine + '@' +recordConfig.yours + path.sep + path.basename( filename ),
                    rs       = fs.createReadStream( filename ),
                    ws       = request.post( target, { rejectUnauthorized: false } ,function (err, res, req) {
                        if ( !err & req ==='OK') {
                            console.log('정상처리완료')
                            index.webContents.send( 'message', {
                                command  : 'record:done',
                                filepath : target,
                                roomId   : recordConfig.room,
                                mine     : recordConfig.mine,
                                yours    : recordConfig.yours
                            });
                        }
                    });
                
                ws.on( 'drain', function () {
                  rs.resume();
                });
                
                rs.on( 'end', function () {
                  console.log( 'uploaded to ' + target );
                  recordConfig.mine = null;
                  recordConfig.yours = null;
                  recordConfig.time = null;
                });
                
                ws.on(' error', function (err) {
                  console.error( 'cannot send file to ' + target + ': ' + err);
                });
                
                rs.pipe( ws );

            }, function ( err ) {
                console.log( err );
            });

            return;
        }
    });
        
    index.on( 'page-title-updated', function ( e ) {
        e.preventDefault()
    })
        
    index.on( 'closed', function ()  {
        index = null
    })

    index.on( 'close', function( e ) { 
        e.preventDefault();
        index.destroy();
    });
}

function failProcess () {
    confirmWindow = new BrowserWindow({
        width : 700,
        height: 600,
        title : 'Confirm',
        webPreferences: {
            nodeIntegration: true,
        }
    });

    confirmWindow.loadURL( url.format({
        pathname: path.join( __dirname, 'src/view/confirm.html' ),
        protocol: 'file:',
        slashes: true
    }));

    confirmWindow.setMenu(null);

    confirmWindow.on( 'closed', function ()  {
        confirmWindow = null
    });

    ipcMain.on( 'message', function (evt, data) {
        if ( data.command === 'check:device' ) {
            confirmWindow.webContents.send( 'message', {
                result: audioResult
            });
        } else if ( data.command === 'download:device' ) {
            shell.openExternal( data.url );
            app.exit();
        } 
    });
}


function audioCheck ( audios ) {
        let virtual    = false,
            microphone = false;

        for ( let audio of audios ) {

            if ( audio.name.match( /virtual-audio-capturer*/i ) ) {
                virtual = true;
            }

            if ( audio.name.match( /마이크/i ) || audio.name.match( /Microphone*/i ) ) {
                appConfig.microphone = audio.name;
                microphone = true;
            }
        }

        return {
            virtual: virtual,
            microphone: microphone
        }
}


// If OSX, add empty object to menu
if(process.platform == 'darwin'){
    menuTemplate.unshift({})
  }
  
  // Add developer tools option if in dev
  if(process.env.NODE_ENV !== 'production'){
    menuTemplate.push({
      label: 'Developer Tools',
      submenu:[
        {
          role: 'reload'
        },
        {
          label: 'Toggle DevTools',
          accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
          click(item, focusedWindow) {
            focusedWindow.toggleDevTools()
          }
        }
      ]
    })
  }