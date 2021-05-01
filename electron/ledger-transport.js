const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid-singleton').default
const TransportNodeBle = require('@ledgerhq/hw-transport-node-ble').default

const transports = new Map()

process.on('SIGINT', () => {
  process.exit(-1)
})

process.on('SIGTERM', () => {
  process.exit(-1)
})

process.on('disconnect', () => {
  process.exit(0)
})

process.on('exit', () => {
  closeAll()
})

process.on('message', async (message) => {
  if (process.send) {
    let data = {}
    try {
      switch (message.type) {
        case 'get-devices':
          const devices = await getConnectedDevices(message.data.connectionType)
          data = { devices }
          break
        case 'open':
          const transportId = await openTransport(message.data.connectionType, message.data.descriptor)
          data = { transportId }
          break
        case 'send':
          const sendResponse = await send(
            message.data.transportId,
            message.data.cla,
            message.data.ins,
            message.data.p1,
            message.data.p2,
            message.data.hexData ? Buffer.from(message.data.hexData, 'hex') : undefined
          )
          data = { response: sendResponse }
          break
        case 'exchange':
          const exchangeResponse = await exchange(message.data.transportId, message.data.apdu)
          data = { response: exchangeResponse }
          break
        case 'set-exchange-timeout':
          setExchangeTimeout(message.data.transportId, message.data.timeout)
          break
        case 'close':
          await close(message.data.transportId)
          break
        case 'decorate-app':
          decorateAppAPIMethods(message.data.transportId, message.data.self, message.data.methods, message.data.scrambleKey)
          break
        case 'set-scramble-key':
          setScrambleKey(message.data.transportId, message.data.key)
          break
      }
    } catch (error) {
      data = {
        error: error instanceof Error ? JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) : error
      }
    }

    process.send({
      requestId: message.requestId,
      data: {
        type: `${message.type}-reply`,
        ...data
      }
    })
  }
})

async function getConnectedDevices(connectionType) {
  switch (connectionType) {
    case 'USB':
      return getUsbDevices()
    case 'BLE':
      return getBleDevices()
    default:
      return []
  }
}

async function openTransport(connectionType, descriptor) {
  let transport
  switch (connectionType) {
    case 'USB':
      transport = await TransportNodeHid.open(descriptor)
      break
    case 'BLE':
      transport = await TransportNodeBle.open(descriptor)
      break
    default:
      transport = await TransportNodeHid.create(3000, 3000)
  }
  const transportId = `${connectionType || 'default'}-${new Date().getTime().toString()}`

  transports.set(transportId, transport)
  return transportId
}

async function send(transportId, cla, ins, p1, p2, data) {
  const transport = transports.get(transportId)
  if (transport) {
    const response = await transport.send(cla, ins, p1, p2, data)
    return response ? response : Buffer.alloc(0)
  } else {
    return Buffer.alloc(0)
  }
}

async function exchange(transportId, apdu) {
  const transport = transports.get(transportId)
  if (transport) {
    const response = await transport.exchange(apdu)
    return response ? response : Buffer.alloc(0)
  } else {
    return Buffer.alloc(0)
  }
}

function setExchangeTimeout(transportId, timeout) {
  const transport = transports.get(transportId)
  if (transport) {
    transport.setExchangeTimeout(timeout)
  }
}

async function close(transportId) {
  const transport = transports.get(transportId)
  if (transport) {
    await transport.close()
    transports.delete(transportId)
  }
}

function closeAll() {
  TransportNodeHid.disconnect()
  TransportNodeBle.disconnect()
}

function decorateAppAPIMethods(transportId, self, methods, scrambleKey) {
  const transport = transports.get(transportId)
  if (transport) {
    transport.decorateAppAPIMethods(self, methods, scrambleKey)
  }
}

function setScrambleKey(transportId, key) {
  const transport = transports.get(transportId)
  if (transport) {
    transport.setScrambleKey(key)
  }
}

async function getUsbDevices() {
  return TransportNodeHid.list()
    .then((descriptors) => {
      return descriptors.map((descriptor) => ({
        descriptor,
        type: 'USB'
      }))
    })
    .catch(() => [])
}

async function getBleDevices() {
  const listenPromise = new Promise((resolve) => {
    const devices = []
    TransportNodeBle.listen({
      next: (event) => {
        if (event.type === 'add') {
          devices.push({
            descriptor: event.descriptor,
            type: 'BLE'
          })
        }
      },
      error: () => resolve([]),
      complete: () => resolve(devices)
    })
  })
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve([])
    }, 1000)
  })

  return Promise.race([listenPromise, timeoutPromise])
}
