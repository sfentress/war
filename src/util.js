ExtMath = {}

ExtMath.TWO_PI  = Math.PI * 2;

ExtMath.normalizeRads = function (t) {
  return t - ExtMath.TWO_PI * Math.floor((t + Math.PI) / ExtMath.TWO_PI);
}

ExtMath.getDirectionAndDistance = function (from, to) {
  var dx = to.x - from.x,
      dy = to.y - from.y;

  return {
    direction: ExtMath.normalizeRads(Math.atan2(dy, dx)),
    distanceSq: (dx * dx) + (dy * dy)
  }
}

ExtMath.getDistance = function (from, to) {
  var dx = to.x - from.x,
      dy = to.y - from.y;

  return (dx * dx) + (dy * dy);
}

// line: {x0, y0, x1, y1}
// ellipse: {cx, cy, rx, ry}
ExtMath.checkCollision = function (line, ellipse) {
  scale = ellipse.ry / ellipse.rx;
  // Translate everything so that line segment start point to (0, 0)
  a = (line.x1*scale)-(line.x0*scale);    // Line segment end point horizontal coordinate
  b = line.y1-line.y0;    // Line segment end point vertical coordinate
  c = (ellipse.cx*scale)-(line.x0*scale); // Circle center horizontal coordinate
  d = ellipse.cy-line.y0; // Circle center vertical coordinate

  // scale so the ellipse is a circle
  r = ellipse.ry;

  // Optional orientation computation
  circleSideIsRight = false;
  if (d*a - c*b < 0) {
    // Circle center is on right side looking from (x0, y0) to (x1, y1)
    circleSideIsRight = true;
  }

  // Collision computation
  // startInside = false;
  // endInside = false;
  // middleInside = false;
  if ((d*a - c*b)*(d*a - c*b) <= r*r*(a*a + b*b)) {
    // Collision is possible
    if (c*c + d*d <= r*r) {
      // Line segment start point is inside the circle
      // startInside = true;
      return true;
    }
    if ((a-c)*(a-c) + (b-d)*(b-d) <= r*r) {
      // Line segment end point is inside the circle
      // endInside = true;
      return true;
    }
    if (c*a + d*b >= 0 && c*a + d*b <= a*a + b*b) {
      // Middle section only
      // middleInside = true;
      return true;
    }
  }

  // return startInside || endInside || middleInside;
  return false;
}

// Dijkstra
// Note, this may not be perfect
ExtMath.getPath = function(start, end) {
  nodes = data.waypoints.slice();
  // fastpath if they can see each other
  if (!checkCollision(start, end)) {
    return [end];
  }

  // ugly: expect every point to have x and y
  if (start.loc) {
    start.x = start.loc.x;
    start.y = start.loc.y;
  }

  if (!end.i) {
    nodes.unshift(end);
  }
  for (i in nodes) {
    nodes[i].distance = Infinity;
  }
  start.distance = 0;

  var frontier = [start];

  while (current = frontier.shift()) {
    if (current.x == end.x && current.y == end.y) {
      continue;
    }

    nextNodes = ExtMath.getVisibleNodes(current, nodes);
    for (i in nextNodes) {
      next = nextNodes[i];
      distance = current.distance + Math.sqrt(ExtMath.getDistance(current, next));
      if (distance < next.distance) {
        next.distance = distance;
        next.previous = current;
        ExtMath.remove(frontier, next);
        ExtMath.insertWithPriority(frontier, next, "distance");
      }
    }
  }

  var waypoints = [];
  var next = end;
  while (next) {
    waypoints.unshift(next);
    next = next.previous;
  }
  waypoints.splice(0,1);
  return waypoints;
}

ExtMath.insertWithPriority = function(arr, item, key) {
  var insert = false;
  for (i in arr) {
    if (arr[i][key] > item[key]) {
      insert = true;
      break;
    }
  }
  if (insert) {
    arr.splice(i, 0, item);
  } else {
    arr.push(item);
  }
}

ExtMath.remove= function(arr, item) {
  for (i in arr) {
    if (arr[i].x == item.x && arr[i].y == item.y) {
      arr.splice(i, 1);
    }
  }
}

ExtMath.getVisibleNodes = function(from, nodes) {
  var vis = [];
  for (i in nodes) {
    if (!checkCollision(from, nodes[i])) {
      vis.push(nodes[i]);
    }
  }
  return vis;
}
