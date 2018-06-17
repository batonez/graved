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

function getLineByTwoPoints(p1, p2)
{
  // Line equations:
  // y=kx+b:
  // y = ((y2-y1)/(x2-x1))*x + (x2*y1 - x1*y2)/(x2-x1)

  if (Math.abs(p1.x - p2.x) < 0.001) {
    // line is vertical
    return {k: Infinity, b: p1.x};
  } else {
    var k = (p2.y - p1.y) / (p2.x - p1.x);
    var b = (p2.x * p1.y - p1.x * p2.y) / (p2.x - p1.x);

    return {k: k, b: b};
  }
}

function intersectLines(line1, line2)
{
  var epsilon = 0.0001;
  var resultX, resultY;

  if (line1.k == Infinity && line2.k == Infinity)
    // both lines are vertical
    return null;

  var verticalLine = false, otherLine = false;
  if (line1.k == Infinity) {
    verticalLine = line1;
    otherLine = line2;
  } else if (line2.k == Infinity) {
    verticalLine = line2;
    otherLine = line1;
  }

  if (verticalLine) {
    resultX = verticalLine.b;
    resultY = otherLine.k * resultX + otherLine.b;
    return {x: resultX, y: resultY};
  }

  if (Math.abs(line1.k - line2.k) < epsilon) {
    // lines are parallel
    return null;
  }

  // k1*x + b1 = k2 * x + b2
  resultX = (line2.b - line1.b)/(line1.k - line2.k);
  resultY = line1.k * resultX + line1.b;

  return {x: resultX, y: resultY};
}


function segmentIntersection(a1, a2, b1, b2)
{
  var line1 = getLineByTwoPoints(a1, a2);
  var line2 = getLineByTwoPoints(b1, b2);
  var lineIntersection = intersectLines(line1, line2);

  if (lineIntersection == null)
    return null;

  if (lineIntersection.x < Math.min(a1.x, a2.x))
    return null;
  if (lineIntersection.x < Math.min(b1.x, b2.x))
    return null;
  if (lineIntersection.x > Math.max(a1.x, a2.x))
    return null;
  if (lineIntersection.x > Math.max(b1.x, b2.x))
    return null;
  if (lineIntersection.y < Math.min(a1.y, a2.y))
    return null;
  if (lineIntersection.y < Math.min(b1.y, b2.y))
    return null;
  if (lineIntersection.y > Math.max(a1.y, a2.y))
    return null;
  if (lineIntersection.y > Math.max(b1.y, b2.y))
    return null;

  return lineIntersection;
}

function isPointInsideRect(rect, x, y, translation = {x: 0, y: 0})
{
  return (x <= rect.x + translation.x + rect.width  / 2) &&
    (x >= rect.x + translation.x - rect.width  / 2) &&
    (y <= rect.y + translation.y + rect.height / 2) &&
    (y >= rect.y + translation.y - rect.height / 2);
}

