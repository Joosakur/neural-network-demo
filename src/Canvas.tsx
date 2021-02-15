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
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if(e.buttons !== 1 || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if(!context) return

    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(e.nativeEvent.offsetX - e.nativeEvent.movementX, e.nativeEvent.offsetY - e.nativeEvent.movementY)
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    context.closePath()
    context.lineWidth = 16
    context.strokeStyle = `#000`
    context.stroke()

    const x = e.nativeEvent.offsetX
    const y = e.nativeEvent.offsetY

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

  return (
    <StyledCanvas
      ref={canvasRef}
      height={height * scale}
      width={width * scale}
      onMouseMove={handleMouseMove}
    />
  )
})

const StyledCanvas = styled.canvas`
  border: 1px solid black;
`

export default Canvas
