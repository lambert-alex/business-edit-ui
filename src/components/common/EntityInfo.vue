<template>
  <div id="entity-info">
    <v-container class="py-2 pb-6">
      <div class="d-flex justify-space-between mt-5">
        <div class="left-column align-self-end">
          <div class="title-container">
            <span id="entity-legal-name">{{ getOriginalLegalName || 'Numbered Benefit Company' }}</span>
          </div>

          <dl class="business-info">
            <dd id="entity-legal-type">{{originalEntityType}}</dd>
            <dt class="mr-2">Business No:</dt>
            <dd id="entity-business-number">{{ getBusinessNumber || 'Not Available' }}</dd>
            <dt class="mr-2">Incorporation No:</dt>
            <dd id="entity-incorp-number">{{ getBusinessId }}</dd>
          </dl>
        </div>

        <div class="right-column text-right align-self-end">
          <dl class="profile-info">
            <dt><span class="sr-only mr-2">Business Email:</span></dt>
            <dd id="entity-business-email">{{getBusinessContact.email || 'Unknown Email'}}</dd>
            <template v-if="getBusinessContact.phone">
              <dt><span class="sr-only mr-2">Business Phone:</span></dt>
              <dd id="entity-business-phone">{{getBusinessContact.phone}}</dd>
            </template>
          </dl>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { CommonMixin } from '@/mixins/'
import { EntitySnapshotIF } from '@/interfaces/'
import { ContactPointIF } from '@bcrs-shared-components/interfaces/'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/'

@Component({})
export default class EntityInfo extends Mixins(CommonMixin) {
  // Global getters
  @Getter getBusinessId!: string
  @Getter getBusinessNumber!: string
  @Getter getOriginalLegalName!: string
  @Getter isRoleStaff!: boolean
  @Getter getBusinessContact!: ContactPointIF
  @Getter getEntitySnapshot!: EntitySnapshotIF

  /** Get original entity type. */
  get originalEntityType (): string {
    if (this.getEntitySnapshot?.businessInfo) {
      return GetCorpFullDescription(this.getEntitySnapshot.businessInfo.legalType)
    } else {
      return 'Unknown'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#entity-info {
  background: $BCgovInputBG;
}

.v-breadcrumbs li {
  font-size: $px-12;
}

:deep() {
  .v-breadcrumbs a {
    color: $gray8 !important;
  }

  .v-breadcrumbs a:hover {
    color: $BCgovABlue3 !important;
  }
}

.title-container {
  font-size: 1.125rem;
  font-weight: bold;
  color: black;
}

.business-info,
.profile-info {
  font-size: 1rem;
}

dl {
  display: inline-block;
  overflow: hidden;
  color: $gray6;
}

dd, dt {
  float: left;
}

dd + dt:before {
  content: "•";
  display: inline-block;
  margin-right: 0.75rem;
  margin-left: 0.75rem;
}

#entity-legal-name,
#entity-legal-type,
#entity-business-number,
#entity-incorp-number,
#entity-business-email,
#entity-business-phone {
  user-select: all;
}
</style>
