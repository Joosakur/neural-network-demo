import React from "react"
import styled from "styled-components"

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement>
  width: number
  height: number
  scale: number
}

const Canvas = React.memo(function Canvas({
  canvasRef,
  width,
  height,
  scale
}: Props) {

  const draw = (x: number, y: number, dx?: number, dy?: number) => {
    if(!canvasRef.current) return
    const context = canvasRef.current.getContext('2d')
    if(!context) return

    if(dx && dy){
      context.lineCap = 'round'
      context.beginPath()
      context.moveTo(x - dx, y - dy)
      context.lineTo(x, y)
      context.closePath()
      context.lineWidth = 16
      context.strokeStyle = `#000`
      context.stroke()
    }

    const gradient = context.createRadialGradient(x, y, 8, x, y, 20)
    gradient.addColorStop(0, "rgba(0, 0, 0, 1)")
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.3)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    context.beginPath()
    context.arc(x, y, 20, 0, 2 * Math.PI)
    context.closePath()
    context.fillStyle = gradient
    context.fill()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if(e.buttons === 1 || !canvasRef.current) {
      draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.nativeEvent.movementX, e.nativeEvent.movementY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if(!canvasRef.current) return

    if(e.changedTouches.length > 0) {
      const touch = e.changedTouches.item(0)
      draw(touch.pageX - canvasRef.current.offsetLeft, touch.pageY - canvasRef.current.offsetTop)
    }
  }

  return (
    <StyledCanvas
      ref={canvasRef}
      height={height * scale}
      width={width * scale}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    />
  )
})

const StyledCanvas = styled.canvas`
  border: 1px solid black;
  touch-action: none;
`

export default Canvas
