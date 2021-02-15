import React, { useRef, useState } from "react"
import Canvas from "./Canvas"
import styled from "styled-components"
import { Pixel } from "./types"
import { evaluate, importNetworkFromJson } from "./network"
import TransformPreview from "./TransformPreview"
import { normalize } from "./normalizer"

const width = 70
const height = 70
const scale = 4

const debug = false

const network = importNetworkFromJson()

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<Pixel[]>(initPixels())
  const [text, setText] = useState<string>("")

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if(!canvas) return

    const context = canvas.getContext('2d')
    if(!context) throw Error("Context not found")

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const onEvaluate = () => {
    const canvas = canvasRef.current
    if(!canvas) return

    const normalized = normalize(canvas)

    setPreview(normalized)

    const result = evaluate(network, normalized.map(p => p.value))

    setText("")
    if(result[0].confidence > 0.93) {
      setText(`I feel certain that it is number ${result[0].value}.`)
    } else if(result[0].confidence > 0.8) {
      setText(`I feel quite confident that is number ${result[0].value}.`)
    } else if(result[0].confidence > 0.5) {
      setText(`Uhm.. is it ${result[0].value}?`)
    } else if(result[0].confidence > 0.4) {
      setText(`If I really had to guess.. I would say it might be ${result[0].value}.`)
    } else {
      setText(`Sorry, I have no idea what that is.`)
    }

    if(result[1].confidence > 0.4) {
      setText(prev => `${prev} Might also be ${result[1].value}..`)
    }

    if(result[2].confidence > 0.4) {
      setText(prev => `${prev} Or maybe ${result[2].value}?`)
    }
  }

  return (
    <Container>
      <h1>Neural Network Demo</h1>

      <p>Please draw a number between 0 and 9.</p>

      <Canvas
        canvasRef={canvasRef}
        width={width}
        height={height}
        scale={scale}
      />

      { debug && (
        <TransformPreview
          pixels={preview}
          width={28}
          height={28}
          scale={10}
        />
      )}

      <ButtonRow>
        <StyledButton onClick={() => {
          clearCanvas()
          setPreview(initPixels())
          setText("")
        }}>Clear</StyledButton>

        <StyledButton onClick={onEvaluate}>Test</StyledButton>
      </ButtonRow>

      { text && <p>{text}</p> }

    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ButtonRow = styled.div`
  margin-top: 16px;
  width: 280px;
  display: flex;
  justify-content: space-evenly;
`

const StyledButton = styled.button`
  width: 80px;
  height: 38px;
`

const initPixels = () => {
  const pixels: Pixel[] = []
  for(let y = 0; y < height; y++) {
    for(let x = 0; x < height; x++) {
      pixels.push({
        x,
        y,
        value: 0.0
      })
    }
  }
  return pixels
}

export default App
