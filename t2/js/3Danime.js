var scene, mesh;
function init() {

    scene = new THREE.Scene();
    //------------------------------------------------------------implementing shadow
    scene.fog = new THREE.FogExp2(0xffffff, 0.05);
    //----------------------------------------------------------------------------creating plain
    var path = 'milky/';
    var format = '.jpg';
    var urls = [
        path + 'nx' + format, path + 'px' + format,
        path + 'ny' + format, path + 'py' + format,
        path + 'nz' + format, path + 'pz' + format,

    ];
    var reflectioncube = new THREE.CubeTextureLoader().load(urls);
    reflectioncube.format = THREE.RGBFormat;
    scene.background = reflectioncube;
    var geometry = new THREE.BoxGeometry(1,1,1);
    var material = new THREE.MeshPhongMaterial({color : 0xD63F1E});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 2 ;
    mesh.castShadow = true;
    //-------------------------------------------------adding texture to plain

    var laoder1 = new THREE.TextureLoader();
    material.map = laoder1.load('snow.jpg');
    var texture1 = material.map;
    // texture1.wrapS = THREE.RepeatWrapping;
    // texture1.wrapT = THREE.RepeatWrapping;
    // texture1.repeat.set(2, 2);
    //mesh.addEventListener( 'click',animate() , false );
    //----------------------------------------------------------------------------creating plain
    var pl = new THREE.PlaneGeometry(20, 20);
    var materialpl = new THREE.MeshPhongMaterial({color : 0xffffff, side : THREE.DoubleSide});
    var meshpl = new THREE.Mesh(pl, materialpl);
    //shadow receiving
    meshpl.receiveShadow = true;
    //-------------------------------------------------adding texture to plain
    var laoder = new THREE.TextureLoader();
    materialpl.map = laoder.load('a.jpg');
    var texture = materialpl.map;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    //---------------------------------------------------adding objects to scene
    scene.add(meshpl);
    scene.add(mesh);
    var pointlight = getpointlight(1);
    //--------------------------------------------------------lighting
    pointlight.position.y = 5;
    scene.add(pointlight);
    //-------------------------------------------------------applying name to objects
    mesh.name ='cube';
    meshpl.name = 'plane';
    //--------------------------------------------------------setting plain position
    meshpl.position.z = -1;
    meshpl.rotation.x = Math.PI/2;
    //--------------------------------------------------------------Camera

    var camera = new THREE.PerspectiveCamera(
         45,
         window.innerWidth/window.innerHeight,
         1,
         1000
     );
    // var camera = new THREE.OrthographicCamera(
    //     -15,
    //     15,
    //     15,
    //     -15,
    //     1,
    //     1000
    // );
     camera.position.x = 5;
     camera.position.y = 5;
     camera.position.z = 10;
     camera.lookAt(new THREE.Vector3(0, 0, 0));
     //------------------------------------------------------renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('webgl').appendChild(renderer.domElement);
    //-------------------------------------------------------------------------POSTPROCESS

    // var composer = new THREE.EffectComposer(renderer);
    // var rgbshiftshader = new THREE.ShaderPass(THREE.RGBShiftShader);
    // rgbshiftshader.renderToScreen = true;
    // composer.addPass(rgbshiftshader);



    // ---------------------------------------------------------Audio player
    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add( listener );

// create a global audio source
    var sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( '01-Iris.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    });
        //---------------------------------------------------------keyboard input wasd for point and shift,ctrl for y
        var cube = scene.getObjectByName('cube');
        document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 68:
                    cube.position  .x += 0.1;
                    break;
                case 87:
                    cube.position.z -= 0.1;
                    break;
                case 65:
                    cube.position.x -= 0.1;
                    break;
                case 83:
                    cube.position.z += 0.1;
                    break;
                case 16:
                    cube.position.y += 0.1;
                    break;
                case 17:
                    cube.position.y -= 0.1;
                    break;
            }
        };
    //-------------------------------------------------------------------applying mouse control
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    update(renderer, scene, camera, controls);
    //displaygiu();


    return scene;

}
function update(renderer, scene, camera, controls)    {
    renderer.render(scene, camera
    );

     var anime = scene.getObjectByName('cube');
    //------------------------------------------------------animation
     anime.rotation.z += 0.001;
     anime.rotation.x += 0.001;

    //anime.scale.y += 0.001;
    controls.update();
    requestAnimationFrame(function () {
        update(renderer, scene, camera, controls);

    })


}
//----------------------------------------------------------------------lighting
function getpointlight(intensity) {
    //var light = new THREE.AmbientLight(0xffffff, intensity);
    //var light = new THREE.DirectionalLight(0xffffff, intensity);
    var light = new THREE.PointLight(0xffffff, intensity);
    //var light = new THREE.SpotLight(0xffffff, intensity);
    light.castShadow = true;


    return light;
}
init();