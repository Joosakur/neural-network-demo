import data from "./data/network-export.json"

type ActivationFunctionType = 'SIGMOID' | 'RELU' | 'NONE'

type ActivationFunction = (x: number) => number

const activationFunctions: Record<ActivationFunctionType, ActivationFunction> = {
  SIGMOID: x => 1 / (1 + Math.exp(-x)),
  RELU: x => x < 0 ? 0 : x,
  NONE: x => x
}

type NodeJson = {
  bias: number
  activationFunction: ActivationFunctionType
  inputs: {
    fromLayer: number
    fromNode: number
    weight: number
  }[]
}

type LayerJson = {
  nodes: NodeJson[]
}

type NetworkJson = {
  inputLayerLength: number
  otherLayers: LayerJson[]
}

type Node = {
  activation: number
  bias: number
  activationFunction: ActivationFunctionType
  inputs: {
    fromLayer: number
    fromNode: number
    weight: number
  }[]
}

type Layer = {
  nodes: Node[]
}

type Network = {
  layers: Layer[]
}

export function importNetworkFromJson(): Network {
  const network = data as NetworkJson

  const inputLayer: Layer = {
    nodes: []
  }
  for (let i = 0; i < network.inputLayerLength; i++) {
    inputLayer.nodes.push({
      activation: 0,
      bias: 0,
      activationFunction: 'NONE',
      inputs: []
    })
  }

  return {
    layers: [
      inputLayer,
      ...(network.otherLayers.map((layer, layerNumber) => ({
        nodes: layer.nodes.map(node => ({
          activation: 0,
          bias: node.bias,
          activationFunction: node.activationFunction,
          inputs: node.inputs.map(input => ({
            fromLayer: input.fromLayer,
            fromNode: input.fromNode,
            weight: input.weight
          }))
        }))
      })))
    ]
  }
}

type Guess = {
  value: number
  confidence: number
}

export function evaluate(network: Network, input: number[]): Guess[] {
  if(network.layers.length < 2) {
    throw new Error("Invalid network")
  }

  if(input.length !== network.layers[0].nodes.length) {
    throw new Error("Invalid input length")
  }

  network.layers[0].nodes.forEach((node, i) => node.activation = input[i])

  for (let i = 1; i < network.layers.length; i++){
    for (let n = 0; n < network.layers[i].nodes.length; n++){
      const node = network.layers[i].nodes[n]
      const weightedSum = node.inputs.reduce((sum, input) => {
        const inputNode = network.layers[input.fromLayer].nodes[input.fromNode]
        return sum + input.weight * inputNode.activation
      }, node.bias)
      node.activation = activationFunctions[node.activationFunction](weightedSum)
    }
  }

  const outputActivations = network.layers[network.layers.length - 1].nodes
    .map(node => node.activation)

  const outputActivationSum = outputActivations.reduce((sum, a) => sum + a, 0)

  const guesses = outputActivations.map((activation, i) => ({
    value: i,
    confidence: activation / outputActivationSum
  }))

  return guesses.sort((g1, g2) => g1.confidence > g2.confidence ? -1 : 1)
}
