const { Color, GLRenderer, Scene } = window.zeaEngine;

export const getRamdomUser = async () => {
  console.log("bar");
  const res = await window.superagent.get("https://randomuser.me/api");

  const randomUser = res.body.results[0];

  const userId = randomUser.login.uuid;

  const userData = {
    color: Color.random().toHex(),
    family_name: randomUser.name.first,
    given_name: randomUser.name.last,
    id: userId,
    picture: `https://avatars.dicebear.com/api/human/${userId}.svg?mood[]=happy`
  };

  return userData;
};

export const getAppData = canvas => {
  const renderer = new GLRenderer(canvas);
  const scene = new Scene();

  scene.setupGrid(10, 10);
  renderer.setScene(scene);

  // // ///alternate change color
  // scene
  //   .getSettings()
  //   .getParameter("BackgroundColor")
  //   .setValue(new Color("#33B3FF"));

  const appData = {
    scene,
    renderer
  };

  return appData;
};
