function StateMachine() {}

StateMachine.prototype._states = null;


/*
  Add a named state with a set of event handlers.

  e.g.
    addState "addingAgents",
      enter: ->
        console.log "We are now in 'Adding Agents' mode!"
      click: (evt) ->
        addAgentAt evt.x, evt.y
      rightClick: (evt) ->
        removeAgent evt.x, evt.y
 */

StateMachine.prototype.addState = function(name, state) {
  if (this._states == null) {
    this._states = [];
  }
  return this._states[name] = state;
};

StateMachine.prototype.setState = function(currentState) {
  if (this._states[currentState] == null) {
    throw new Error("No such state: " + currentState);
  }
  this.currentState = currentState;
  if (this._states[this.currentState].enter != null) {
    return this._states[this.currentState].enter.apply(this);
  }
};

StateMachine.prototype.send = function(evtName, evt) {
  if (this.currentState == null) {
    throw new Error("No current state exists to handle '" + evtName + "'");
  }
  if (this._states[this.currentState][evtName] != null) {
    return this._states[this.currentState][evtName].apply(this, [evt]);
  } else if (evtName === "touchstart" && (this._states[this.currentState]['click'] != null)) {
    evt.preventDefault();
    return this._states[this.currentState]['click'].apply(this, [evt]);
  }
};
