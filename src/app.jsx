var data = {
  height: 500,
  width: 700,
  pieces: [],
  terrain: [],
  waypoints: [],
  useFlags: true,
  flagsBeingSent: null
}

var general   = new General({x: 300, y: 400}, "blue"),
    relay     = new General({x: 400, y: 250}, "thistle"),
    regiment1 = new Regiment({x: 170, y: 330}, 2000, "lightblue", 0),
    regiment2 = new Regiment({x: 300, y: 330}, 2000, "lightblue", 1),
    regiment3 = new Regiment({x: 430, y: 330}, 2000, "lightblue", 2),
    runner1   = new Runner({x: 314, y: 400}, "thistle", 1.5, 14, 0),
    runner2   = new Runner({x: 324, y: 400}, "thistle", 1.6, 24, 1),
    runner3   = new Runner({x: 334, y: 400}, "thistle", 1.7, 34, 2);

data.pieces.push(general);
data.pieces.push(relay);
data.pieces.push(regiment1);
data.pieces.push(regiment2);
data.pieces.push(regiment3);
data.pieces.push(runner1);
data.pieces.push(runner2);
data.pieces.push(runner3);


data.terrain.push({type: "Mountain", loc: {x: 200, y: 200}, width: 120, height: 40});
data.terrain.push({type: "Mountain", loc: {x: 500, y: 300}, width: 30, height: 140});

data.waypoints = [
  {i: 0, x: 70, y: 140},
  {i: 1, x: 100, y: 150},
  {i: 2, x: 50, y: 200},
  {i: 3, x: 100, y: 250},
  {i: 4, x: 70, y: 260},

  {i: 5, x: 330, y: 141},
  {i: 6, x: 300, y: 151},
  {i: 7, x: 350, y: 201},
  {i: 8, x: 300, y: 251},
  {i: 9, x: 330, y: 261},

  {i: 10, x: 470, y: 140},
  {i: 11, x: 530, y: 141},

  {i: 12, x: 470, y: 460},
  {i: 13, x: 530, y: 461}
];

state = new State();
state.setState("start");

step = function() {
  for (i in data.pieces) {
    data.pieces[i].step();
  }
}

paint = function() {
  requestAnimationFrame(paint);
  step();
  React.render(
    <GameView {...data}></GameView>,
    document.body
  );
}
paint();

