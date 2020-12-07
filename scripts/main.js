const { Session, SessionSync } = window.zeaCollab
const {
  GLRenderer,
  Scene,
  TreeItem,
  PassType,
  GeomItem,
  Color,
  Vec2,
  Vec3,
  Mat3,
  Mat4,
  Box3,
  Group,
  Material,
  Xfo,
  Points,
  Lines,
  Ray,
  Sphere,
  Plane,
  Cone,
  Cuboid,
  Cylinder,
  Torus,
  Label,
  BillboardItem,
  Rect
} = window.zeaEngine


// const {
//   labelFontColor,
//   outlineColor
// } = window.zeaEngine

const { GLCADPass, CADAsset } = window.zeaCad;

import SurveyPoints from "./SurveyPoints.js";

console.clear()


//Setup Scene -----------------------------------
const canvas = document.getElementById('renderer')
const scene = new Scene()
scene.setupGrid(10, 10)

// const renderer = new GLRenderer(canvas)
const renderer = new GLRenderer(canvas, {
  webglOptions: {
    antialias: true,
    canvasPosition: "relative"
  }
});
renderer.setScene(scene)
renderer.resumeDrawing()

// ///alternate change color
scene
  .getSettings()
  .getParameter('BackgroundColor')
  .setValue(new Color('#33B3FF'))

// setup  -----------------------------
//
// inside browser is DOM tree structure of elelments
// Document -> scene
//
// div space for items to live, tree is same concept. position child elements
// div -> TreeItem
//
// Image/text -> GeomItem
//
// HTML -> json/ asset file
//
// 4 main elements
// 1 geometry
// 2 transform
// 3 shader
// 4 material
//

const treeItem = new TreeItem('treeItem')
scene.getRoot().addChild(treeItem)

/// Camera setup -----------------------------------
renderer
  .getViewport()
  .getCamera()
  .setPositionAndTarget(new Vec3(10, 10, 5), new Vec3(0, 0, 3))






// Construct Point -----------------------------------------------

const assetPoints = new TreeItem('Points')
scene.getRoot().addChild(assetPoints)


const sphere = new Sphere(0.05)
const material = new Material('myMat', 'SimpleSurfaceShader')
material.getParameter('BaseColor').setValue(new Color(1, 0, 0))

const creatPoints = (name, x, y, z) => {

  const getCoordSysConversionXfo = srcCoordSys => {
    const coordSysConversion = new Xfo()
    switch (srcCoordSys) {
      case 'LHS':
        coordSysConversion.ori.setFromAxisAndAngle(
          new Vec3(0, 0, 1),
          Math.PI * 0.5
        )
        coordSysConversion.sc.set(1, -1, 1)
        break
      case 'RHS':
        break
    }
    return coordSysConversion
  }

  const coordSysConversion = getCoordSysConversionXfo('LHS')

  const createPoint = (index, pos) => {
    const geomItem = new GeomItem('point-' + index)
    geomItem.getParameter('Geometry').setValue(sphere)
    geomItem.getParameter('Material').setValue(material)
    const xfo = new Xfo()
    xfo.tr = pos
    geomItem.getParameter('GlobalXfo').setValue(xfo)

    assetPoints.addChild(geomItem);
    return geomItem
  }

  const pos = new Vec3(x, y, z)
  return createPoint(name, coordSysConversion.transformVec3(pos))
}

//creatPoints('test', 1, 1, 1)
//creatPoints('test2', 2, 2, 2)

// const point1 = new Vec3(1,2,1)
// const point2 = new Vec3(5,5,5)
// //console.log(point1)

// const pointList = [point1, point2]
// console.log(pointList)


// const dimLine = new Lines(pointList)

// const material = new Material('myMat', 'SimpleSurfaceShader')
// material.getParameter('BaseColor').setValue(new Color(1, 0, 0))





///////////////////////////////////////////
// Load CAD File.

let url =
  // "https://cdn.glitch.com/193338d7-ba53-46cc-8930-c8d69b1c0a34%2F190153_ZSK_MockUpB_Steel-Anchors-M.zcad?v=1606784072811";
  "https://cdn.glitch.com/50be4aff-9887-4b35-89d6-c581809ac439%2F190153_ZSK_MockUpB-survey-2.zcad?v=1607108048570";
const cadAsset = new CADAsset();
cadAsset.getParameter("DataFilePath").setValue(url);
scene.getRoot().addChild(cadAsset);
console.log(cadAsset);
// sceneTreeView.rootItem = cadAsset

// const logTreeItem = (treeItem, depth) => {
//   //console.log(" ".repeat(depth * 2) + "|-" + treeItem.getName());
//   for (let i = 0; i < treeItem.getNumChildren(); i++) {
//     if (treeItem.hasParameter("CustomMatrix")) {
//       const matrix = treeItem.getParameter("CustomMatrix").getValue();
//       console.log(matrix)
//     }
    // console.log(treeItem.getChild(i))
    // logTreeItem(treeItem.getChild(i), depth + 1);
