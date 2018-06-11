/*

Copyright 2018 Anton Jebrak

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

var showWeights = true;

function setCanvasResizeCheckTimer(canvas_element)
{
  setInterval(function() {
    // multiply canvas.height and canvas.width by window.devicePixelRatio if you want HDPI display support
    if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight)
    {
      canvas.width = canvas.clientWidth/* * window.devicePixelRatio*/;
      canvas.height = canvas.clientHeight/* * window.devicePixelRatio*/;
      redraw();
    }
  }, 300);
}

function redraw()
{
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "#EEEEEE";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (var i in rects) {
    var parents = rects[i].parents;

    for (var pKey in parents)
      drawArrowBetweenRects(ctx, rects[i], rects[pKey], rects[i]["parents"][pKey], showWeights, translation);

    drawRect(ctx, rects[i], i, translation);
    prev = i;
  }

  for (var i in rects) {
    drawRectName(ctx, rects[i], translation);
  }
}

function makeCounter()
{
  var keys = Object.keys(rects);
  if (keys.length <= 0)
    keys.push(0);

  var i = Math.max.apply(Math, keys);
  return function() { return ++i; }
}

function getMousePositionOnCanvas(canvas, mouseEvent)
{
  var canvasBounds = canvas.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - canvasBounds.left,
    y: mouseEvent.clientY - canvasBounds.top
  };
}

function getRectIndexAtCoord(x, y)
{
  for (var i in rects) {
    if (isPointInsideRect(rects[i], x, y, translation)) {
      return i;
    }
  }

  return null;
}

function showMessage(text)
{
  document.getElementById("message").innerHTML = text;
}

function selectParentsRecursively(rect, deselect=false)
{
  for (var i in rect["parents"]) {
    rects[i]["selected"] = deselect ? 0 : 2;
    selectParentsRecursively(rects[i], deselect);
  }
}

function autoCorrectSliderWeights(changedSlider)
{
  //  console.log("=================================")
  //  console.log("THIS SLIDER NEW VALUE IS: " + changedSlider.value);
  
  var sliders = document.getElementsByClassName("weight-slider");
  var totalValue = 0;
  var sliderValues = {};
  var corrections = {};
  
  for (var j = 0; j < sliders.length; ++j) {
    totalValue += parseFloat(sliders[j].value);
    
    if (sliders[j] != changedSlider) {
      sliderValues[sliders[j].getAttribute("id")] = parseFloat(sliders[j].value);
    }
  }
   
  var sortedSliderKeys = Object.keys(sliderValues).sort(function(a, b) {return (totalValue > 1 ? 1 : -1) * (sliderValues[a] - sliderValues[b])});
  var totalCorrection = (1 - totalValue);
  var correction = totalCorrection / (sliders.length - 1);
  //  console.log("TOTAL VALUE: " + totalValue);
  //  console.log("TOTAL CORRECTION: " + totalCorrection);
  //  console.log("CORRECTION PER SLIDER: " + correction);

  for (var k = 0; k < sortedSliderKeys.length; ++k) {
    var newValue = sliderValues[sortedSliderKeys[k]] + correction;
    if (newValue < 0.001) {
      correction += (newValue - 0.001) / (sortedSliderKeys.length - (k + 1));
      newValue = 0.001;
      //  console.log("CORRECTION PER SLIDER IS NOW: " + correction);
    } else if (newValue > 0.999) {
      correction += (newValue - 0.999) / (sortedSliderKeys.length - (k + 1));
      newValue = 0.999;
      //  console.log("CORRECTION PER SLIDER IS NOW: " + correction);
    }
    
    sliderValues[sortedSliderKeys[k]] = newValue;
  }
  
  for (var j = 0; j < sliders.length; ++j) {
    if (sliders[j] != changedSlider) {
      sliders[j].value = sliderValues[sliders[j].getAttribute("id")];
      sliders[j].setAttribute("oldvalue", sliders[j].value);
    }
  }

  changedSlider.setAttribute("oldvalue", changedSlider.value);
}

