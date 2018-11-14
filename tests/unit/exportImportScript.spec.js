import { expect } from 'chai'

import { getCleanItems, removeNonCode } from './exportImportCommon.js'

import Builder from '../../src/builder'
import importScript from '../../src/importScript'

import tiny from '../../src/examples/tiny'
import tinyController from '../../src/examples/tiny_controller'
import tinyTC from '../../src/examples/tiny_tc'
import tinyPhysicalInterface from '../../src/examples/tiny_physical_interface'
import medium1Controller from '../../src/examples/medium_1_controller'
import medium2Controllers from '../../src/examples/medium_2_controllers'

describe('Export import script', () => {
  [
    { json: tiny, name: 'tiny' },
    { json: tinyController, name: 'tiny_controller' },
    { json: tinyTC, name: 'tiny_tc' },
    { json: tinyPhysicalInterface, name: 'tiny_physical_interface' },
    { json: medium1Controller, name: 'medium_1_controller' },
    { json: medium2Controllers, name: 'medium_2_controllers' }
  ].forEach(({ json: data1, name }) => describe(name, () => {
    const script1 = new Builder(JSON.parse(JSON.stringify(data1))).build()
    const data2 = importScript(script1)
    const script2 = new Builder(JSON.parse(JSON.stringify(data2))).build()

    it('types', () => {
      expect(data2.version, 'Version is not a number.').to.be.a('number')
      expect(data2.script, 'Script is not a string.').to.be.a('string')
      expect(data2.items, 'Items is not an array.').to.be.an('array')
    })

    it('items', () => {
      // Ports
      ;(function () {
        const type = 'port'
        const typePl = 'ports'
        const items1 = getCleanItems(data1.items, type)
        const items2 = getCleanItems(data2.items, type)
        expect(items2, `The amount of ${typePl} differs.`).to.have.lengthOf.at.most(items1.length)
        expect(items1, `Some ${typePl} we're not imported correctly.`).to.include.deep.members(items2)
      })()

      // Other
      ;[
        { type: 'controller', typePl: 'controllers' },
        { type: 'host', typePl: 'hosts' },
        { type: 'link', typePl: 'links' },
        { type: 'switch', typePl: 'switches' }
      ].forEach(({ type, typePl }) => {
        const items1 = getCleanItems(data1.items, type)
        const items2 = getCleanItems(data2.items, type)
        expect(items2, `The amount of ${typePl} differs.`).to.have.lengthOf(items1.length)
        expect(items2, `Some ${typePl} we're not imported correctly.`).to.have.deep.members(items1)
      })
    })

    it('script reexport', () => {
      expect(removeNonCode(script2), 'Script changed after importing and reexporting.')
        .to.equal(removeNonCode(script1))
    })
  }))
})