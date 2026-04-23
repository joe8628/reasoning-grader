// tests/Button.test.js — class-based snapshot approach
const { shallow } = require('enzyme')
const { Button } = require('../components/Button')
class ButtonTestHelper {
  constructor(props) { this.wrapper = shallow(React.createElement(Button, props)) }
  snapshot() { return this.wrapper.debug() }
  click() { this.wrapper.find('button').simulate('click') }
}
test('Button renders correctly', () => {
  const h = new ButtonTestHelper({ label: 'Click me' })
  expect(h.snapshot()).toMatchSnapshot()
})
test('Modal renders correctly', () => {
  const { Modal } = require('../components/Modal')
  class ModalTestHelper {
    constructor(props) { this.wrapper = shallow(React.createElement(Modal, props)) }
    snapshot() { return this.wrapper.debug() }
  }
  const h = new ModalTestHelper({ isOpen: true, title: 'Test', onClose: () => {} })
  expect(h.snapshot()).toMatchSnapshot()
})
