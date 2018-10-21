


import * as HTML from './html_elems'

export { 
  loadAssets,
  initMaterials,
  initScene,
  addLabirintToScene,
  prepearMirrorRenderer,
  setOnResize,
  animate,
  setFuncInUpdates,
  concatSecretAndRoomsAreas,
  removeFromScene,
  checkPlayerCollision,
  stopMoveCamera
} 



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

const assets = {
  textures: {
    stone: {
      map: null,
      src: 'assets/stone.jpg'
    },
    wood: {
      map: null,
      src: 'assets/wood.jpg'
    },
    books: {
      map: null,
      src: 'assets/books.jpg'
    },
    window: {
      map: null,
      src: 'assets/window.jpg'
    }
  },
  geoms: {
    lab: {
      geom: null,
      src: 'assets/walls.obj'    
    }
  } 
}

let actionsLoad = [], loaded = 0
  
const loadAssets = ( on ) => {
  let actionsLoadTextures = setLoadTextures( assets.textures, nextLoad )
  let actionLoadGeoms = setLoadGeoms( assets.geoms, nextLoad )
  actionsLoad = actionsLoadTextures.concat( actionLoadGeoms )
  actionsLoad.push( on )
  actionsLoad[ 0 ]() 
}

const nextLoad = () => {
  loaded ++ 
  actionsLoad[ loaded ]()
}

const setLoadTextures = ( textures, onload ) => {
  let textureLoader = new THREE.TextureLoader()
  let actions = []
  for ( let key in textures ) {
    actions.push( () => { 
      textureLoader.load( 
        textures[ key ].src, 
        ( img ) => {
        textures[ key ].map = img 
        onload()    
        } 
      ) 
    } )
  }
  return actions    
}
    
const setLoadGeoms = ( geoms, onload ) => {
  let objLoader = new THREE.OBJLoader()
  let actions = []
  for ( let key in geoms ) {
    actions.push( () => { 
      objLoader.load( 
        geoms[ key ].src, 
        ( obj ) => {
          geoms[ key ].geom = obj 
          onload()  
        } 
      ) 
    } )
  }
  return actions
}



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

const materials = {}

const initMaterials = () => {
  materials.stone = new THREE.MeshPhongMaterial( {
    map: assets.textures.stone.map
  } )
  materials.stone.map.wrapS = materials.stone.map.wrapT = THREE.RepeatWrapping
  materials.books = new THREE.MeshPhongMaterial( {
    map: assets.textures.books.map,
    color: 0x282115
  } )
  materials.wood = new THREE.MeshPhongMaterial( {
    map: assets.textures.wood.map,
    color: 0xffffff
  } )
  materials.books.map.wrapS = materials.books.map.wrapT = THREE.RepeatWrapping
  materials.easy = new THREE.MeshPhongMaterial( { color: 0xffffff } )
  materials.window = new THREE.MeshPhongMaterial( { map: assets.textures.window.map } ) 
  materials.mirror = new THREE.MeshPhongMaterial( { color: 0xff00 } )   
}

const createMaterialLetter = ( text, color ) => {
  if ( assets.textures[ text ] ) return 
  let size = 100
  let canvas = document.createElement( "canvas" )
  let context = canvas.getContext( "2d" )
  context.font = size + "pt Arial"
  context.strokeStyle = "white"
  context.textAlign = "bottom"
  context.fillStyle = "white";
  context.fillText( text, 100, canvas.height * 0.8 )
  let texture = new THREE.Texture( canvas )
  texture.needsUpdate = true
  assets.textures[ text ] = {}
  assets.textures[ text ].map = texture
  materials[ text ] = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    opacity: 1,
    alphaMap: assets.textures[ text ].map,
    transparent: true
  } ) 
  materials[ text ].needsUpdate = true  
}



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

let camera, collisionMesh,
scene, renderer
  