//   }
// };

// cadAsset.on("loaded", () => {
//   logTreeItem(cadAsset, 0);
// });

///////////////////////////////////////////

// Collab
///////////////////////////////////////////
// Collab
// const { Session, SessionSync } = window.zeaCollab;

const appData = {
  renderer,
  scene
};

const getRandomString = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);

const userData = {
  family_name: getRandomString(),
  given_name: getRandomString(),
  id: getRandomString()
};

const socketUrl = "https://websocket-staging.zea.live";
const session = new Session(userData, socketUrl);
session.joinRoom("dfghjkl");

session.sub("user-joined", user => {
  // console.log("User joined:", user);
});

session.sub("user-left", user => {
  // console.log("User left");
});

session.sub("userPressedAKey", data => {
  console.log("userPressedAKey:", data);
});

document.addEventListener("keydown", event => {
  console.log("key down", event.key);
  
  session.pub("userPressedAKey", {
    key: event.key,

    time: 43
  });
});

// const val = console.readline()
// console.log(val)
// assetPoints.getChildByName('point-survPt').getParameter('GlobalXfo').setValue().tr.z = val;
// scene.getRoot().addChild(surveyPoints);

const sessionSync = new SessionSync(session, appData, userData);

const userChipSet = document.getElementById("zea-user-chip-set");
userChipSet.session = session;

const userChip = document.getElementById("zea-user-chip");
userChip.userData = userData;

////////////////////////////////////////
// Setup the tree view

const sceneTreeView = document.getElementById("zea-tree-view");
sceneTreeView.appData = appData;
sceneTreeView.rootItem = scene.getRoot();



///////- ACCESS ATTRIBUTES ------------------------------------------------------\




///////- create matrix ------------------------------------------------------\




///////////////////////////////////////////
// Load Survey Points.
// const surveyPoints = new SurveyPoints("190528 Dummy Srvy Data");
// surveyPoints.load(
//   "https://cdn.glitch.com/193338d7-ba53-46cc-8930-c8d69b1c0a34%2FScanData.txt?v=1607017147786"
// );

// surveyPoints.on("loaded", () => {
//   // console.log('donnnnnne')
//   renderer.frameAll();
// });


// scene.getRoot().addChild(surveyPoints);

///////////////////////////////////////////




///////- get atttribute ------------------------------------------------------\
//it would be greate to populate a list of anchors to choose from----------/

const billboards = new TreeItem('billboard')
scene.getRoot().addChild(billboards)

const caliberateSurveyPoints = (refPoint1, refPoint2, refMarker1, refMarker2) => {
  
  ///////////////////////////////////
  // Calculate an Xfo for the Surveyed Points
  const xfoPoints = new Xfo()
  xfoPoints.tr = refPoint1
  
  const dirPoints = refPoint2.subtract(refPoint1)
  dirPoints.z = 0
  dirPoints.normalizeInPlace()
  xfoPoints.ori.setFromDirectionAndUpvector(dirPoints, new Vec3(0,0,1))
  
  ///////////////////////////////////
  // Calculate an Xfo for the Markers in the CAD data
  const xfoMarkers = new Xfo()
  xfoMarkers.tr = refMarker1
  
  const dirMarkers = refMarker2.subtract(refMarker1)
  dirMarkers.z = 0
  dirMarkers.normalizeInPlace()
  xfoMarkers.ori.setFromDirectionAndUpvector(dirMarkers, new Vec3(0,0,1))
  
  ///////////////////////////////////
  const delta = xfoMarkers.inverse().multiply(xfoPoints)
  
  // surveyPoints.getParameter('LocalXfo').setValue(delta)
}

/////////
//update point
// assetPoints.getChildByName('point-survPt').getParameter('GlobalXfo').getValue().tr

