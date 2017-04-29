var output = document.getElementById('output'),
  progress = document.getElementById('progress');
  idButton = document.getElementById('idButton')

var browserID = 1

var appWidth = screen.width;
var appHeight = screen.height;
var elem = document.getElementById('draw-shapes');
var params = { width:appWidth, height:appHeight };
var two = new Two(params).appendTo(elem);
var localCursors
var remoteCursors
var hasPeer = false;
var peer
var dataConnectionObj
var frameNum =0
var backGroup
var lastShape

var userPathData = [
  [{lastVector:null,
  lastPath:null },
  {lastVector:null,
  lastPath:null }],
  [{lastVector:null,
  lastPath:null },
  {lastVector:null,
  lastPath:null }]
]


var userColors=[]

restartRenderer()
generateUserColors()
setupCursors()

function restartRenderer(){
  two.clear()
  backGroup = two.makeGroup()
  frontGroup = two.makeGroup()
}

function changeBrowserID(){
  browserID = browserID == 0 ? 1 : 0
  idButton.innerHTML = "Browser ID: " + browserID
}

function makePeer(){
  var localID = "ajunction" + browserID,key
  peer = new Peer(localID, {key: 'abblrhx3zryynwmi'});
  console.log("making local peer with id:" + localID)

  peer.on('connection', function(conn) {
    console.log("connectedAsSlave!")
    dataConnectionObj = conn
    hasPeer = true
    conn.on('data', function(data){
      parseRemoteInput(data)
    });
  });
}

function setupPeerConnection() {
  makePeer()

  var remoteID = 'ajunction' + (browserID == 0 ? 1 : 0)
  console.log("connecting to peer with remote id:"+remoteID)
  dataConnectionObj = peer.connect(remoteID,{reliable:false,serialization:"json"})
  dataConnectionObj.on('open',function(){console.log("connectedAsMaster!")})
  dataConnectionObj.on('data', function(data){
    parseRemoteInput(data)
  });
  hasPeer = true
}


// Set up the controller:
Leap.loop({background: true}, {

  frame: function(frame){

    frameNum ++
    localInput = getLocalInput(frame)
    if (hasPeer){
      if(frameNum % 1 ==0){
        dataConnectionObj.send(localInput)
      }
    }
    updateState(localInput,localCursors,0)
    two.update()

}
});

function getLocalInput (frame){
  var input = []
  var cursorInput

  var iBox = frame.interactionBox;

  for (var i =0; i<2; i++) {
    hand = frame.hands[i]
    if (hand) {
      var pointable = hand.pointables[0];
      if (pointable) {
        //var leapPoint = pointable.stabilizedTipPosition;
        var leapPoint = hand.stabilizedPalmPosition
        var normalizedPoint = iBox.normalizePoint(leapPoint, true);

        var appX = normalizedPoint[0] //* appWidth;
        var appY = (1 - normalizedPoint[1])// * appHeight;

        cursorInput = new CIO(appX,appY,false)

        if(hand.pinchStrength ==0) {
          restartRenderer()
          setupCursors()
        }
        if(hand.pinchStrength >= 0.5) {
          cursorInput.Cc = true
        }
        else {
          cursorInput.Cc = false
        }

        input[i]=(cursorInput)
      }
  }
  else {
    localCursors[i].translation.set(-100,-100)
    }
  }
  return input
}

function CIO(Xpos,Ypos, cursorClosed) {
  this.Xp = Math.round(Xpos * 10000) / 10000
  this.Yp = Math.round(Ypos * 10000) / 10000
  this.Cc = cursorClosed
}

function parseRemoteInput(input){
  updateState(input,remoteCursors,1)
}

function updateState(input,cursors,user) {
  for (var i =0; i<2; i++) {
    if(input[i]){
      if(input[i].Cc) {
        cursors[i].fill = "FFFFFF"
      }
      else {
        cursors[i].fill= userColors[user]
      }
      manageDrawPaths(input[i].Xp*appWidth, input[i].Yp*appHeight,input[i].Cc,user,i)
      cursors[i].translation.set(input[i].Xp*appWidth,input[i].Yp*appHeight)

    }
  }
}

function setupCursorColors(localC,remoteC){
  for (var i = 0; i<2; i++){
    localC[i].stroke= userColors[0]
    localC[i].linewidth=6;
  }
  for (var i = 0; i<2; i++){
    remoteC[i].stroke=userColors[1]
    remoteC[i].linewidth=6
  }
}

function manageDrawPaths(x,y,isLive,user,cursor) {
  var vector = new Two.Vector(x,y)
  vector.position = new Two.Vector().copy(vector);
  pathData = userPathData[user][cursor]

  if(isLive) {
    if(pathData.lastPath){
      var intersects = checkSelfIntersection(pathData.lastPath.vertices,vector)
      if (!intersects){
        pathData.lastPath.vertices.push(vector)
      }
      else {
        backGroup.remove(pathData.lastPath)
        pathData.lastPath = null
        pathData.lastVector = null
      }
    }
    else if (pathData.lastVector){
      pathData.lastPath = two.makePath([vector,pathData.lastVector],false)
      backGroup.add(pathData.lastPath)

      _.each(pathData.lastPath.vertices, function(v) {
                v.addSelf(pathData.lastPath.translation);
              });
      pathData.lastPath.translation.clear();
      pathData.lastPath.stroke = randomColor();
      pathData.lastPath.fill=randomColor()
      pathData.lastPath.linewidth = 5;
    }
    pathData.lastVector = vector
  }
  else if(pathData.lastPath){
    //path finished
    var simplifiedVertices = simplify(pathData.lastPath.vertices,40,true)
    var curved = simplifiedVertices.length > 5 ? true : false
    var newShape = new Two.Path(simplifiedVertices,true,curved)

    var center = calculateCenter(simplifiedVertices)

    newShape.center()
    newShape.scale = 0.9
    newShape.translation.set(center.x,center.y)
    newShape.opacity = 0.8

    newShape.stroke = pathData.lastPath.stroke
    newShape.fill = pathData.lastPath.fill
    newShape.lineWidth = pathData.lastPath.lineWidth

    backGroup.add(newShape)
    backGroup.remove(pathData.lastPath)
    pathData.lastPath = null
    lastShape = newShape

  }
  else {
    pathData.lastVector = null
  }
}

function generateUserColors(){
  for (i = 0; i<2; i++) {
    userColors[i]=randomColor()
  }
}

function setupCursors() {
  cursorRadius = 10
  localCursors = [
    two.makeCircle(0, 0, cursorRadius),
    two.makeCircle(0, 0, cursorRadius),
  ]
  remoteCursors = [
    two.makeCircle(0, 0, cursorRadius),
    two.makeCircle(0, 0, cursorRadius),
  ]
  for(var i =0;i<4;i++){
    frontGroup.add(localCursors.concat(remoteCursors)[i])
  }
  setupCursorColors(localCursors,remoteCursors)
}

function calculateCenter(verts){
  centerX = 0;
  centerY=0;
  for (var i = 0; i<verts.length;i++){
    centerX+=verts[i].x;
    centerY+=verts[i].y
  }
  centerX/=verts.length;
  centerY/=verts.length
  return new Two.Vector(centerX,centerY)
}

function checkSelfIntersection(vectors,vector) {
  var intersects = false
  for (var i =0; i<vectors.length-1;i++) {
    p1 = vectors[i]
    p2 = vectors[i+1]
    p3 = vectors.slice(-1)[0]
    p4 = vector

    intersects = intersects || linesIntersect(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y,p4.x,p4.y)
  }
  return intersects

}

function linesIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}
