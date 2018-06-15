/*
Copyright 2018 Anton Jebrak

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var ctx = null;

function initGeometry(context)
{
  ctx = context;
  ctx.save();
}

function clear(color = "#FFFFFF")
{
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}


function wholeLine(p1, p2, thickness, color)
{
  ctx.fillStyle = color;
  ctx.lineWidth = thickness;
  ctx.beginPath();

  var line = getLineByTwoPoints(p1, p2);
  if (line.k == Infinity) {
    // line is vertical
    ctx.moveTo(p1.x, 0);
    ctx.lineTo(p1.x, ctx.canvas.height);
  } else {
    var prev = {x: -1, y: -1};

    for (var x = 0; x <= ctx.canvas.width; x = x + 9) {
      y = line.k * x + line.b;

      if (y < 0 || y > ctx.canvas.height)
        continue;

      if (prev.x >= 0 || prev.y >= 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(x, y);
      }

      prev.x = x;
      prev.y = y;
    }
  }

  ctx.stroke();
  ctx.restore();
}

function point(p, radius, color)
{
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

function drawLineWithPointsOnIt(p1, p2)
{
  wholeLine(p1, p2, 1, "#000000");
  point(p1, 4, "#FF0000");
  point(p2, 4, "#FF0000");
}

function drawArrow(fromx, fromy, tox, toy, color)
{
  //variables to be used when creating the arrow
  var headlen = 10;
  ctx.lineWidth = 2;
  var angle = Math.atan2(toy-fromy,tox-fromx);

  ctx.strokeStyle = ctx.fillStyle = color;
  
  //starting path of the arrow from the start square to the end square and drawing the stroke
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();

  //starting a new path from the head of the arrow to one of the sides of the point
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

  //path from the side point of the arrow, to the other side point
  ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

  //path from the side point back to the tip of the arrow, and then again to the opposite side point
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

  //draws the paths created above
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function drawRect(rect, drawRectId = null, translation = {x: 0, y: 0})
{
  if (rect["selected"] == 1) {
    ctx.fillStyle   = "#22FF55";
  } else if (rect["selected"] == 2) {
    ctx.fillStyle   = "#229955";
  } else {
    ctx.fillStyle   = "#66391A";
  }
  
  ctx.strokeStyle = "#66391A";

  ctx.fillRect(rect.x - rect.width / 2 + translation.x,
    rect.y - rect.height / 2 + translation.y,
    rect.width,
    rect.height
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000"
  ctx.font = "14pt Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(drawRectId == null ? rect.value : drawRectId, rect.x + translation.x, rect.y + translation.y);

  ctx.restore();
}

function drawRectName(rect, translation = {x: 0, y: 0})
{
  ctx.fillStyle = "#FF0000";
  ctx.strokeStyle = "#F00";
  ctx.font = "10pt serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(rect.text, rect.x + translation.x, rect.y - rect.height/2 + translation.y);
  ctx.restore();
}

function drawSegmentAABB(p1, p2)
{
  ctx.globalAlpha = 0.3;
  ctx.fillRect(
    Math.min(p1.x, p2.x),
    Math.min(p1.y, p2.y),
    Math.abs(p1.x - p2.x),
    Math.abs(p1.y - p2.y)
  );

  ctx.fill();
  ctx.restore();
}

function drawWeightCircleBetweenRects(first_rect, second_rect, weight, translation = {x: 0, y: 0}, color)
{
  var arrowCenterX = Math.abs(first_rect.x - second_rect.x) / 2 + Math.min(first_rect.x, second_rect.x);
  var arrowCenterY = Math.abs(first_rect.y - second_rect.y) / 2 + Math.min(first_rect.y, second_rect.y);
  
  ctx.fillStyle = "#EEEEEE";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(arrowCenterX + translation.x, arrowCenterY + translation.y, 20, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  
  ctx.fillStyle = "#444444";
  ctx.strokeStyle = "#000000"
  ctx.font = "10pt Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(Number.parseFloat(weight).toFixed(3).toString(), arrowCenterX + translation.x, arrowCenterY + translation.y);

  ctx.restore();
}

function drawArrowBetweenRects(first_rect, second_rect, weight = 0, draw_weights, translation = {x: 0, y: 0})
{
  var color = "#66391A";

  if (first_rect["selected"] != null && first_rect["selected"] != 0)
    color = "#229955";

  var firstPoint, secondPoint, thirdPoint, fourthPoint;

  //console.log("Right rect side");

  firstPoint = segmentIntersection(
    {x: second_rect.x + second_rect.width/2, y: second_rect.y + second_rect.height/2},
    {x: second_rect.x + second_rect.width/2, y: second_rect.y - second_rect.height/2},
    first_rect, second_rect);

  if (firstPoint != null) {
    drawArrow(first_rect.x + translation.x, first_rect.y + translation.y, firstPoint.x + translation.x, firstPoint.y + translation.y, color);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(first_rect, second_rect, weight, translation, color);
    }
    
    return;
  }

  //console.log("Top rect side");

  secondPoint = segmentIntersection(
    {x: second_rect.x + second_rect.width/2, y: second_rect.y - second_rect.height/2},
    {x: second_rect.x - second_rect.width/2, y: second_rect.y - second_rect.height/2},
    first_rect, second_rect);

  if (secondPoint != null) {
    drawArrow(first_rect.x + translation.x, first_rect.y + translation.y, secondPoint.x + translation.x, secondPoint.y + translation.y, color);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(first_rect, second_rect, weight, translation, color);
    }
    
    return;
  }

  //console.log("Left rect side");

  thirdPoint = segmentIntersection(
    {x: second_rect.x - second_rect.width/2, y: second_rect.y - second_rect.height/2},
    {x: second_rect.x - second_rect.width/2, y: second_rect.y + second_rect.height/2},
    first_rect, second_rect);

  if (thirdPoint != null) {
    drawArrow(first_rect.x + translation.x, first_rect.y + translation.y, thirdPoint.x + translation.x, thirdPoint.y + translation.y, color);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(first_rect, second_rect, weight, translation, color);
    }
    
    return;
  }

  //console.log("Bottom rect side");

  fourthPoint = segmentIntersection(
    {x: second_rect.x - second_rect.width/2, y: second_rect.y + second_rect.height/2},
    {x: second_rect.x + second_rect.width/2, y: second_rect.y + second_rect.height/2},
    first_rect, second_rect);

  if (fourthPoint != null) {
    drawArrow(first_rect.x + translation.x, first_rect.y + translation.y, fourthPoint.x + translation.x, fourthPoint.y + translation.y, color);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(first_rect, second_rect, weight, translation, color);
    }
    
    return;
  }

  drawArrow(first_rect.x + translation.x, first_rect.y + translation.y, second_rect.x + translation.x, second_rect.y + translation.y, color);
  
  if (draw_weights) {
    drawWeightCircleBetweenRects(first_rect, second_rect, weight, translation, color);
  }
}

