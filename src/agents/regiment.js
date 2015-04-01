function Regiment (loc, size, color, number) {
  this.view = "RegimentView";
  this.loc = loc;
  this.size = size;
  this.speed = 0.8;
  this.direction = 0;
  this.color = color;
  this.selected = false;
  this.number = number;
}

Regiment.prototype = {
  moveToTarget: null,

  waypoints: [],

  moveTo: function(target) {
    this.waypoints = ExtMath.getPath(this, target);
    this.moveToTarget = this.waypoints.shift();
  },

  move: function() {
    var dd = ExtMath.getDirectionAndDistance(this.loc, this.moveToTarget),
        speed = Math.min(this.speed, Math.sqrt(dd.distanceSq));

    if (dd.distanceSq == 0) {
      if (this.waypoints.length) {
        this.moveToTarget = this.waypoints.shift();
        this.move();
      } else {
        this.moveToTarget = null;
        return;
      }
    }

    this.direction = dd.direction;

    var dx = speed * Math.cos(this.direction),
        dy = speed * Math.sin(this.direction);
    this.loc = {
      x: this.loc.x += dx,
      y: this.loc.y += dy
    }
  },

  setSelected: function(selected) {
    this.selected = selected;
  },

  step: function() {
    if (this.moveToTarget) {
      this.move();
    }
  }
}
