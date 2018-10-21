


import * as SC from './scene' 
import * as HTML from './html_elems'

window.onload = () => { 
  HTML.init()
  SC.loadAssets( () => {
    SC.initMaterials()  
    SC.initScene()
    SC.addLabirintToScene( artefacts )
    SC.prepearMirrorRenderer()    
    SC.setOnResize()
    SC.setFuncInUpdates( updateGameStatus, updateArtefacts )
    HTML.setActionKeyS( startAnimationDoor )
    HTML.setStartButton( () => { 
      SC.animate(),
      HTML.setMessage( messages.start, true ) 
    } )
  } ) 
}



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

let gameSTATE = 'findPassword' // 'findPassword' || 'findDoor' || 'findBook' || 'findExit' || 'win' || 'nearTrap' || 'die' || 'lose'
let artefacts = { 
  passwordPaper: null, 
  secretDoor: null, 
  secretBook: null
}  

let oldState

const updateGameStatus = () => {  
  if ( SC.checkPlayerCollision( 'traps' ) ) {
    if ( gameSTATE == 'nearTrap' ) return
    oldState = gameSTATE
    gameSTATE = 'nearTrap'
    setTimeout( () => {
      if ( SC.checkPlayerCollision( 'traps' ) ) {
        SC.stopMoveCamera()
        gameSTATE = 'die'
      } else {
        gameSTATE = oldState
      }  
    }, 3000 )
  }
  if ( gameSTATE == 'findPassword') {
    if ( SC.checkPlayerCollision( 'passwords' ) ) {
      gameSTATE = 'findDoor'
      SC.removeFromScene( artefacts.passwordPaper )
      HTML.setMessage( messages.findPass, true )
    }
  }
  if ( gameSTATE == 'findDoor') {
    if ( SC.checkPlayerCollision( 'mirrorDoor' ) ) {
      gameSTATE = 'findBook'
      isDoorUp = true
    }
  }
  if ( gameSTATE == 'findBook' ) {
    if ( SC.checkPlayerCollision( 'secrets' ) ) {  
      if ( SC.checkPlayerCollision( 'secretBooks' ) ) {
        SC.removeFromScene( artefacts.secretBook )
        HTML.setMessage( messages.findBook, true )
        gameSTATE = 'findExit'
      }
    } 
  } 
  if ( gameSTATE == 'findExit') {
    if ( SC.checkPlayerCollision( 'exits' ) ) {  
      SC.stopMoveCamera() 
      gameSTATE = 'win'
      HTML.setMessage( messages.findExit, false )
    }
  }
}

let isDoorUp = false

const updateArtefacts = ( camera ) => {
  if ( gameSTATE == 'findBook' ) {
    if ( isDoorUp ) {
      if ( artefacts.secretDoor.position.y < 3 ) {
        artefacts.secretDoor.position.y += 0.05
      } else {
        SC.concatSecretAndRoomsAreas()
      }
    }
  }
  if ( gameSTATE == 'die' ) { 
    if ( camera.position.y > -1.6 ) { 
      camera.position.y -= 0.01
      camera.rotation.z -= 0.001
    } else {
      HTML.setMessage( messages.lose, false )
      gameSTATE = 'lose'
    }  
  }
}

const startAnimationDoor = () => isDoorUp = true

const messages = {
  start: '<img src="assets/enter_message.png" style="width: 50vh; height: auto;"/>',
  findPass: '<img src="assets/pass.png" style="width: 50vh; height: auto;"/>',
  findBook: '<img src="assets/book.png" style="width: 50vh; height: auto;"/>',
  findExit: '<img src="assets/exit_message.png" style="width: 50vh; height: auto;"/><br/>' + 
    '<div id="endCopyright"><a href="http://otrisovano.ru" target="blank">&copy; www.otrisovano.ru</a><br/>' + 
    '<a href="https://github.com/fire888/rosa" target="blank">github</a></div>',
  lose: '<img src="assets/rip.png" style="width: 50vh; height: auto;"/>' + 
    '<div id="endCopyright"><a href="http://js.otrisovano.ru/rosa">Restart</a></div>'  
} 


