<!-- src/components/freeShipping/FreeShippingPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Free Shipping</h1>
      <v-chip size="small" color="warning" variant="tonal" label>Exploring</v-chip>
    </ContentHeader>

    <p class="text-body-2 text-medium-emphasis mb-6">
      Investigating optimal configuration patterns for free shipping incentives to identify the most effective and operationally sound implementation approach.
    </p>

    <v-row>
      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-truck-fast-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Domain Ownership</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Where free shipping configuration belongs organisationally</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Investigating whether free shipping is best owned by the promotions team, the logistics and fulfilment domain,
              or a dedicated shipping product team — and what that ownership implies for configuration tooling,
              change governance, and cross-team coordination when business rules evolve.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-cog-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Configuration Efficiency</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Identifying the most operationally efficient way to configure free shipping</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Assessing the available configuration approaches — dedicated free shipping rules, promotion engine conditions,
              or platform-level shipping overrides — to determine which model delivers the lowest operational overhead,
              the highest flexibility for market-specific requirements, and the most reliable runtime behaviour.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
</script>
