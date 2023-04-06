const canvas = document.getElementById('visualization')
const ctx = canvas.getContext('2d')
const output = document.getElementById('output')

const leftColor = '#89B3F5'
const rightColor = '#F58F82'
const overlayColor = 'rgba(255, 255, 255, 0.5)'

let overlayRect = {
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  handleSize: 10,
}

const proportionSlider = document.getElementById('proportionSlider')
proportionSlider.addEventListener('input', onSliderChange)

let proportion = 0.5

function onSliderChange(e) {
  proportion = parseFloat(e.target.value)
  draw()
}





canvas.addEventListener('mousedown', onMouseDown)
canvas.addEventListener('mousemove', onMouseMove)
canvas.addEventListener('mouseup', onMouseUp)

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBackground()
  drawOverlay()
  drawHandles()
  calculateMetrics()
}

function isInResizeHandle(x, y) {
    const handleX = overlayRect.x + overlayRect.width - overlayRect.handleSize / 2
    const handleY = overlayRect.y + overlayRect.height - overlayRect.handleSize / 2
    const isthere =  (x >= handleX && x <= handleX + overlayRect.handleSize && y >= handleY && y <= handleY + overlayRect.handleSize)
    console.log('is resizing isthere='+isthere)
    return isthere
  }
  

function drawBackground() {
  ctx.fillStyle = leftColor
  ctx.fillRect(0, 0, canvas.width * proportion, canvas.height)
  
  
  

  ctx.fillStyle = rightColor
  ctx.fillRect(canvas.width * proportion, 0, canvas.width * (1-proportion), canvas.height)
  ctx.strokeStyle = 'black'
  ctx.strokeRect(0, 0, canvas.width * proportion, canvas.height)
  ctx.strokeRect(canvas.width * proportion, 0, canvas.width * (1-proportion), canvas.height)

  ctx.textAlign = "center"
  ctx.font = "18px serif"
  ctx.fillStyle = "black"
  ctx.fillText("FN",canvas.width *proportion/2,30)
  ctx.fillText("TN",canvas.width-canvas.width *(1-proportion)/2,30)

}


function drawOverlay() {
  ctx.fillStyle = overlayColor
  ctx.fillRect(overlayRect.x, overlayRect.y, overlayRect.width, overlayRect.height)
  ctx.strokeStyle = 'black'
  ctx.setLineDash([5,5])
  ctx.strokeRect(overlayRect.x, overlayRect.y, overlayRect.width, overlayRect.height)
  ctx.setLineDash([])
}

function drawHandles() {
    ctx.fillStyle = '#aaad'
    ctx.fillRect(overlayRect.x + overlayRect.width - overlayRect.handleSize / 2, overlayRect.y + overlayRect.height - overlayRect.handleSize / 2, overlayRect.handleSize, overlayRect.handleSize)
    ctx.strokeStyle = "#0"
    ctx.strokeRect(overlayRect.x + overlayRect.width - overlayRect.handleSize / 2, overlayRect.y + overlayRect.height - overlayRect.handleSize / 2, overlayRect.handleSize, overlayRect.handleSize)
  }

  function calculateMetrics() {
    const leftWidth = canvas.width * proportion
    const rightWidth = canvas.width * (1 - proportion)

    const tpLen = Math.max(0, Math.min(leftWidth, overlayRect.x + overlayRect.width) - overlayRect.x)
    const fpLen = overlayRect.width-tpLen

    const tp = tpLen * overlayRect.height
    const fp = fpLen * overlayRect.height
    const fn = leftWidth * canvas.height - tp
    const tn = rightWidth * canvas.height - fp

    console.log(`${proportion} x:${overlayRect.x} left:${leftWidth} tp:${tp} fp:${fp} fn:${fn} tn:${tn}`)
  
    const precision = tp / (tp + fp)
    const recall = tp / (tp + fn)
    const f1 = 2 * (precision * recall) / (precision + recall)
    const mccNumerator = (tp * tn) - (fp * fn)
    const mccDenominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))
    const mcc = mccDenominator !== 0 ? mccNumerator / mccDenominator : 0
  
    output.innerHTML = `Precision: ${precision.toFixed(2)}<br>Recall: ${recall.toFixed(2)}<br>F1 Score: ${f1.toFixed(2)}<br>MCC: ${mcc.toFixed(2)}`
  }
  
  

let isMouseDown = false
let isResizing = false
let offsetX, offsetY
let resizedX, resizedY, resizeLastX, resizeLastY

function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
  
    if (isInResizeHandle(x, y)) {
        resizeLastX = x
        resizeLastY = y
        isResizing = true
        isMouseDown = true
    } else if (x >= overlayRect.x && x <= overlayRect.x + overlayRect.width && y >= overlayRect.y && y <= overlayRect.y + overlayRect.height) {
        isMouseDown = true
        offsetX = x - overlayRect.x
        offsetY = y - overlayRect.y
    }
  }
  

  function onMouseMove(e) {
    if (isMouseDown) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
  
      if (isResizing) {
        overlayRect.width += x-resizeLastX
        overlayRect.height += y-resizeLastY
        resizeLastX = x
        resizeLastY = y
        console.log(offsetX)
      } else {
        overlayRect.x = Math.min(Math.max(0,x - offsetX),canvas.width-overlayRect.width)
        overlayRect.y = Math.min(Math.max(0,y - offsetY),canvas.height-overlayRect.height)
      }
  
      draw()
    }
  }
  

function onMouseUp() {
  isResizing = false
  isMouseDown = false
}

draw()
