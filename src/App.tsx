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
      setText(`That certainly must be ${result[0].value}.`)
    } else if(result[0].confidence > 0.8) {
      setText(`I feel quite confident that it is ${result[0].value}.`)
    } else if(result[0].confidence > 0.55) {
      setText(`Uhm.. is it ${result[0].value}?`)
    } else if(result[0].confidence > 0.45) {
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

        <StyledButton onClick={onEvaluate}>Ready!</StyledButton>
      </ButtonRow>

      { text && <Answer>{text}</Answer> }

      <Footer>
        <div>Created by <a href='https://www.linkedin.com/in/joosa-kurvinen/'>Joosa Kurvinen</a></div>
        <div>Feel the Force, Read the <a href='https://github.com/Joosakur/neural-network-test'>Source</a></div>
      </Footer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
  text-align: center;

  @media (min-height: 700px) {
    padding-top: 32px;
  }
`

const ButtonRow = styled.div`
  margin-bottom: 16px;
  width: 280px;
  display: flex;
  justify-content: space-between;
  user-select: none;
  
  @media (min-height: 700px) {
    margin-top: 16px;
    margin-bottom: 32px;
  }
`

const StyledButton = styled.button`
  width: 120px;
  height: 38px;

  color: white;
  font-size: 18px;
  font-weight: 400;
  font-family: 'Roboto Mono', monospace;
  
  border: none;
  background-color: #2c5cac;
  border-radius: 4px;

  &:hover {
    background-color: #3e71c6;
  }

  &:active {
    background-color: #1f4280;
  }
`

const Answer = styled.div`
  max-width: 280px;
  background-color: white;
  border-radius: 20px;
  border: 1px solid #2d2d2d;
  padding: 12px 16px;
  box-shadow: 2px 4px 6px 1px rgba(0, 0, 0, 0.3);
`

const Footer = styled.footer`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background-color: #353535;
  color: #c8c8cf;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;

  a {
    color: #7ca8d7;
  }
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
