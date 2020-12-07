
const {
  Color,
  TreeItem,
  Sphere,
  Vec3,
  Xfo,
  GeomItem,
  Material,
} = window.zeaEngine

class SurveyPoints extends TreeItem {
  constructor(name) {
    super(name)
  }

  load(url) {
    fetch(url).then((response) => {
      response.text().then((text) => {
        this.parseSurveyData(text)
      })
    })
  }

  parseSurveyData(text) {
    const sphere = new Sphere(.15)
    const material = new Material('myMat', 'SimpleSurfaceShader')
    material.getParameter('BaseColor').setValue(new Color(1, 1, 1))

    const getUnitsConversionFactor = (pointsUnits) => {
      switch (pointsUnits) {
        case 'Feet': {
          return 0.3048
        }
        case 'Meters': {
          return 1
        }
        case 'Inches': {
          return 0.0254
        }
      }
    }
    const getCoordSysConversionXfo = (srcCoordSys) => {
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

    const scaleFactor = getUnitsConversionFactor('Feet')
    const xfo = new Xfo()
    xfo.sc.set(scaleFactor, scaleFactor, scaleFactor)
    this.getParameter('LocalXfo').setValue(xfo)

    const coordSysConversion = getCoordSysConversionXfo('LHS')

    const createPoint = (index, pos) => {
      const geomItem = new GeomItem('point-' + index)
      geomItem.getParameter('Geometry').setValue(sphere)
      geomItem.getParameter('Material').setValue(material)
      const xfo = new Xfo()
      xfo.tr = pos
      geomItem.getParameter('GlobalXfo').setValue(xfo)

      this.addChild(geomItem, false)
    }

    const lines = text.split('\n')
    lines.forEach((line, index) => {
      const parts = line.split(',')
      const pos = new Vec3(
        Number.parseFloat(parts[1]),
        Number.parseFloat(parts[2]),
        Number.parseFloat(parts[3])
      )
      createPoint(parts[4], coordSysConversion.transformVec3(pos))
    })

    this.emit('loaded')
  }
}

export default SurveyPoints
