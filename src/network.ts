import data from "./data/network-export.json"

type ActivationFunctionType = 'SIGMOID' | 'RELU' | 'NONE'

type ActivationFunction = (x: number) => number

const activationFunctions: Record<ActivationFunctionType, ActivationFunction> = {
  SIGMOID: x => 1 / (1 + Math.exp(-x)),
  RELU: x => x < 0 ? 0 : x,
  NONE: x => x
}

type NeuronJson = {
  bias: number
  activationFunction: ActivationFunctionType
  inputs: {
    fromLayer: number
    fromNeuron: number
    weight: number
  }[]
}

type LayerJson = {
  neurons: NeuronJson[]
}

type NetworkJson = {
  inputLayerLength: number
  otherLayers: LayerJson[]
}

type Neuron = {
  activation: number
  bias: number
  activationFunction: ActivationFunctionType
  inputs: {
    fromLayer: number
    fromNeuron: number
    weight: number
  }[]
}

type Layer = {
  neurons: Neuron[]
}

type Network = {
  layers: Layer[]
}

export function importNetworkFromJson(): Network {
  // @ts-ignore
  const network = data as NetworkJson

  const inputLayer: Layer = {
    neurons: []
  }
  for (let i = 0; i < network.inputLayerLength; i++) {
    inputLayer.neurons.push({
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
        neurons: layer.neurons.map(neuron => ({
          activation: 0,
          bias: neuron.bias,
          activationFunction: neuron.activationFunction,
          inputs: neuron.inputs.map(input => ({
            fromLayer: input.fromLayer,
            fromNeuron: input.fromNeuron,
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

  if(input.length !== network.layers[0].neurons.length) {
    throw new Error("Invalid input length")
  }

  network.layers[0].neurons.forEach((neuron, i) => neuron.activation = input[i])

  for (let i = 1; i < network.layers.length; i++){
    for (let n = 0; n < network.layers[i].neurons.length; n++){
      const neuron = network.layers[i].neurons[n]
      const weightedSum = neuron.inputs.reduce((sum, input) => {
        const inputNeuron = network.layers[input.fromLayer].neurons[input.fromNeuron]
        return sum + input.weight * inputNeuron.activation
      }, neuron.bias)
      neuron.activation = activationFunctions[neuron.activationFunction](weightedSum)
    }
  }

  const outputActivations = network.layers[network.layers.length - 1].neurons
    .map(neuron => neuron.activation)

  const outputActivationSum = outputActivations.reduce((sum, a) => sum + a, 0)

  const guesses = outputActivations.map((activation, i) => ({
    value: i,
    confidence: activation / outputActivationSum
  }))

  return guesses.sort((g1, g2) => g1.confidence > g2.confidence ? -1 : 1)
}
