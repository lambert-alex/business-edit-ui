import Vue from 'vue'
import Vuelidate from 'vuelidate'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import mockRouter from './MockRouter'
import { getVuexStore } from '@/store/'
import { createLocalVue, mount } from '@vue/test-utils'
import AddNameTranslation from '@/components/common/YourCompany/NameTranslations/AddNameTranslation.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()

function resetStore (): void {
  store.state.stateModel.nameTranslations = []
}

// Local references
const addTranslationInput = '#name-translation-input'
const okBtn = '#name-translation-btn-ok'
const cancelBtn = '#name-translation-btn-cancel'

describe('Add Name Translation component', () => {
  let wrapperFactory: any

  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    // Init Store
    store.state.stateModel.nameTranslations = []

    wrapperFactory = async (propsData: any) => {
      const wrapper = mount(AddNameTranslation, {
        localVue,
        router,
        store,
        vuetify,
        propsData: { ...propsData }
      })
      await Vue.nextTick()
      return wrapper
    }
  })

  it('displays the input field and buttons', async () => {
    const wrapper = await wrapperFactory()

    // Verify input field
    expect(wrapper.find(addTranslationInput).exists()).toBeTruthy()

    // Verify Action btns and their default states
    expect(wrapper.find(okBtn).exists()).toBeTruthy()
    // done button not disabled anymore, validation done by validation function
    expect(wrapper.find(okBtn).attributes('disabled')).toBeUndefined()

    expect(wrapper.find(cancelBtn).exists()).toBeTruthy()
    expect(wrapper.find(cancelBtn).attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('enables the Done button when the input is valid', async () => {
    const wrapper = await wrapperFactory()
    const vm: any = wrapper.vm

    // Verify input field
    expect(wrapper.find(addTranslationInput).exists()).toBeTruthy()

    // Set Input field values
    vm.$el.querySelector(addTranslationInput).textContent = 'Mock Name Translation'
    await wrapper.find(addTranslationInput).setValue('MockNameTranslation')
    await wrapper.find(addTranslationInput).trigger('change')
    await wrapper.find(addTranslationInput).trigger('input')
    expect(wrapper.find(addTranslationInput).text()).toEqual('Mock Name Translation')

    // Verify Action btns and their states
    expect(wrapper.find(okBtn).exists()).toBeTruthy()
    expect(wrapper.find(okBtn).attributes('disabled')).toBeUndefined()

    expect(wrapper.find(cancelBtn).exists()).toBeTruthy()
    expect(wrapper.find(cancelBtn).attributes('disabled')).toBeUndefined()

    // Verify that is adding function returns True
    expect(vm.isAddingTranslation).toBe(true)

    wrapper.destroy()
  })

  it('enables the Done button when the input is valid - French characters', async () => {
    const wrapper = await wrapperFactory()
    const vm: any = wrapper.vm

    // Verify input field
    expect(wrapper.find(addTranslationInput).exists()).toBeTruthy()

    // Set Input field values
    vm.$el.querySelector(addTranslationInput).textContent = 'Nom commercial simulé'
    await wrapper.find(addTranslationInput).setValue('Nom commercial simulé')
    await wrapper.find(addTranslationInput).trigger('change')
    await wrapper.find(addTranslationInput).trigger('input')
    expect(wrapper.find(addTranslationInput).text()).toEqual('Nom commercial simulé')

    // Verify Action btns and their states
    expect(wrapper.find(okBtn).exists()).toBeTruthy()
    expect(wrapper.find(okBtn).attributes('disabled')).toBeUndefined()

    expect(wrapper.find(cancelBtn).exists()).toBeTruthy()
    expect(wrapper.find(cancelBtn).attributes('disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('shows the validation message when the input contains an invalid character', async () => {
    const wrapper = await wrapperFactory()
    const vm: any = wrapper.vm

    // Verify input field
    expect(wrapper.find(addTranslationInput).exists()).toBeTruthy()

    // Set Input field value
    const invalidText = 'Invalid Name Translation 123'
    vm.$el.querySelector(addTranslationInput).textContent = invalidText
    await wrapper.find(addTranslationInput).setValue(invalidText)
    await wrapper.find(addTranslationInput).trigger('change')

    expect(wrapper.find(addTranslationInput).text()).toEqual(invalidText)

    // Verify Action btns and their states
    expect(wrapper.find(okBtn).exists()).toBeTruthy()
    // done button not disabled anymore, validation done by validation function
    expect(wrapper.find(okBtn).attributes('disabled')).toBeUndefined()

    expect(wrapper.find(cancelBtn).exists()).toBeTruthy()
    expect(wrapper.find(cancelBtn).attributes('disabled')).toBeUndefined()

    vm.$refs.nameTranslationForm.validate()

    // verify the error message
    expect(wrapper.findAll('.v-messages__message').length).toBe(1)
    expect(wrapper.find('.v-messages__message').text()).toContain('Invalid character')

    wrapper.destroy()
  })

  it('shows the validation message when the input is too long', async () => {
    const wrapper = await wrapperFactory()
    const vm: any = wrapper.vm

    // Verify input field
    expect(wrapper.find(addTranslationInput).exists()).toBeTruthy()

    // Set Input field values
    const invalidText = 'a'.repeat(51)
    vm.$el.querySelector(addTranslationInput).textContent = invalidText
    await wrapper.find(addTranslationInput).setValue(invalidText)
    await wrapper.find(addTranslationInput).trigger('change')

    expect(wrapper.find(addTranslationInput).text()).toEqual(invalidText)

    // Verify Action btns and their states
    expect(wrapper.find(okBtn).exists()).toBeTruthy()
    // done button not disabled anymore, validation done by validation function
    expect(wrapper.find(okBtn).attributes('disabled')).toBeUndefined()

    expect(wrapper.find(cancelBtn).exists()).toBeTruthy()
    expect(wrapper.find(cancelBtn).attributes('disabled')).toBeUndefined()

    vm.$refs.nameTranslationForm.validate()

    // verify the error message
    expect(wrapper.findAll('.v-messages__message').length).toBe(1)
    expect(wrapper.find('.v-messages__message').text()).toContain('Cannot exceed 50 characters')

    wrapper.destroy()
  })

  it('displays the correct name when editing a name translation', async () => {
    const wrapper = await wrapperFactory({ editNameTranslation: 'Mock Name Edit' })
    const vm: any = wrapper.vm

    // Verify input field
    expect(wrapper.find(addTranslationInput).exists()).toBeTruthy()
    expect(wrapper.find(addTranslationInput).element.value).toContain('Mock Name Edit')

    // Verify Action btns and their states
    expect(wrapper.find(okBtn).exists()).toBeTruthy()
    expect(wrapper.find(okBtn).attributes('disabled')).toBeUndefined()

    expect(wrapper.find(cancelBtn).exists()).toBeTruthy()
    expect(wrapper.find(cancelBtn).attributes('disabled')).toBeUndefined()

    // Verify that is adding functions returns False
    expect(vm.isAddingTranslation).toBe(false)

    wrapper.destroy()
  })

  it('shows the validaton message when editing an invalid name translation', async () => {
    const wrapper = await wrapperFactory({ editNameTranslation: 'Mock Name Edit' })
    const vm: any = wrapper.vm

    // Verify input field
    expect(wrapper.find(addTranslationInput).exists()).toBeTruthy()
    expect(wrapper.find(addTranslationInput).element.value).toContain('Mock Name Edit')

    // Edit the name
    await wrapper.find(addTranslationInput).setValue('Mock edit fail 1212')
    await wrapper.find(addTranslationInput).trigger('change')

    // Verify Action btns and their states
    expect(wrapper.find(okBtn).exists()).toBeTruthy()
    // done button not disabled anymore, validation done by validation function
    expect(wrapper.find(okBtn).attributes('disabled')).toBeUndefined()

    expect(wrapper.find(cancelBtn).exists()).toBeTruthy()
    expect(wrapper.find(cancelBtn).attributes('disabled')).toBeUndefined()

    vm.$refs.nameTranslationForm.validate()

    // verify the error message
    expect(wrapper.findAll('.v-messages__message').length).toBe(1)
    expect(wrapper.find('.v-messages__message').text()).toContain('Invalid character')

    wrapper.destroy()
  })
})
