	


window.onload = () => {  
  loadAssets( () => {
    hidePreloader()
    initMaterials()  
    initScene()
    prepaerLab()
    startAnimation()
    testSAT()
  } ) 
}



/*******************************************************************/ 

const hidePreloader = () => {
  let pr = document.getElementById( 'preloader' )
  pr.className = 'hidden'
}

const assets = {
  textures: {
    stone: {
      map: null,
      src: 'assets/stone.jpg'
    },
    books: {
      map: null,
      src: 'assets/books.jpg'
    },
    window: {
      map: null,
      src: 'assets/window.png'
    }
  },
  geoms: {
    lab: {
      geom: null,
      src: 'assets/walls.obj'    
    }
  } 
}
  
actionsLoad = [], loaded = 0
  
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



/*******************************************************************/  

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
  materials.books.map.wrapS = materials.books.map.wrapT = THREE.RepeatWrapping
  materials.easy = new THREE.MeshPhongMaterial( { color: 0xaaffff } )
  materials.window = new THREE.MeshPhongMaterial( { map: assets.textures.window.map } ) 
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
    opacity: 0.7,
    alphaMap: assets.textures[ text ].map,
    transparent: true
  } ) 
  materials[ text ].needsUpdate = true  
}



/*******************************************************************/

let camera, scene, renderer,
pLight

const initScene = () => {
    renderer = new THREE.WebGLRenderer( {
      canvas: document.getElementById( 'myCanvas' ),
      antialias: true
    } )
    renderer.setClearColor( 0x000000 )
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight )
    camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 )
    camera.position.y = 2
    camera.position.x = 66
    camera.position.z = 5
    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2( 0x1c1614, 0.05, 100 );

    let lightA = new THREE.AmbientLight( 0xffffff, 0.5 )
    lightA.position.set( 5, 5, 5 )
    scene.add( lightA )
    pLight = new THREE.PointLight( 0x615d19, 1.5 )
    pLight.position.set( 0, 5, 0 )
    scene.add( pLight )
    let floorGeometry = new THREE.PlaneGeometry( 1000, 1000, 5, 5 )	
    let floorMap = materials.stone.map.clone()  
    let floorMat = new THREE.MeshPhongMaterial( { map: floorMap } )
    let floorMesh = new THREE.Mesh( floorGeometry, floorMat )
    floorMesh.material.map.repeat.set( 100, 100 )
    floorMap.needsUpdate = true
    floorMesh.position.y = -2.0
    floorMesh.rotation.x = -0.5 * Math.PI
    scene.add( floorMesh )
    let floorMesh2 = floorMesh.clone()
    floorMesh2.position.y = 9;
    floorMesh2.rotation.x = 0.5 * Math.PI; 
    scene.add( floorMesh2 )	
}



/****************************************************************/

const prepaerLab = () => {
  assets.geoms.lab.geom.traverse( ( child ) => {
    if ( child instanceof THREE.Mesh != true ) {
      if ( checkChildName( child.name, 'room' ) ) setCollisionRoom( child )
      return   
    }
    if ( child.name == 'books' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.books )
      scene.add( mesh )
    } else if (  child.name == 'arch' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.stone )
      scene.add( mesh )
    } else if (  child.name == 'window' ) {
      let mesh = new THREE.Mesh( child.geometry, materials.window )
      scene.add( mesh )  
    } else if (  child.name == 'collision' ) {
      console.log( child )
      let mesh = new THREE.Mesh( child.geometry, materials.window )
      scene.add( mesh )        
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
  if ( ~string.indexOf( val ) ) {
    return true
  } 
  return false
}



/*******************************************************************/

let player, clock, INV_MAX_FPS = 0.01, frameDelta = 0

const startAnimation = () => {
  clock = new THREE.Clock()
  player = new THREE.FirstPersonControls( camera )
  player.movementSpeed = 7
  player.lookSpeed = 0.1	
  console.log( player ) 
  requestAnimationFrame( function animate() {
    draw()
    frameDelta += clock.getDelta()
      while ( frameDelta >= INV_MAX_FPS ) {				
      player.update( INV_MAX_FPS )						
      frameDelta -= INV_MAX_FPS
    }
    requestAnimationFrame( animate )				
  })	
} 
	
function draw() {
  checkCameraCollision()
  pLight.position.x = camera.position.x
  pLight.position.z = camera.position.z  
  renderer.render( scene, camera )
}

/*******************************************************************/

let arrRooms = []

const setCollisionRoom = geom => {
  let verticies = geom.geometry.attributes.position.array
  let verts = []
  for ( i = 0; i < verticies.length - 3 ; i += 3  ) {
    verts.push( new SAT.Vector( verticies[ i ], verticies[ i + 2 ] ) ) 
  }
  let room = {
    name: geom.name,
    poligon: new SAT.Polygon( new SAT.Vector, verts )
  }
  arrRooms.push( room )
}

let tester = document.getElementById( 'tester' )

const checkCameraCollision = () => {

  let isWall = true  
  let v = new SAT.Vector( player.target.x, player.target.z )
  arrRooms.forEach( item => {
    if ( SAT.pointInPolygon(v, item.poligon) ) { 
      tester.innerHTML = item.name 
      isWall = false
    }
  } )
  if ( isWall ) player.moveForward = false //:  player.moveForward = true
} 













const testSAT = () => {
  var v = new SAT.Vector(1000, 10)
  var p = new SAT.Polygon( new SAT.Vector(), [
    new SAT.Vector(),
    new SAT.Vector(100,0),
    new SAT.Vector(50,75)
  ]);

  console.log( SAT.pointInPolygon(v, p) )
}


  
