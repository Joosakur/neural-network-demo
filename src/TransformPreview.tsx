import React, { useEffect, useRef } from "react"
import styled from "styled-components"
import { Pixel } from "./types"

type Props = {
  pixels: Pixel[]
  width: number
  height: number
  scale: number
}

const Canvas = React.memo(function TransformPreview({
  pixels,
  width,
  height,
  scale
}: Props) {
  const previewRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if(!previewRef.current) return

    const context = previewRef.current.getContext('2d')
    if(!context) return

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    pixels.forEach(({x, y, value}) => {
      const v = (1 - value) * 255
      context.fillStyle = `rgba(${v}, ${v}, ${v}, 1.0)`
      context.fillRect(x * scale, y * scale, scale, scale)
    })
  }, [pixels, scale])

  return (
    <StyledCanvas
      ref={previewRef}
      height={height * scale}
      width={width * scale}
    />
  )
})

const StyledCanvas = styled.canvas`
  border: 1px solid black;
  margin: 16px 0;
`

export default Canvas
