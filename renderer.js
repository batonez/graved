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

function drawArrow(ctx, fromx, fromy, tox, toy)
{
  //variables to be used when creating the arrow
  var headlen = 10;
  ctx.lineWidth = 2;

  var angle = Math.atan2(toy-fromy,tox-fromx);

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
}

function drawRect(ctx, rect, drawRectId = null, translation = {x: 0, y: 0})
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
}

function drawRectName(ctx, rect, translation = {x: 0, y: 0})
{
  ctx.fillStyle = "#FF0000";
  ctx.strokeStyle = "#F00";
  ctx.font = "10pt serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(rect.text, rect.x + translation.x, rect.y - rect.height/2 + translation.y);
}

function lineIntersectionBy4Points(
  line1point1x, line1point1y, line1point2x, line1point2y,
  line2point1x, line2point1y, line2point2x, line2point2y)
{
  var epsilon = 0.0001;
  var resultX, resultY;
  // y=kx+b:
  // y = ((y2-y1)/(x2-x1))*x + (x2*y1 - x1*y2)/(x2-x1)

  var k1 = (line1point2y - line1point1y)/(line1point2x - line1point1x);
  var k2 = (line2point2y - line2point1y)/(line2point2x - line2point1x);
  var b1 = (line1point2x*line1point1y - line1point1x*line1point2y)/(line1point2x - line1point1x);
  var b2 = (line2point2x*line2point1y - line2point1x*line2point2y)/(line2point2x - line2point1x);

  if (Math.abs(line1point1x - line1point2x) < epsilon) {
    //console.log("Line 1 is vertical");
    if (Math.abs(line2point1x - line2point2x) < epsilon) {
      //console.log("Line 2 is vertical");
      return null;
    }

    resultX = line1point1x;
    resultY = k2 * resultX + b2;
    return {x: resultX, y: resultY};
  } else if (Math.abs(line2point1x - line2point2x) < epsilon) {
    resultX = line2point1x;
    resultY = k1 * resultX + b1;
    return {x: resultX, y: resultY};
  }

  if (Math.abs(k1 - k2) < epsilon) {
    return null; // lines are parallel
  }

  // k1*x + b1 = k2 * x + b2
  resultX = (b2 - b1)/(k1 - k2);
  resultY = k1 * resultX + b1;

  return {x: resultX, y: resultY};
}

function segmentIntersectionBy4Points(
  seg1point1x, seg1point1y, seg1point2x, seg1point2y,
  seg2point1x, seg2point1y, seg2point2x, seg2point2y)
{
  //console.log("Rect segment from: " + seg1point1x, seg1point1y);
  //console.log("Rect segment to: " + seg1point2x, seg1point2y);

  var lineIntersection = lineIntersectionBy4Points(
    seg1point1x, seg1point1y, seg1point2x, seg1point2y,
    seg2point1x, seg2point1y, seg2point2x, seg2point2y);

  if (lineIntersection == null)
  {
    //console.log("Lines are parallel");
    return null;
  }

  //console.log("Found line intersection: " + lineIntersection.x + "; " + lineIntersection.y);

  if (lineIntersection.x < Math.min(seg1point1x, seg1point2x))
    return null;

  if (lineIntersection.x < Math.min(seg2point1x, seg2point2x))
    return null;

  if (lineIntersection.x > Math.max(seg1point1x, seg1point2x))
    return null;

  if (lineIntersection.x > Math.max(seg2point1x, seg2point2x))
    return null;


  if (lineIntersection.y < Math.min(seg1point1y, seg1point2y))
    return null;

  if (lineIntersection.y < Math.min(seg2point1y, seg2point2y))
    return null;

  if (lineIntersection.y > Math.max(seg1point1y, seg1point2y))
    return null;

  if (lineIntersection.y > Math.max(seg2point1y, seg2point2y))
    return null;

  //console.log("... And it's inside segments");
  return lineIntersection;
}

