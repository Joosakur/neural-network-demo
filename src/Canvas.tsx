import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { Pixel } from "./types";

type Props = {
  pixels: Pixel[]
  setPixels: React.Dispatch<React.SetStateAction<Pixel[]>>
  width: number
  height: number
  scale: number
}

const Canvas = React.memo(function Canvas({
  pixels,
  setPixels,
  width,
  height,
  scale
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if(!canvasRef.current) return
    const context = canvasRef.current.getContext('2d')
    if(!context) return

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    pixels.forEach(({x, y, value}) => {
      const rgb = value * 255
      context.fillStyle = `rgba(${rgb}, ${rgb}, ${rgb}, 1.0)`
      context.fillRect(x * scale, y * scale, scale, scale)
    })
  }, [canvasRef.current, pixels, scale])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if(e.buttons != 1) return

    const mouseSpeed = Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY)

    const x = Math.floor(e.nativeEvent.offsetX / scale)
    const y = Math.floor(e.nativeEvent.offsetY / scale)
    setPixels(prev => prev.map(pixel => {
      if(pixel.x === x && pixel.y === y) {
        return {
          ...pixel,
          value: 0.0
        }
      } else if(Math.abs(pixel.x - x) <= 1 && Math.abs(pixel.y - y) <= 1) {
        return {
          ...pixel,
          value: Math.max(pixel.value - mouseSpeed / 40, 0)
        }
      } else if(Math.abs(pixel.x - x) <= 2 && Math.abs(pixel.y - y) <= 2) {
        return {
          ...pixel,
          value: Math.max(pixel.value - mouseSpeed / 400, 0)
        }
      } else {
        return pixel
      }
    }))
  }

  return (
    <StyledCanvas
      ref={canvasRef}
      height={height * scale}
      width={width * scale}
      onMouseMove={handleClick}
    />
  )
})

const StyledCanvas = styled.canvas`
  border: 1px solid black;
`

export default Canvas