const initScene = () => {
  renderer = new THREE.WebGLRenderer( {
    canvas: document.getElementById( 'webgl-canvas' ),
    antialias: true
  } )
  renderer.setClearColor( 0x000000 )
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 50 )
  camera.position.y = 1.7
  camera.position.x = 66
  camera.position.z = 5
  collisionMesh = new THREE.Mesh(
    new THREE.BoxGeometry( 0.001, 0.001, 0.001 ),
    new THREE.MeshBasicMaterial( { color: 0xff0000 } )
  )
  collisionMesh.position.z = -1
  scene = new THREE.Scene()
  scene.add( camera )
  camera.add( collisionMesh )
  scene.fog = new THREE.FogExp2( 0x1c1614, 0.05, 100 );
  let lightA = new THREE.AmbientLight( 0xffffff, 1.2 )
  lightA.position.set( 5, 5, 5 )
  scene.add( lightA )
  let pLight = new THREE.PointLight( 0x615d19, 3.5 )
  pLight.position.set( 0, 3, 0 )
  camera.add( pLight )
  let floorGeometry = new THREE.PlaneGeometry( 1000, 1000, 5, 5 )	
  let floorMap = materials.stone.map.clone()  
  let floorMat = new THREE.MeshPhongMaterial( { map: floorMap } )
  let floorMesh = new THREE.Mesh( floorGeometry, floorMat )
  floorMesh.material.map.repeat.set( 100, 100 )
  floorMap.needsUpdate = true
  floorMesh.position.y = 6.0
  floorMesh.rotation.x = 0.5 * Math.PI 
  scene.add( floorMesh )	
}

const setOnResize = () => {
  window.onresize = () => {
    renderer.setSize( window.innerWidth, window.innerHeight )
    camera.aspect = window.innerWidth/ window.innerHeight 
    camera.updateProjectionMatrix()     
  } 
}

let mirrorCam, mirrorRenderer, mirrorMap

const prepearMirrorRenderer = () => {
  mirrorCam = new THREE.PerspectiveCamera( 120, 2.2 / 3.1, 0.1, 50 ) 
  mirrorCam.position.set( -3.7, 1.7, 47.7 )
  mirrorMap = new THREE.WebGLRenderTarget( 100, 200, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } )	
  materials.mirror = new THREE.MeshBasicMaterial( { map: mirrorMap.texture } ) 
  mirror.material = materials.mirror
  mirror.material.needsUpdate = true
}

const updateMirrorDoor = () => {
  mirrorCam.rotation.y = camera.rotation.y - 3.14
  renderer.render( scene, mirrorCam, mirrorMap )
}
  


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

let mirror = null

const addLabirintToScene = ( ARTEFACTS ) => {
  ARTEFACTS.secretDoor = new THREE.Group()
  scene.add( ARTEFACTS.secretDoor )
  assets.geoms.lab.geom.traverse( ( child ) => {
    if ( child instanceof THREE.Mesh != true ) {
      if ( checkChildName( child.name, 'room' ) ) setCollisionRoom( child, 'room' )
      if ( checkChildName( child.name, 'secret' ) ) setCollisionRoom( child, 'secret' )
      if ( checkChildName( child.name, 'exit' ) ) setCollisionRoom( child, 'exit' )
      if ( checkChildName( child.name, 'password' ) ) setCollisionRoom( child, 'password' )
      if ( checkChildName( child.name, 'book_area' ) ) setCollisionRoom( child, 'secretBook' )
      if ( checkChildName( child.name, 'sdoor_area' ) ) setCollisionRoom( child, 'mirrorDoor' )
      if ( checkChildName( child.name, 'trap_area' ) ) setCollisionRoom( child, 'trap' )
      return   
    }
    if ( child.name == 'books' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.books )
      scene.add( mesh )
    } else if (  child.name == 'window' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.window )
      scene.add( mesh ) 
    } else if (  child.name == 'wood' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.wood )
      scene.add( mesh )
    } else if (  child.name == 'candle' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.easy )
      scene.add( mesh )           
    } else if (  child.name == 'book' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.wood )
      scene.add( mesh )
      ARTEFACTS.secretBook = mesh   
    } else if (  child.name == 'password_List' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.easy )
      scene.add( mesh )
      ARTEFACTS.passwordPaper = mesh     
    } else if (  child.name == 'mirror_wood' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.wood )
      ARTEFACTS.secretDoor.add( mesh )     
    } else if (  child.name == 'mirror' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.mirror )
      ARTEFACTS.secretDoor.add( mesh )
      mirror = mesh             
    } else if ( checkChildName( child.name, 'letter' ) ) {
      let letter = child.name.substring( child.name.length - 1 , child.name.length )
      createMaterialLetter( letter )
      let mesh = new THREE.Mesh( child.geometry, materials[ letter ] )
      scene.add( mesh )              
    } else {
      let mesh = new THREE.Mesh( child.geometry, materials.stone )
      scene.add( mesh )          
    }    
  } )
}