function drawWeightCircleBetweenRects(ctx, first_rect, second_rect, weight, translation = {x: 0, y: 0})
{
  var arrowCenterX = Math.abs(first_rect.x - second_rect.x) / 2 + Math.min(first_rect.x, second_rect.x);
  var arrowCenterY = Math.abs(first_rect.y - second_rect.y) / 2 + Math.min(first_rect.y, second_rect.y);
  
  ctx.fillStyle = "#EEEEEE";
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
}

function drawArrowBetweenRects(ctx, first_rect, second_rect, weight = 0, draw_weights, translation = {x: 0, y: 0})
{
  if (first_rect["selected"] != null && first_rect["selected"] != 0) {
    ctx.fillStyle   = "#229955";
    ctx.strokeStyle   = "#229955";
  } else {
    ctx.fillStyle   = "#66391A";
    ctx.strokeStyle = "#66391A";
  }
  
  var firstPoint, secondPoint, thirdPoint, fourthPoint;

  //console.log("Arrow line from: " + first_rect.x + "; " + first_rect.y);
  //console.log("Arrow line to  : " + second_rect.x + "; " + second_rect.y);

  //console.log("Right rect side");

  firstPoint = segmentIntersectionBy4Points(
    second_rect.x + second_rect.width/2, second_rect.y + second_rect.height/2,
    second_rect.x + second_rect.width/2, second_rect.y - second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (firstPoint != null) {
    drawArrow(ctx, first_rect.x + translation.x, first_rect.y + translation.y, firstPoint.x + translation.x, firstPoint.y + translation.y);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(ctx, first_rect, second_rect, weight, translation);
    }
    
    return;
  }

  //console.log("Top rect side");

  secondPoint = segmentIntersectionBy4Points(
    second_rect.x + second_rect.width/2, second_rect.y - second_rect.height/2,
    second_rect.x - second_rect.width/2, second_rect.y - second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (secondPoint != null) {
    drawArrow(ctx, first_rect.x + translation.x, first_rect.y + translation.y, secondPoint.x + translation.x, secondPoint.y + translation.y);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(ctx, first_rect, second_rect, weight, translation);
    }
    
    return;
  }

  //console.log("Left rect side");

  thirdPoint = segmentIntersectionBy4Points(
    second_rect.x - second_rect.width/2, second_rect.y - second_rect.height/2,
    second_rect.x - second_rect.width/2, second_rect.y + second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (thirdPoint != null) {
    drawArrow(ctx, first_rect.x + translation.x, first_rect.y + translation.y, thirdPoint.x + translation.x, thirdPoint.y + translation.y);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(ctx, first_rect, second_rect, weight, translation);
    }
    
    return;
  }

  //console.log("Bottom rect side");

  fourthPoint = segmentIntersectionBy4Points(
    second_rect.x - second_rect.width/2, second_rect.y + second_rect.height/2,
    second_rect.x + second_rect.width/2, second_rect.y + second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (fourthPoint != null) {
    drawArrow(ctx, first_rect.x + translation.x, first_rect.y + translation.y, fourthPoint.x + translation.x, fourthPoint.y + translation.y);
    
    if (draw_weights) {
      drawWeightCircleBetweenRects(ctx, first_rect, second_rect, weight, translation);
    }
    
    return;
  }

  drawArrow(ctx, first_rect.x + translation.x, first_rect.y + translation.y, second_rect.x + translation.x, second_rect.y + translation.y);
  
  if (draw_weights) {
    drawWeightCircleBetweenRects(ctx, first_rect, second_rect, weight, translation);
  }
}

function isPointInsideRect(rect, x, y, translation = {x: 0, y: 0})
{
  return (x <= rect.x + translation.x + rect.width  / 2) &&
    (x >= rect.x + translation.x - rect.width  / 2) &&
    (y <= rect.y + translation.y + rect.height / 2) &&
    (y >= rect.y + translation.y - rect.height / 2);
}

