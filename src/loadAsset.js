const { Xfo, EulerAngles } = window.zeaEngine
const { CADAsset } = window.zeaCad

const loadAsset = () => {
  const asset = new CADAsset()
  const xfo = new Xfo()
  xfo.sc.set(2);
  xfo.ori.setFromEulerAngles(new EulerAngles(0.0, Math.PI * -0.5, 0, 'ZXY'))

  asset.getParameter('GlobalXfo').setValue(xfo)
  asset.getParameter('FilePath').setValue('https://cdn.glitch.com/906b3445-bcb6-4c12-8beb-932722a077d2%2Faxon-ft.zcad?v=1606241006558')

  return asset
}

export default loadAsset