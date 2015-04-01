function General (loc, color) {
  this.view = "GeneralView";
  this.loc = loc;
  this.speed = 1.8;
  this.direction = 0;
  this.color = color;
  this.selected = false;
}

General.prototype = {
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


function Runner (loc, color, speed, place) {
  this.view = "RunnerView";
  this.loc = loc;
  this.speed = speed;
  this.direction = 0;
  this.color = color;
  this.selected = false;
  this.place = place;
  this.moveToTarget = null;
  this.target = null;
}

Runner.prototype = {

  waypoints: [],

  withGeneral: true,

  deliveredMessage: false,

  sendMessageTo: function(target, message) {
    this.withGeneral = false;
    this.target = target;
    this.deliveredMessage = false;
    this.message = message;
  },

  move: function() {
    var target = this.moveToTarget,
        dd = ExtMath.getDirectionAndDistance(this.loc, target),
        speed = Math.min(this.speed, Math.sqrt(dd.distanceSq));

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
    if (this.target) {
      target = {x: this.target.loc.x, y: this.target.loc.y};
    } else {
      target = {x: general.loc.x + this.place, y: general.loc.y};
    }
    if (target) {
      this.waypoints = ExtMath.getPath(this, target);
      this.moveToTarget = this.waypoints.shift();
      if (this.moveToTarget) {
        this.move();
      }
    }
    if (target && target.x == this.loc.x && target.y == this.loc.y) {
      if (this.target) {
        if (!this.deliveredMessage) {
          console.log("will deliver!")
          this.deliveredMessage = true;
          (function(self) {
            setTimeout(function() {
              console.log("delivering!")
              self.target = null;
              self.message();
            }, 800);
          })(this);
        }
      } else {
        this.withGeneral = true;
      }
    }
  }
}
