import React, { useState } from "react";
import Canvas from "./Canvas";
import styled from "styled-components";
import { Pixel } from "./types";
import { evaluate, importNetworkFromJson } from "./network";

const width = 28
const height = 28
const scale = 10

const network = importNetworkFromJson()

const initPixels = () => {
  const pixels: Pixel[] = []
  for(let y = 0; y < height; y++) {
    for(let x = 0; x < height; x++) {
      pixels.push({
        x,
        y,
        value: 1.0
      })
    }
  }
  return pixels
}

const normalize = (pixels: Pixel[]): Pixel[] => {
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
    xMin: width - 1,
    xMax: 0,
    xSum: 0,
    yMin: height - 1,
    yMax: 0,
    ySum: 0,
    valueSum: 0.0
  })

  const imgWidth = info.xMax - info.xMin
  const imgHeight = info.yMax - info.yMin

  const xCenter = info.xMin + imgWidth / 2
  const yCenter = info.yMin + imgHeight / 2

  const xCenterMass = info.xSum / info.valueSum
  const yCenterMass = info.ySum / info.valueSum

  const xCenterRatio = xCenterMass / xCenter
  const yCenterRatio = yCenterMass / yCenter

  console.log(xCenterRatio, yCenterRatio)

  const xScale = 20 / imgWidth
  const yScale = 20 / imgHeight
  const scale = Math.min(xScale, yScale)

  const xTranslate = (x: number) => Math.floor((x - info.xMin) * scale + (width - imgWidth * scale) / 2)
  const yTranslate = (y: number) => Math.floor((y - info.yMin) * scale + (width - imgHeight * scale) / 2)

  const newPixels = [] as Pixel[]

  for (let y = 0; y < height; y++){
    for (let x = 0; x < width; x++){
      newPixels.push({
        x,
        y,
        value: pixels.find(p => xTranslate(p.x) === x && yTranslate(p.y) === y)?.value ?? 1
      })
    }
  }

  return newPixels
}

function App() {
  const [pixels, setPixels] = useState<Pixel[]>(initPixels())
  const [text, setText] = useState<string>("")

  const onEvaluate = () => {
    const normalized = normalize(pixels)
    setPixels(normalized)
    const result = evaluate(network, normalized.map(p => 1.0 - p.value))

    setText("")
    if(result[0].confidence > 0.9) {
      setText(`I feel certain that it is number ${result[0].value}.`)
    } else if(result[0].confidence > 0.8) {
      setText(`I feel quite confident that is number ${result[0].value}.`)
    } else if(result[0].confidence > 0.5) {
      setText(`Uhm.. is it ${result[0].value}?`)
    } else if(result[0].confidence > 0.3) {
      setText(`If I really had to guess.. I would say it might be ${result[0].value}.`)
    } else {
      setText(`Sorry, I have no idea what that is.`)
    }

    if(result[1].confidence > 0.3) {
      setText(prev => `${prev} Might also be ${result[1].value}..`)
    }

    if(result[2].confidence > 0.3) {
      setText(prev => `${prev} Or maybe ${result[2].value}?`)
    }

  }

  return (
    <Container>
      <h1>Neural Network Demo</h1>
      <p>Please draw a number between 0 and 9. Make it as big as possible!</p>
      <Canvas
        pixels={pixels}
        setPixels={setPixels}
        width={width}
        height={height}
        scale={scale}
      />
      <ButtonRow>
        <StyledButton onClick={() => {
          setPixels(initPixels())
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

export default App