function selectRect(rectIndex)
{
  selectedRectIndex = rectIndex;
  rects[selectedRectIndex]["selected"] = 1;
  selectParentsRecursively(rects[selectedRectIndex]);
  document.getElementById("constrain-weights").checked = false;

  document.getElementById("selected-node-name").value = rects[selectedRectIndex].text;
  var childrenKeys = [];
  
  for (var i in rects) {
    if (rects[i]["parents"].hasOwnProperty(selectedRectIndex)) {
      childrenKeys.push(i);
    }
  }
  
  for (var i = 0; i < childrenKeys.length; ++i) {
    var child = rects[childrenKeys[i]];

    var sliderRow = document.createElement("div");
    var slider = document.createElement("input");

    sliderRow.innerHTML = (child.text != "" ? child.text : childrenKeys[i]) + ": ";

    slider.setAttribute("type", "range");
    slider.setAttribute("min", "0");
    slider.setAttribute("max", "1");
    slider.setAttribute("step", "0.001");
    slider.setAttribute("id", "weight_of_" + childrenKeys[i]);
    slider.setAttribute("class", "weight-slider");
    slider.value = child["parents"][selectedRectIndex] == "" ? 0
      : child["parents"][selectedRectIndex];
    slider.setAttribute("oldvalue", slider.value);

    slider.onchange = function() {
      if (document.getElementById("constrain-weights").checked)
        autoCorrectSliderWeights(this);
    }

    sliderRow.appendChild(slider);
    document.getElementById("weight-sliders").appendChild(sliderRow);
  }

  document.getElementById("selected-node").style.display = "block";
  redraw();
}

function deselectRect(do_redraw=false)
{
  if (selectedRectIndex === null)
    return;

  rects[selectedRectIndex]["selected"] = 0;
  selectParentsRecursively(rects[selectedRectIndex], true);
  selectedRectIndex = null;
  document.getElementById("selected-node-name").innerHTML = "";
  document.getElementById("weight-sliders").innerHTML = "";
  document.getElementById("selected-node").style.display = "none";

  if (do_redraw) {
    redraw();
  }
}

function cancel()
{
  showMessage("");
  selectLinkParentKey = null;
  action = Action.DRAG;
  document.getElementById("link-weight").style.display = "none";
  document.getElementById("node-name").style.display = "none";
  document.getElementById("node-name-input").value = "";
  document.getElementById("cancel").style.display = "none";

  deselectRect();
  redraw();
}

////////////////////////////////////////////////////////////////////////////////

var canvas = document.getElementById("main-canvas");
setCanvasResizeCheckTimer(canvas);

var rects = {};
var Action = {
  DRAG: 0,
  CREATE_NODE: 1,
  CREATE_LINK: 3,
  DELETE_LINK: 4
};

var action = Action.DRAG;
var getNextKey  = makeCounter();
var draggedRect = null;
var dragCorrectionX = null;
var dragCorrectionY = null;
var selectLinkParentKey = null;
var translating = false;
var translation = {x: 0, y: 0};
var prevMouseX = null;
var prevMouseY = null;
var willSelectNodeOnMouseUp = false;
var selectedRectIndex = null;

redraw();

canvas.onmousedown = function(e) {
  var mouse = getMousePositionOnCanvas(canvas, e);
  if (e.button == 2) {
    translating = true;
    prevMouseX = mouse.x;
    prevMouseY = mouse.y;
    return;
  }

  var clickedRectKey = getRectIndexAtCoord(mouse.x, mouse.y);
  var clickedRect = rects[clickedRectKey];

  if (action == Action.CREATE_NODE) {
    if (clickedRect) {
      return;
    }

    rects[getNextKey()] = {
      "x": mouse.x - translation.x,
      "y": mouse.y - translation.y,
      "width": 50,
      "height": 50,
      "text": document.getElementById("node-name-input").value,
      "value": 0,
      "parents": {},
      "has_children":0
    };

    cancel();
    redraw();
  } else if (action == Action.CREATE_LINK || action == Action.DELETE_LINK) {
    if (selectLinkParentKey === null) {
      selectLinkParentKey = clickedRectKey;
    }
  } else if (action == Action.DRAG) {
    if (clickedRect !== null) {
      willSelectNodeOnMouseUp = true;
      draggedRect = clickedRect;
      dragCorrectionX = mouse.x - draggedRect.x;
      dragCorrectionY = mouse.y - draggedRect.y;
    }
  }
};

