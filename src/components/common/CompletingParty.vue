<template>
  <section id="completing-party-section">
    <h2>{{sectionNumber}} Completing Party</h2>

    <div class="mt-4" :class="{ 'invalid-section': invalidSection }">
      <!-- FUTURE: update this component so it doesn't set flag until user changes something -->
      <CompletingPartyShared
        class="section-container py-6"
        :completingParty="getCompletingParty"
        :enableAddEdit="isRoleStaff || isSbcStaff"
        :addressSchema="DefaultAddressSchema"
        :validate="validate"
        :invalidSection="invalidSection"
        @update="onUpdate($event)"
        @valid="onValid($event)"
      />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/'
import { CompletingPartyIF } from '@bcrs-shared-components/interfaces/'
import { CompletingParty as CompletingPartyShared } from '@bcrs-shared-components/completing-party/'
import { DefaultAddressSchema } from '@/schemas/'

@Component({
  components: {
    CompletingPartyShared
  }
})
export default class CompletingParty extends Vue {
  /** Prop to provide section number. */
  @Prop({ default: '' }) readonly sectionNumber!: string

  /** Whether to perform validation. */
  @Prop({ default: false }) readonly validate!: boolean

  // store getters
  @Getter getCompletingParty!: CompletingPartyIF
  @Getter isRoleStaff!: boolean
  @Getter isSbcStaff!: boolean

  // store actions
  @Action setCompletingParty!: ActionBindingIF
  @Action setCompletingPartyValidity!: ActionBindingIF

  // Declaration for template
  readonly DefaultAddressSchema = DefaultAddressSchema

  // local variable
  private completingPartyValid = true

  /** True if invalid class should be set for completing party container. */
  get invalidSection (): boolean {
    return (this.validate && !this.completingPartyValid)
  }

  protected onUpdate (cp: CompletingPartyIF): void {
    this.setCompletingParty(cp)
  }

  protected onValid (valid: boolean): void {
    this.completingPartyValid = valid
    this.setCompletingPartyValidity(valid)
  }
}
</script>
