import { Pixel } from "./types"

export const normalize = (source: HTMLCanvasElement): Pixel[] => {
  // const canvas1 = drawPixels(pixels, width, height)
  const cropped = cropAndScale(source, 20, 20)
  const centered = centerMass(cropped, 28, 28)

  const outputContext = centered.getContext('2d')

  if(!outputContext) throw Error("Canvas context not found")

  const outputData = outputContext.getImageData(0, 0, centered.width, centered.height)
  const normalized = imgDataToPixels(outputData)

  cropped.remove()
  centered.remove()

  return normalized
}

/*const drawPixels = (pixels: Pixel[], width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if(!context) throw Error("Context not found")

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)

  pixels.forEach(({x, y, value}) => {
    const v = (1 - value) * 255
    context.fillStyle = `rgba(${v}, ${v}, ${v}, 1.0)`
    context.fillRect(x, y, 1, 1)
  })

  return canvas
}*/

const cropAndScale = (source: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement => {
  const sourceContext = source.getContext('2d')
  if(!sourceContext) throw Error("Context not found")

  const sourceData = sourceContext.getImageData(0, 0, source.width, source.height)
  const info = analyze(imgDataToPixels(sourceData))

  const dest = document.createElement('canvas')
  dest.width = width
  dest.height = height

  const context = dest.getContext('2d')
  if(!context) throw Error("Context not found")

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, dest.width, dest.height)

  const scale = Math.min(width / info.width, height / info.height)
  context.scale(scale, scale)
  context.translate(-info.xMin, -info.yMin)
  context.drawImage(source, 0, 0)

  return dest
}

const centerMass = (source: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement => {
  const sourceContext = source.getContext('2d')
  if(!sourceContext) throw Error("Context not found")

  const sourceData = sourceContext.getImageData(0, 0, source.width, source.height)
  const info = analyze(imgDataToPixels(sourceData))

  const dest = document.createElement('canvas')
  dest.width = width
  dest.height = height

  const context = dest.getContext('2d')
  if(!context) throw Error("Context not found")

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, dest.width, dest.height)

  const dx = width / 2 - info.xCenterMass
  const dy = height / 2 - info.yCenterMass
  context.drawImage(source, dx, dy)

  return dest
}

const imgDataToPixels = (data: ImageData): Pixel[] => {
  const uints = data.data.filter((_, i) => i % 4 === 0)

  return Array.from(uints).map((p, i) => ({
    y: Math.floor(i / data.width),
    x: i % data.width,
    value: 1 - (p.valueOf() / 255.0)
  }))
}

type ImgInfo = {
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  xCenter: number,
  yCenter: number,
  xCenterMass: number,
  yCenterMass: number
}

const analyze = (pixels: Pixel[]): ImgInfo => {
  const info = pixels.reduce((acc, pixel) => {
    const threshold = 0.3

    return {
      xMin: pixel.value > threshold && pixel.x < acc.xMin ? pixel.x : acc.xMin,
      xMax: pixel.value > threshold && pixel.x > acc.xMax ? pixel.x : acc.xMax,
      xSum: acc.xSum + pixel.value * pixel.x,
      yMin: pixel.value > threshold && pixel.y < acc.yMin ? pixel.y : acc.yMin,
      yMax: pixel.value > threshold && pixel.y > acc.yMin ? pixel.y : acc.yMax,
      ySum: acc.ySum + pixel.value * pixel.y,
      valueSum: acc.valueSum + pixel.value
    }
  }, {
    xMin: 9000,
    xMax: 0,
    xSum: 0,
    yMin: 9000,
    yMax: 0,
    ySum: 0,
    valueSum: 0.0
  })

  const width = info.xMax - info.xMin
  const height = info.yMax - info.yMin

  const xCenter = info.xMin + width / 2
  const yCenter = info.yMin + height / 2

  const xCenterMass = info.xSum / info.valueSum
  const yCenterMass = info.ySum / info.valueSum

  return {
    xMin: info.xMin,
    xMax: info.xMax,
    yMin: info.yMin,
    yMax: info.yMax,
    width,
    height,
    xCenter,
    yCenter,
    xCenterMass,
    yCenterMass,
  }
}