canvas.onmouseup = function(e) {
  translating = false;
  prevMouseX = null;
  prevMouseY = null;
  draggedRect = null;
  dragCorrectionX = null;
  dragCorrectionY = null;
  var mouse = getMousePositionOnCanvas(canvas, e);
  var i = getRectIndexAtCoord(mouse.x, mouse.y);

  if (action == Action.CREATE_LINK) {
    if (selectLinkParentKey !== null && selectLinkParentKey != i) {
      if (!rects[i]["parents"].hasOwnProperty(selectLinkParentKey)) {
        rects[i]["parents"][selectLinkParentKey] = document.getElementById("link-weight-input").value;
        rects[selectLinkParentKey]["has_children"] = 1;
      }

      cancel();
      redraw();
    }
  } else if (action == Action.DELETE_LINK) {
    if (selectLinkParentKey !== null && selectLinkParentKey != i) {
      for (var parentKey in rects[i]["parents"])
      {
        if (parentKey == selectLinkParentKey) {
          delete rects[i]["parents"][parentKey];
          break;
        }
      }

      cancel();
      redraw();
    }
  } else if (willSelectNodeOnMouseUp) {
    if (selectedRectIndex !== null) {
      deselectRect();
    }

    selectRect(i);
    willSelectNodeOnMouseUp = false;
  }
};

canvas.onmousemove = function(e) {
  willSelectNodeOnMouseUp = false;

  if (draggedRect !== null) {
    var mouse = getMousePositionOnCanvas(canvas, e);

    draggedRect.x = mouse.x - dragCorrectionX;
    draggedRect.y = mouse.y - dragCorrectionY;

    redraw();
  } else if (translating) {
    var mouse = getMousePositionOnCanvas(canvas, e);

    translation.x += mouse.x - prevMouseX;
    translation.y += mouse.y - prevMouseY;

    prevMouseX = mouse.x;
    prevMouseY = mouse.y;

    redraw();
  }
};

document.getElementById("import").addEventListener('click', function() {
  var element = document.createElement('div');
  element.innerHTML = '<input type="file">';
  var fileInput = element.firstChild;

  fileInput.addEventListener('change', function() {
    var file = fileInput.files[0];

    if (file.name.match(/\.(txt|json)$/)) {
      var reader = new FileReader();

      reader.onload = function() {
        rects = JSON.parse(reader.result);
        redraw();
      };

      reader.readAsText(file);
    } else {
      alert("File not supported, .txt or .json files only");
    }
  });

  fileInput.click();
});

document.getElementById("export").onclick = function() {
  if (selectedRectIndex !== null) {
    deselectRect(true);
  }

  window.open().document.body.innerHTML += JSON.stringify(rects);
}

document.getElementById("place-rect").onclick = function() {
  cancel();
  action = Action.CREATE_NODE;
  document.getElementById("node-name").style.display = "block";
  document.getElementById("cancel").style.display = "block";
  showMessage("Type in a text label for the new node then click on the canvas to place it.");
}

document.getElementById("delete-rect").onclick = function() {
  if (selectedRectIndex === null)
    return;

  var i = selectedRectIndex;
  deselectRect();

  for (var j in rects) {
    for (var parentKey in rects[j]["parents"]) {
      if (parentKey == i) {
        delete rects[j]["parents"][parentKey];
      }
    }
  }

  delete rects[i];
  redraw();
}

document.getElementById("create-link").onclick = function() {
  cancel();
  action = Action.CREATE_LINK;
  showMessage("Enter edge weight, select a parent node, then select a child to create an edge");
  document.getElementById("link-weight").style.display = "block";
  document.getElementById("cancel").style.display = "block";
}

document.getElementById("delete-link").onclick = function() {
  cancel();
  action = Action.DELETE_LINK;
  showMessage("Select a parent node, then a child to delete an edge");
  document.getElementById("cancel").style.display = "block";
}

document.getElementById("show-weights").onchange = function() {
  showWeights = document.getElementById("show-weights").checked;
  redraw();
}

document.getElementById("save-node").onclick = function() {
  rects[selectedRectIndex].text = document.getElementById("selected-node-name").value;

  var sliders = document.getElementsByClassName("weight-slider");

  for (var i = 0; i < sliders.length; ++i) {
    var childId = sliders[i].getAttribute("id").replace("weight_of_", "");
    //console.log("CHILDID: " + sliders[i].getAttribute("id"));
    rects[childId]["parents"][selectedRectIndex] = sliders[i].value;
  }

  redraw();
}

document.getElementById("reset-node").onclick = function() {
  document.getElementById("selected-node-name").value = rects[selectedRectIndex].text;

  var sliders = document.getElementsByClassName("weight-slider");

  for (var i = 0; i < sliders.length; ++i) {
    var childId = sliders[i].getAttribute("id").replace("weight_of_", "");
    sliders[i].value = rects[childId]["parents"][selectedRectIndex];
  }
}

document.getElementById("cancel").onclick = function() {
  cancel();
}