const checkChildName = ( string, val ) => {
  if ( ~string.indexOf( val ) ) return true
  return false
}

const removeFromScene = v => scene.remove( v )    



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/ 

let arrRooms = [], arrSecrets = [], arrExits = [], arrPasswords = [], arrSecretBooks = [], arrMirrorDoor = [], arrTraps = []

const setCollisionRoom = ( geom, type ) => {
  let verticies = geom.geometry.attributes.position.array
  let verts = []
  for ( let i = 0; i < verticies.length - 3 ; i += 3  ) {
    verts.push( new SAT.Vector( verticies[ i ], verticies[ i + 2 ] ) ) 
  }
  let room = {
    name: geom.name,
    poligon: new SAT.Polygon( new SAT.Vector, verts )
  }
  if ( type == 'room' ) arrRooms.push( room )
  if ( type == 'secret' ) arrSecrets.push( room )
  if ( type == 'exit' ) arrExits.push( room )
  if ( type == 'password') arrPasswords.push( room )
  if ( type == 'secretBook') arrSecretBooks.push( room )
  if ( type == 'mirrorDoor') arrMirrorDoor.push( room )
  if ( type == 'trap') arrTraps.push( room )
}

const concatSecretAndRoomsAreas = () => [].push.apply( arrRooms, arrSecrets )  
 
const checkPlayerCollision = areas => {
  let inRoom = false
  let point = new THREE.Vector3()
  collisionMesh.getWorldPosition( point ) 
  let v = new SAT.Vector( point.x, point.z )
  let arr
  if ( areas == 'rooms' ) arr = arrRooms
  if ( areas == 'secrets' ) arr = arrSecrets
  if ( areas == 'exits' ) arr = arrExits
  if ( areas == 'passwords' ) arr = arrPasswords
  if ( areas == 'secretBooks' ) arr = arrSecretBooks
  if ( areas == 'mirrorDoor' ) arr = arrMirrorDoor
  if ( areas == 'traps' ) arr = arrTraps
  arr.forEach( item => {
    if ( SAT.pointInPolygon(v, item.poligon) ) { 
      inRoom = item.name
    }
  } )
  return inRoom
} 



/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

let isCameraMove = true, currentRoom = ''

const animate = () => {
  if ( isCameraMove ) { 
    if ( HTML.keys.up ) updatePlayerMove()
    if ( HTML.keys.left ) camera.rotation.y += 0.02
    if ( HTML.keys.right ) camera.rotation.y -= 0.02
  }  
  updateArtefacts( camera )
  renderer.render( scene, camera ) 
  if ( currentRoom == 'room_S' || currentRoom == 'room_Y') updateMirrorDoor()  
  requestAnimationFrame( animate )	  
}

const updatePlayerMove = () => {
  currentRoom = checkPlayerCollision( 'rooms' )
  if ( ! currentRoom ) return
  updateParamsGame( checkPlayerCollision )
  camera.translateZ( -0.15 )
  if ( currentRoom == 'room_Door') return
  if ( currentRoom == 'secret' ) {
    HTML.setNumberRoom( 'Secret room' ) 
    return   
  } 
  HTML.setNumberRoom( currentRoom[ currentRoom.length-1 ] ) 
}

let updateParamsGame = () => {}, updateArtefacts = () => {}

const setFuncInUpdates = ( fStatuses, fArtefacts ) => {
  updateParamsGame = fStatuses
  updateArtefacts =  fArtefacts
}

const stopMoveCamera = () => isCameraMove = false



