const {
  Color,
  GeomItem,
  Material,
  Sphere,
  Vec3,
  Xfo,
  TreeItem
} = window.zeaEngine

class SurveryPointsAsset extends TreeItem {
  constructor(name, dbSessionName) {
    super(name)

    this.dbSessionName = dbSessionName
  }

  async readOrCreateDbSession() {
    try {
      const existing = await readDbSession(this.dbSessionName)
      return existing
    } catch (err) {
      if (err.name === 'NotFound') {
        const created = await createDbSession(this.dbSessionName)
        return created
      }

      throw err
    }
  }
}

export { SurveryPointsAsset }

const q = window.faunadb.query

const dbClient = new window.faunadb.Client({
  secret: 'fnAD4m_KttACBMVgzvN_u_gw6O9w1FmtjG9pONFC'
})

export const randomString = (length = 8) =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, length)

export const randomUser = async () => {
  const res = await window.superagent.get('https://randomuser.me/api')
  const randomUser = res.body.results[0]
  const userId = randomUser.login.uuid
  return {
    color: Color.random().toHex(),
    family_name: randomUser.name.first,
    given_name: randomUser.name.last,
    id: userId,
    picture: `https://avatars.dicebear.com/api/human/${userId}.svg?mood[]=happy`
  }
}

const readDbSession = async name => {
  const dbSession = await dbClient.query(
    q.Get(q.Match(q.Index('sessions_by_name'), name))
  )
  return dbSession
}

const createDbSession = async name => {
  const dbSession = await dbClient.query(
    q.Create('sessions', {
      data: { name }
    })
  )
  return dbSession
}

export const createDbPoint = async (point, dbSession) => {
  dbClient.query(
    q.Create('points', {
      data: { string: point, session: dbSession.ref }
    })
  )
}

export const readDbPoint = async ref => {
  const point = await dbClient.query(q.Get(ref))
  return point
}

export const readPointsBySession = async dbSession => {
  const points = await dbClient.query(
    q.Paginate(q.Match(q.Index('points_by_session'), dbSession.ref))
  )
  return points.data
}

const sphere = new Sphere(0.05)

const material = new Material('myMat', 'SimpleSurfaceShader')
material.getParameter('BaseColor').setValue(new Color(1, 0, 0))

function getCoordScaleFactor() {
  let scaleFactor = 1.0
  switch (0) {
    case 0: //'Inches':
      scaleFactor = 0.0254
      break
    case 1: //'Feet':
      scaleFactor = 0.3048
      break
    case 2: //'Meters':
      scaleFactor = 1.0
      break
  }
  return scaleFactor
}

function getCoordSpaceXfo() {
  let scaleFactor = getCoordScaleFactor()

  const coordSpaceXfo = new Xfo()
  switch (0) {
    case 0: //'RHS':
      coordSpaceXfo.sc.set(scaleFactor, scaleFactor, scaleFactor)
      break
    case 1: //'LHS':
      coordSpaceXfo.ori.setFromAxisAndAngle(new Vec3(0, 0, 1), Math.PI * 0.5)
      coordSpaceXfo.sc.set(scaleFactor, -scaleFactor, scaleFactor)
      break
  }
  return coordSpaceXfo
}

export const drawPoint = async (point, treeItem) => {
  console.info(point, "point info")

  const parts = point.split(',')

  const pointName = parts[0]
  const coordSysXfo = getCoordSpaceXfo()

  const pointId = `${pointName}-${Date.now()}`

  const pos = coordSysXfo.transformVec3(
    new Vec3(
      Number.parseFloat(parts[1]),
      Number.parseFloat(parts[2]),
      Number.parseFloat(parts[3])
    )
  )

  const geomItem = new GeomItem(`point-${pointId}`)
  geomItem.getParameter('Geometry').setValue(sphere)
  geomItem.getParameter('Material').setValue(material)
  const xfo = new Xfo()
  xfo.tr = pos
  geomItem.getParameter('GlobalXfo').setValue(xfo)

  treeItem.addChild(geomItem)
}