//////////
cadAsset.on('loaded', () => {
  renderer.frameAll();
  
  // console.log(cadAsset.getName())
  // console.log(cadAsset.getNumChildren())
  
  const generateAnchorPlane = (item) => {
    console.log(item.getName(), item.getParameter("OriginPlane").getValue())
    try {
      
      //store anchor planes as an array, 
      const ZanchorPlaneData = JSON.parse(item.getParameter("OriginPlane").getValue());

      const planeMat4 = new Mat4(new Float32Array(ZanchorPlaneData))
      console.log(planeMat4)
      
      planeMat4.transposeInPlace()
      
      // Convert to an Xfo
      const planeXfo = new Xfo()
      planeXfo.fromMat4( planeMat4 )

      // Now create some geometry and display at this location. this would debug that everything is in the same coordinate space
      const standardMaterial = new Material('surfaces', 'SimpleSurfaceShader')
      const planeGeomItem = new GeomItem(item.getName() + 'ZanchorPlane', new Rect(1, 1), standardMaterial)
      planeGeomItem.getParameter('LocalXfo').setValue( planeXfo )
      cadAsset.addChild(planeGeomItem) 
      
      // const planeGeomItem = new GridTreeItem(0.5, 2)
      // planeGeomItem.getParameter('LocalXfo').setValue( planeXfo )
      // cadAsset.addChild(planeGeomItem) 
      
      const invXfo = planeXfo.inverse()
      
      ///////////////////////////////-------------------------------------
      // Calculate an error for this point.
      const pointGeomItem = creatPoints('survPt', 2.75, 13.1, 2.3)
      ///////----------------------
      
      const pointPos = pointGeomItem.getParameter('GlobalXfo').getValue().tr
      const deviation = invXfo.transformVec3(pointPos) 
      
      const threshold = .0254*.25

      let exceedsThreshold = false
      deviation.asArray().forEach((val) => (exceedsThreshold |= Math.abs(val) > threshold))

  
      console.log(deviation.toString())
      
      ///////////////////////////////
      // Display the devaiation as a line
      const errorline = new Lines()
//       errorline.setNumVertices(4)
//       errorline.setNumSegments(3)
//       errorline.setSegmentVertexIndices(0, 0, 1)
//       errorline.setSegmentVertexIndices(1, 1, 2)
//       errorline.setSegmentVertexIndices(2, 2, 3)

  
//       const positions = errorline.getVertexAttribute('positions')
//       positions.getValueRef(0).setFromOther(new Vec3(0, 0, 0))
//       positions.getValueRef(1).setFromOther(new Vec3(deviation.x, 0, 0))
//       positions.getValueRef(2).setFromOther(new Vec3(deviation.x, deviation.y, 0))
//       positions.getValueRef(3).setFromOther(new Vec3(deviation.x, deviation.y, deviation.z))

      
      errorline.setNumVertices(2)
      errorline.setNumSegments(1)
      errorline.setSegmentVertexIndices(0, 0, 1)
      // errorline.setSegmentVertexIndices(1, 1, 2)
      // errorline.setSegmentVertexIndices(2, 2, 3)

  
      const positions = errorline.getVertexAttribute('positions')
      positions.getValueRef(0).setFromOther(new Vec3(0, 0, 0))
      positions.getValueRef(1).setFromOther(new Vec3(deviation.x, 0, 0))
      // positions.getValueRef(2).setFromOther(new Vec3(deviation.x, deviation.y, 0))
      // positions.getValueRef(3).setFromOther(new Vec3(deviation.x, deviation.y, deviation.z))
      
      

      const errorLinesMaterial = new Material('myMat', 'LinesShader')
      errorLinesMaterial.getParameter('BaseColor').setValue(new Color(1, 0, 0))
      const errorlineItem = new GeomItem('ErrorLine', errorline, errorLinesMaterial)

      // errorlineItem.getParameter('GlobalXfo').setValue(planeXfo)
      planeGeomItem.addChild(errorlineItem, false);
      
      
      ////////////////////////////////
      // Display the deviation Label.

      const labelOffset = new Vec3(0.0, 0.0, 0)

      // Note: negate the x value to convert to a left handed
      // coordinate system.
      const disp = deviation
      
      
      const color = new Color(1, 2, 0);
      const precision = 5
      const valsStrings = []
      disp.asArray().forEach((val) => valsStrings.push(val.toFixed(precision)))
      // const text = `X: ${valsStrings[0]}\nY: ${valsStrings[1]}\nZ: ${valsStrings[2]}`
      const text = `move: ${Math.floor(valsStrings[0]/.0254)}`
      const fontcolor = new Color(1, 0, 0);
      const outlineColor = new Color(1, 1, 1);

      const labelImage = new Label('test survey' + 'Error')
      labelImage.getParameter('Text').setValue(text)
      labelImage.getParameter('FontSize').setValue(24)
      // labelImage.getParameter('FontColor').setValue(labelFontColor)
      labelImage.getParameter('FontColor').setValue(fontcolor)
      labelImage.getParameter('BackgroundColor').setValue(color)
      labelImage.getParameter('OutlineColor').setValue(outlineColor)
      labelImage.getParameter('BorderWidth').setValue(3)
      labelImage.getParameter('Margin').setValue(6)

      const billboard = new BillboardItem('ErrorBillboard', labelImage)
      billboard.getParameter('LocalXfo').setValue(new Xfo(deviation))
      billboard.getParameter('PixelsPerMeter').setValue(700)
      billboard.getParameter('AlignedToCamera').setValue(true)
      billboard.getParameter('DrawOnTop').setValue(true)
      billboard.getParameter('Alpha').setValue(1.0)

      errorlineItem.addChild(billboard, false)
  
      const xfo = billboard.getParameter('GlobalXfo').getValue()
      xfo.tr.z += 0.1
      // billboard.getParameter('GlobalXfo').setValue(xfo)
      billboard.getParameter('GlobalXfo').setFromOther(new Vec3(deviation.x, 0, 0))
  

    } catch (e) {
      console.log(e)
    }
  }
  
  cadAsset.traverse((item) => {
    if (item.hasParameter("OriginPlane")) {
      generateAnchorPlane(item)
    }
  })
  /*
  const ZanchorPlane = JSON.parse(cadAsset.getChildByName("MB-PA2-09").getParameter("OriginPlane").getValue());
  
  var typedArr = new Float32Array(ZanchorPlane);
  
  const planeMat4 = new Mat4(typedArr)
  console.log(planeMat4)
  
  
  //creatPoints('test3', 0, .25, 3)
  // console.log(plane.__data[3])//, plane[7], plane[11])
  // console.log(plane)//, plane[7], plane[11])
  // console.log("Pane ", planeMat4['m03'], planeMat4['m13'], planeMat4['m23'])
  console.log("Pane ", planeMat4['m03'])
  // const point1 = new Vec3(1,2,1)
  // console.log(point1)
  
  creatPoints('anchPt',  (planeMat4['m13']), (planeMat4['m03']), (planeMat4['m23']))
  creatPoints('survPt', 3, 13.5, 2.5)
  //could i return these points?
  // creatPoints('survPt', plane['m03'], plane['m13'], plane['m23']) GlobalXfo
  
  const surveyPoint = assetPoints.getChildByName('point-survPt').getParameter('GlobalXfo').getValue().tr
  const anchPoint = assetPoints.getChildByName('point-anchPt').getParameter('GlobalXfo').getValue().tr
  
  // console.log(surveyPoint)
  
  // projPoint(plane,"anchPt","survPt")
  
  
  ////////////////////////////////
  
  // Display the error as a line.
  // Note: there is scaling in the CADAsset hierarchy
  // as part of the units conversion from inches to meters.
  // markerXfo.sc.set(1, 1, 1)
  
  //----projection
  const deviation = planeMat4.inverse().transformVec3(surveyPoint)
  console.log(deviation - anchPoint)
  // const pointInPlaneSpace = plane.transformVec3(surveyPoint)
  
  // Convert to an Xfo
  const planeXfo = new Xfo()
  planeXfo.fromMat4( planeMat4 )

  // Now create some geometry and display at this location. this would debug that everything is in the same coordinate space
  const standardMaterial = new Material('surfaces', 'SimpleSurfaceShader')
  const planeGeomItem = new GeomItem('ZanchorPlane', new Plane(1, 1), standardMaterial)
  planeGeomItem.getParameter('LocalXfo').setValue( planeXfo )
  // cadAsset.addChild( planeGeomItem) 
  scene.getRoot().addChild(planeGeomItem)
  
  
  // console.log(assetPoints.getChildByName('point-survPt'))
  // console.log(plane)
  //point1
  const errorLinesMaterial = new Material('myMat', 'SimpleSurfaceShader')
  // const pixelsPerMeter = this.config.getParameter('Label Size').getValue()
  const pixelsPerMeter = 300
  
  
  
  const markerXfo = assetPoints.getChildByName('point-anchPt').getParameter('GlobalXfo').getValue().clone()
  
  const errorline = new Lines()
  errorline.setNumVertices(4)
  errorline.setNumSegments(3)
  errorline.setSegmentVertexIndices(0, 0, 1)
  errorline.setSegmentVertexIndices(1, 1, 2)
  errorline.setSegmentVertexIndices(2, 2, 3)

  
  const positions = errorline.getVertexAttribute('positions')
  positions.getValueRef(0).setFromOther(new Vec3(0, 0, 0))
  // positions.getValueRef(0).setFromOther(new Vec3(anchPoint))
  positions.getValueRef(1).setFromOther(new Vec3(deviation.x, 0, 0))
  positions.getValueRef(2).setFromOther(new Vec3(deviation.x, deviation.y, 0))
  positions.getValueRef(3).setFromOther(new Vec3(deviation.x, deviation.y, deviation.z))
  

  const errorlineItem = new GeomItem('ErrorLine', errorline, errorLinesMaterial)
  
  markerXfo.fromMat4(planeMat4)
  
  
  // console.log(markerXfo)
  // console.log(errorlineItem.getParameter('GlobalXfo'))
  errorlineItem.getParameter('GlobalXfo').setValue(markerXfo)
  errorlineItem.setOverlay(true)
  
  
  
  // scene.getRoot().addChild(errorlineItem, true);
  
  
  // billboards.getChildByName('billboard').addChild(billboard, false)
  // scene.getRoot().addChild(billboard)
  */
  
  renderer.frameAll();  
})

