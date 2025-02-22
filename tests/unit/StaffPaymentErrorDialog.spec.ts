import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store/'
import { shallowMount, mount } from '@vue/test-utils'
import StaffPaymentErrorDialog from '@/dialogs/StaffPaymentErrorDialog.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Staff Payment Error Dialog', () => {
  const notEnoughBalance = [{
    message: `There is not enough balance in this Routing slip. The current balance is: $30.00`,
    payment_error_type: 'INSUFFICIENT_BALANCE_IN_ROUTING_SLIP'
  }]

  it('renders the component properly with generic message', () => {
    store.state.stateModel.tombstone.keycloakRoles = ['staff', 'edit', 'view']
    const wrapper = shallowMount(StaffPaymentErrorDialog,
      {
        vuetify,
        store,
        propsData: { dialog: true }
      })

    expect(wrapper.attributes('contentclass')).toBe('payment-error-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.findAll('p').length).toBe(1)
    expect(wrapper.findAll('p').at(0).text()).toContain('We are unable to process your payment at this time.')
    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })

  it('emits an event when Exit button is clicked', async () => {
    const wrapper = mount(StaffPaymentErrorDialog,
      {
        vuetify,
        store,
        propsData: { dialog: true }
      })

    expect(wrapper.emitted('close')).toBeUndefined()

    // verify and click Exit button
    const exitButton = wrapper.find('#dialog-exit-button')
    expect(exitButton.text()).toBe('OK')
    await exitButton.trigger('click')

    expect(wrapper.emitted('close').length).toBe(1)

    wrapper.destroy()
  })

  it('renders Not Enough Balance error messages correctly when they are present', () => {
    store.state.stateModel.tombstone.keycloakRoles = ['edit', 'view']
    const wrapper = shallowMount(StaffPaymentErrorDialog,
      {
        vuetify,
        store,
        propsData: { dialog: true, errors: notEnoughBalance }
      })

    expect(wrapper.attributes('contentclass')).toBe('payment-error-dialog')
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('#dialog-title').text()).toBe('Unable to Process Payment')
    expect(wrapper.findAll('p').length).toBe(1)
    expect(wrapper.findAll('p').at(0).text()).toContain(
      'We were unable to process your payment due to the following error(s):')
    expect(wrapper.findAll('li').at(0).text()).toContain(notEnoughBalance[0].message)
    expect(wrapper.find('#dialog-exit-button').exists()).toBe(true)

    wrapper.destroy()
  })
})
