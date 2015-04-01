var pieceFactory = {
  'GeneralView': function(props) {
    return <GeneralView {...props}></GeneralView>;
  },
  'RegimentView': function(props) {
    return <RegimentView {...props}></RegimentView>;
  },
  'RunnerView': function(props) {
    return <RunnerView {...props}></RunnerView>;
  }
};

var terrainFactory = {
  'Mountain': function(props) {
    return <ellipse rx={props.width} ry={props.height}></ellipse>;
  }
};

var GameView = React.createClass({
  handleChange: function(event) {
    data.useFlags = event.target.value == "flags";
  },
  onClick: function(evt) {
    state.send("clickedTerrain", evt.nativeEvent);
  },
  render: function() {
    var pieces = this.props.pieces.map(
      function(piece) {
        return (
          <Entity2d loc={ piece.loc } direction={ piece.direction }>
            { pieceFactory[piece.view](piece) }
          </Entity2d>
        );
      }
    );
    var terrain = this.props.terrain.map(
      function(terr) {
        return (
          <Entity2d loc={ terr.loc }>
            { terrainFactory[terr.type](terr) }
          </Entity2d>
        );
      }
    );
    var flags = null;
    if (this.props.flagsBeingSent) {
      sender   = data.pieces[this.props.flagsBeingSent[0]];
      receiver = data.pieces[this.props.flagsBeingSent[1]];
      color = "gray";

      flags = <line x1={sender.loc.x} y1={sender.loc.y}
          x2={receiver.loc.x} y2={receiver.loc.y}
          stroke={color}
          strokeWidth="2"></line>
    }
    var waypoints = this.props.waypoints.map(
      function(pt) {
        return (
          <Entity2d loc={ pt }>
            <circle r="2" fill="red"></circle>
          </Entity2d>
        );
      }
    );
    var regimentWaypoints = this.props.pieces.map(
      function(piece) {
        piece._waypoints = piece.waypoints.slice();
        if (piece.moveToTarget) piece._waypoints.unshift(piece.moveToTarget);
        if (!piece.size || !piece._waypoints.length) return null;
        polylinePts = piece.loc.x + "," + piece.loc.y;
        piece._waypoints.map(
          function(pt) {
            polylinePts = pt.x + "," + pt.y + " " + polylinePts;
          }
        );
        dot = <Entity2d loc={ piece._waypoints[piece._waypoints.length-1] }>
                <circle r="3" fill="red" opacity="0.5"></circle>
              </Entity2d>
        line = <polyline fill="none" stroke="gray" opacity="0.5"
              points={ polylinePts } strokeDasharray="12,12"></polyline>

        return (
          <g>
            { dot }
            { line }
          </g>
        );
      }
    );
    var comValue = data.useFlags ? "flags" : "runners";
    return (
      <div>
        <svg height={this.props.height} width={this.props.width} onClick={this.onClick}>
          <defs>
          </defs>
          { regimentWaypoints }
          { terrain }
          { pieces }
          { flags }
        </svg>
        <div>
          Send messages using:
          <RadioGroup name="com" value={comValue} onChange={this.handleChange}>
            <input type="radio" value="flags" />Flags
            <input type="radio" value="runners" />Runners
          </RadioGroup>
        </div>
      </div>
    );
  }
});

var Entity2d = React.createClass({
  render: function() {
    var coordinate = Math.floor(this.props.loc.x) + ' ' + Math.floor(this.props.loc.y),
        direction  = this.props.direction ? this.props.direction * 180/Math.PI + 90 : 0;
    return (
      <g transform={ 'translate(' + coordinate + ') rotate(' + direction + ')' }>
        { this.props.children }
      </g>
    );
  }
});

var GeneralView = React.createClass({
  onClick: function(evt) {
    if (this.props.color == "blue") {
      state.send("clickedGeneral");
    } else {
      state.send("clickedRelay");
    }
    evt.stopPropagation();
  },
  render: function() {
    var selection = null;
    var size;
    if (this.props.color == "blue") {
      size = 7;
    } else {
      size = 5;
    }
    if (this.props.selected) {
      selection = <circle r={ size + 5} fill="none" strokeDasharray="5,5" stroke={this.props.color} onClick={this.onClick}></circle>
    }
    return (
      <g>
        { selection }
        <circle r={ size } fill={this.props.color} onClick={this.onClick}></circle>
      </g>
    );
  }
});

var RunnerView = React.createClass({
  onClick: function(evt) {
    state.send("clickedRunner");
    evt.stopPropagation();
  },
  render: function() {
    return (
      <g>
        <circle r="4" fill={this.props.color} onClick={this.onClick}></circle>
      </g>
    );
  }
});

var RegimentView = React.createClass({
  onClick: function(evt) {
    state.send("clickedRegiment", this.props.number);
    evt.stopPropagation();
  },
  render: function() {
    var length = Math.sqrt(this.props.size);
    var selection = null;
    if (this.props.selected) {
      selection = <rect x={(-length/2)-5} y={(-length/2)-5} height={(length*0.8)+10} width={length+10} fill="none" strokeDasharray="5,5" stroke={this.props.color}></rect>
    }
    return (
      <g>
        { selection }
        <rect x={-length/2} y={-length/2} height={length*0.8} width={length} fill={this.props.color}  onClick={this.onClick}></rect>
        <line x1="0" y1="0" x2="0" y2={-length*0.7} stroke={this.props.color}></line>
        <line x1={-length/2} y1="0" x2="0" y2={-length*0.7} stroke={this.props.color}></line>
        <line x1={length/2} y1="0" x2="0" y2={-length*0.7} stroke={this.props.color}></line>
      </g>
    );
  }
});
