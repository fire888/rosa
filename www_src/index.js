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
    HTML.setStartButton( SC.animate )
    HTML.setMessage( 'Find list in room I' )
  } ) 
}

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

let gameSTATE = 'gotoDoor' //'findPassword' || 'gotoDoor' || 'findBook' || findExit' || 'win'
let artefacts = { 
  passwordPaper: null, 
  secretDoor: null, 
  secretBook: null
}  

const updateGameStatus = ( checkNear ) => {  
  if ( gameSTATE == 'findPassword') {
    if ( checkNear( 'passwords' ) ) {
      gameSTATE = 'gotoDoor'
      HTML.setMessage( 'You find some message. Find secret door.' )
    }
  }
  if ( gameSTATE == 'findBook' ) {
    if ( checkNear( 'secrets' ) ) {  
      if ( checkNear( 'secretBooks' ) ) {
        HTML.setMessage( 'You find Book. Go to exit.' )
        gameSTATE = 'findExit'
      }
    } 
  } 
  if ( gameSTATE == 'findExit') {
    if ( checkNear( 'exits' ) ) {   
      gameSTATE = 'win'
      HTML.setMessage( 'You win.' )
    }
  }
}

let isDoorUp = false

const updateArtefacts = () => {
  if ( gameSTATE == 'gotoDoor' ) {
    if ( isDoorUp ) {
      if ( artefacts.secretDoor.position.y < 3 ) {
        artefacts.secretDoor.position.y += 0.05
      } else {
        SC.concatSecretAndRoomsAreas()
        gameSTATE = 'findBook'
        HTML.setMessage( 'Secret room is opened' )
      }
    }
  }
}

const startAnimationDoor = () => isDoorUp = true


