var State,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

var clearSelection = function() {
  for (i in data.pieces) {
    data.pieces[i].setSelected(false);
  }
}

var checkCollision = function(sender, receiver){
  if (!sender.loc) {
    sender.loc = {x: sender.x, y: sender.y};
  }
  if (!receiver.loc) {
    receiver.loc = {x: receiver.x, y: receiver.y};
  }
  mountain = data.terrain[0];
  mountain2 = data.terrain[1];
  if (ExtMath.checkCollision(
        {
          x0: sender.loc.x,
          y0: sender.loc.y,
          x1: receiver.loc.x,
          y1: receiver.loc.y
        },
        {
          cx: mountain.loc.x,
          cy: mountain.loc.y,
          rx: mountain.width,
          ry: mountain.height
        }
        )) {
    return true;
  }

  var selectedRegiment = 0;

  return ExtMath.checkCollision(
        {
          x0: sender.loc.x,
          y0: sender.loc.y,
          x1: receiver.loc.x,
          y1: receiver.loc.y
        },
        {
          cx: mountain2.loc.x,
          cy: mountain2.loc.y,
          rx: mountain2.width,
          ry: mountain2.height
        }
        );
}

State = (function(superClass) {
  extend(State, superClass);

  function State() {
    this.general = data.pieces[0];
    this.relay = data.pieces[1];
  }

  State.prototype._states = {
    start: {
      enter: function() {
        clearSelection();
      },
      clickedGeneral: function() {
        this.setState("generalSelected");
      },
      clickedRelay: function() {
        this.setState("relaySelected");
      },
      clickedRegiment: function(i) {
        selectedRegiment = i;
        this.setState("regimentSelected");
      },
      clickedTerrain: function() {

      }
    },
    generalSelected: {
      enter: function() {
        clearSelection();
        data.pieces[0].setSelected(true);
      },
      clickedGeneral: function() {
        this.setState("start");
      },
      clickedRelay: function() {
        this.setState("relaySelected");
      },
      clickedRegiment: function(i) {
        selectedRegiment = i;
        this.setState("regimentSelected");
      },
      clickedTerrain: function(evt) {
        this.general.moveTo({x: evt.offsetX, y: evt.offsetY});
        this.setState("start");
      }
    },
    relaySelected: {
      enter: function() {
        clearSelection();
        data.pieces[1].setSelected(true);
        if (!data.useFlags) {
          setTimeout(function() {
            state.setState("start");
          }, 200);
        }
      },
      clickedGeneral: function() {
        this.setState("generalSelected");
      },
      clickedRelay: function() {
        this.setState("start");
      },
      clickedRegiment: function(i) {
        selectedRegiment = i;
        this.setState("regimentSelected");
      },
      clickedTerrain: function(evt) {
        if (checkCollision(this.general, this.relay)) {
          this.setState("start");
          setTimeout(function() {
            state.setState("relaySelected");
            setTimeout(function() {
              state.setState("start");
              setTimeout(function() {
                state.setState("relaySelected");
                setTimeout(function() {
                  state.setState("start");
                }, 200);
              }, 200);
            }, 200);
          }, 200);
          return;
        }
        data.flagsBeingSent = [0, 1];
        this.setState("sendingMessage");
        this.send("sendMessage", function() {
          data.pieces[1].moveTo({x: evt.offsetX, y: evt.offsetY});
          state.setState("start");
        });
      }
    },
    regimentSelected: {
      enter: function() {
        clearSelection();
        data.pieces[2+selectedRegiment].setSelected(true);
      },
      clickedGeneral: function() {
        this.setState("generalSelected");
      },
      clickedRelay: function() {
        this.setState("relaySelected");
      },
      clickedRegiment: function(i) {
        if (i == selectedRegiment) {
          this.setState("start");
        } else {
          selectedRegiment = i;
          this.send("enter")
        }
      },
      clickedTerrain: function(evt) {
        if (data.useFlags) {
          if (checkCollision(this.general, data.pieces[2+selectedRegiment])) {
            if (!(checkCollision(this.general, this.relay)) && !(checkCollision(this.relay, data.pieces[2+selectedRegiment]))) {
              data.flagsBeingSent = [0, 1];
              this.setState("sendingMessage");
              this.send("sendMessage", function() {
                data.flagsBeingSent = [1, 2+selectedRegiment];
                var reg = data.pieces[2+selectedRegiment];
                state.send("sendMessage", function() {
                  reg.moveTo({x: evt.offsetX, y: evt.offsetY});
                  state.setState("start");
                });
              });
            } else {
              this.setState("start");
              setTimeout(function() {
                state.setState("regimentSelected");
                setTimeout(function() {
                  state.setState("start");
                  setTimeout(function() {
                    state.setState("regimentSelected");
                    setTimeout(function() {
                      state.setState("start");
                    }, 200);
                  }, 200);
                }, 200);
              }, 200);
            }
            return;
          }

          data.flagsBeingSent = [0, 2+selectedRegiment];
          this.setState("sendingMessage");
          var reg = data.pieces[2+selectedRegiment];
          this.send("sendMessage", function() {
            reg.moveTo({x: evt.offsetX, y: evt.offsetY});
            state.setState("start");
          });
        } else {
          var i = 5;
          while (i < 8 && !data.pieces[i].withGeneral) {
            i++;
          }
          if (i == 8) {
            this.setState("generalSelected");
            setTimeout(function() {
              state.setState("regimentSelected");
              setTimeout(function() {
                state.setState("generalSelected");
                setTimeout(function() {
                  state.setState("regimentSelected");
                  setTimeout(function() {
                    state.setState("start");
                  }, 200);
                }, 200);
              }, 200);
            }, 200);
            return;
          }
          reg = data.pieces[2+selectedRegiment];
          data.pieces[i].sendMessageTo(reg, function() {
            reg.moveTo({x: evt.offsetX, y: evt.offsetY});
            state.setState("start");
          });
          state.setState("start");
        }
      }
    },
    sendingMessage: {
      message: null,
      sendMessage: function(func) {
        this.message = func;
        setTimeout(function() {
          state.send("completeMessageTransfer");
        }, 800);
      },
      completeMessageTransfer: function() {
        data.flagsBeingSent = null;
        this.message();
      }
    }
  };

  return State;

})(StateMachine);
