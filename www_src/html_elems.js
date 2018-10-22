


export { 
  init,
  setNumberRoom,
  switchShowMap,
  keys,
  setActionKeyS,
  setStartButton,
  setMessage
}

let numberRoom, map, message

const init = () => {
 window.oncontextmenu = () => { return false}
 document.oncontextmenu = () => { return false }
 numberRoom = document.getElementById( 'roomNumber' )
 map = document.getElementById( 'map' )
 message = document.getElementById( 'message' )
 initKeys()
 initButtons()
}

const setNumberRoom = v => numberRoom.innerHTML = v

const switchShowMap = v => map.className == 'hidden' ? map.className = 'show' : map.className = 'hidden'

const setMessage = ( text, isHide ) => {
  message.className = 'show'  
  message.innerHTML = text
  if ( ! isHide ) return
  setTimeout( () => {
    message.innerHTML = '' 
    message.className = 'hidden'     
  }, 5000 )
} 



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/ 

const keys = {
  up: false,
  left: false,
  right: false,
  s: false,
  m: false,
}
  
const keyUpdate = ( keyEvent, down ) => {
  switch( keyEvent.keyCode ) {
    case 38:
      keys.up = down
      break
    case 37:
      keys.left = down
      break
    case 39:
      keys.right = down
      break
    case 83: // s
      onKeyS()
      break
    case 77: // m
      if ( down ) switchShowMap()
      break    
  }
}
  
const initKeys = () => { 
  document.addEventListener( 'keydown', event => keyUpdate( event, true ) )
  document.addEventListener( 'keyup', event => keyUpdate( event, false ) )
}

const initButtons = () => {
  let buttLeft = document.getElementById( 'button-left' )
  buttLeft.addEventListener( 'touchstart', () => {
    keys.left = true  
  }, false ) 
  buttLeft.addEventListener('touchend', () => {
    keys.left = false  
  }, false )
  let buttRight = document.getElementById( 'button-right' )
  buttRight.addEventListener( 'touchstart' , () => {
    keys.right = true
  }, false )
  buttRight.addEventListener( 'touchend' , () => {
    keys.right = false
  }, false )
  let buttForvard = document.getElementById( 'button-forvard' )
  buttForvard.addEventListener( 'touchstart' , () => {
    keys.up = true
  }, false )
  buttForvard.addEventListener( 'touchend' , () => {
    keys.up = false
  }, false )
  let buttMap = document.getElementById( 'button-map' )
  buttMap.addEventListener( 'touchend' , () => {
    switchShowMap()
  }, false )
} 

let onKeyS = () => {}

const setActionKeyS = f => onKeyS = f



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

const setStartButton = ( on ) => {
  let preloader = document.getElementById( 'preloader' )
  preloader.className = 'hidden'
  let startBtn = document.getElementById( 'button-start' )
  startBtn.className = 'show'
  startBtn.addEventListener( 'touchstart', e => {
    if ( e.type === 'touchstart' ) {
      let butts = document.getElementById( 'buttons' )
      butts.style.display = 'flex'
      let app = document.getElementById( 'app' )
      if ( app.requestFullScreen ) {
        app.requestFullScreen()	
      } else if ( app.mozRequestFullScreen ) {
        app.mozRequestFullScreen() 				
      } else if ( app.webkitRequestFullScreen ) {
        app.webkitRequestFullScreen()				
      }
    }
  } )
  startBtn.addEventListener( 'mousedown', ( ) => {
    let app = document.getElementById( 'app' )
    app.className = 'show'    
    let pr = document.getElementById( 'start-screen-wrapper' )
    pr.style.display = 'none'
    on()
  } )
}


