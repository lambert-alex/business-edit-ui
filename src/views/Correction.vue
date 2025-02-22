<template>
  <component
    :is="component"
    :correctionFiling="correctionFiling"
    @fetchError="emitFetchError($event)"
    @haveData="emitHaveData($event)"
  />
</template>

<script lang="ts">
import { Component, Emit, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { GetFeatureFlag } from '@/utils/'
import { CommonMixin } from '@/mixins/'
import { LegalServices } from '@/services/'
import { ActionBindingIF, CorrectionFilingIF } from '@/interfaces/'
import { FilingStatus, FilingTypes } from '@/enums/'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import BcCorrection from '@/views/Correction/BcCorrection.vue'
import FirmCorrection from '@/views/Correction/FirmCorrection.vue'

@Component({
  components: {
    BcCorrection,
    FirmCorrection
  }
})
export default class Correction extends Mixins(CommonMixin) {
  /** Whether App is ready. */
  @Prop({ default: false }) readonly appReady!: boolean

  // Global getters
  @Getter getBusinessId!: string
  @Getter isRoleStaff!: boolean
  @Getter isCorpClassBc!: boolean
  @Getter isCorpClassFirm!: boolean

  // Global actions
  @Action setFilingId!: ActionBindingIF
  @Action setEntityType!: ActionBindingIF

  protected correctionFiling: CorrectionFilingIF = null

  /** The dynamic component to render. */
  get component (): string {
    if (this.isCorpClassBc) return 'BcCorrection'
    if (this.isCorpClassFirm) return 'FirmCorrection'
    return null // should never happen
  }

  /** True if user is authenticated. */
  get isAuthenticated (): boolean {
    return Boolean(sessionStorage.getItem(SessionStorageKeys.KeyCloakToken))
  }

  /** The id of the correction being edited. */
  get correctionId (): number {
    return +this.$route.query['correction-id'] || 0
  }

  @Watch('appReady')
  private async onAppReady (val: boolean): Promise<void> {
    // do not proceed if app is not ready
    if (!val) return

    // do not proceed if we are not authenticated (safety check - should never happen)
    if (!this.isAuthenticated) return

    // do not proceed if FF is disabled
    // bypass this when Jest is running as FF are not fetched
    if (!this.isJestRunning && !GetFeatureFlag('correction-ui-enabled')) {
      window.alert('Corrections are not available at the moment. Please check again later.')
      this.$root.$emit('go-to-dashboard', true)
      return
    }

    // do not proceed if user is not staff
    const isStaffOnly = this.$route.matched.some(r => r.meta?.isStaffOnly)
    if (isStaffOnly && !this.isRoleStaff) {
      window.alert('Only staff can correct a filing.')
      this.$root.$emit('go-to-dashboard', true)
      return
    }

    // do not proceed if we don't have the necessary query param
    if (!this.correctionId) {
      throw new Error('Invalid correction filing ID')
    }

    // fetch the correction filing
    try {
      // store the filing ID
      this.setFilingId(this.correctionId)

      // fetch draft correction to resume
      const filing =
        await LegalServices.fetchFilingById(this.getBusinessId, this.correctionId) as CorrectionFilingIF

      // do not proceed if header object is missing
      // or this isn't a correction filing
      if (!filing.header || (filing.header?.name !== FilingTypes.CORRECTION)) {
        throw new Error('Invalid header info')
      }

      // do not proceed if business object is missing
      if (!filing.business) {
        throw new Error('Invalid business info')
      }

      // do not proceed if correction object is missing
      if (!filing.correction) {
        throw new Error('Invalid correction info')
      }

      // set entity type for misc functionality to work
      // do not proceed if this isn't a BC or firm correction
      this.setEntityType(filing.business?.legalType)
      if (!this.isCorpClassBc && !this.isCorpClassFirm) {
        throw new Error('Invalid correction type')
      }

      // do not proceed if this isn't a DRAFT filing
      if (filing.header?.status !== FilingStatus.DRAFT) {
        throw new Error('Invalid correction status')
      }

      // assign prop to trigger sub-components
      this.correctionFiling = filing
    } catch (err) {
      console.log(err) // eslint-disable-line no-console
      this.emitFetchError(err)
    }
  }

  /** Emits Fetch Error event. */
  @Emit('fetchError')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitFetchError (err: unknown = null): void {}

  /** Emits Have Data event. */
  @Emit('haveData')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitHaveData (haveData = true): void {}
}
</script>
