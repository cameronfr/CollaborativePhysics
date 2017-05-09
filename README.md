# Collaborative Physics 
## About
A browser-based physics playground which is shared between two users, controlled by the Leap Motion (keyboard and mouse fallback is also supported). Users are connected peer2peer through WebRTC, with no intermediate server. The idea is that the ease of a browser app, the interactivity of the Leap Motion, and the social nature of a shared space combine to create an ideal environment for exploring physics. 

Built at the [Tokyo 2017 Junction Hackathon](http://tokyo.hackjunction.com/) in April using [Collab.js](https://github.com/DenisVuyka/collab.js), 
[Matter.js](http://brm.io/matter-js/), and [Two.js](https://two.js.org/).


## Examples

![balls rolling down ramp](/media/ballramp.png)
*balls rolling down ramp*

![lever tipping due to too much weight](/media/leverarm.png)
*lever tipping due to too much weight*

![contraption](/media/contraption.png)
*fun contraption*


Obviously with further utilization of the physics engine many more physics principles could be explored!

## Modes
Currently there are three modes. 
- Mode 0 allows for the user to draw static polygons. The user draws the outline of a shape, and from this outline, the environment produces a polygon of similar shape. This polygon is static and is not affected by gravity. 
- Mode 1 allows for the user to create dynamic circles. These circles are affected by gravity and friction and are especially useful in exploring situations such as a ball rolling down a ramp.  
- Mode 2 allows user users can create dynamic polygons. Similar to mode 0, the user draws each vertex, from which a polygon is 
produced. These polygons are affected by gravity and friction. Such objects are useful in 
explore the dynamics of blocks sliding down ramps and other scenarios. 

## Mouse and Keyboard Controls  

### Keyboard 
| Button | Function | 
| --- | --- | 
| c | Clear session space |
| spacebar | Switch mode |

### Mouse Click Control 
| Mode | Click function |
| --- | --- | 
| 0 | Create shape | 
| 1 | Create circle | 
| 2 | Create shape | 

### 

## Leap Motion Controls 
### Universal Controls 
| Gesture | Function | 
| --- | --- | 
| Palm up and fist closed, hold | Clear session | 
| Palm up | Switch mode | 

### Mode 0 

| Gesture | Function | 
| --- | --- | 
|Pinch and draw |Create shape |

### Mode 1 

| Gesture | Function | 
| --- | --- | 
|Tap |Create circle | 

### Mode 2 

| Gesture | Function | 
| --- | --- | 
|Pinch and draw |Create shape | 

