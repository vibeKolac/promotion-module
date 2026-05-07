<!-- src/components/bundles/BundlesPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-6 py-2">
      <h1 class="text-h5 font-weight-bold">Bundles</h1>
      <v-chip size="small" color="warning" variant="tonal" label class="ml-3">Exploring</v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      Examining bundle mechanics and their configuration model, which spans both the product catalogue and promotion domains, to determine the most appropriate ownership and implementation strategy.
    </p>

    <v-row>
      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-package-variant-closed" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Bundle as a Catalogue Entity</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Bundles defined and managed at the product level</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Evaluating the model where a bundle is a first-class catalogue object — a fixed composition of SKUs
              with its own identifier, pricing, and availability rules — managed by the product team
              and referenced as a target by the promotion engine rather than constructed within it.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-tag-multiple-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Bundle as a Promotion Rule</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Dynamic grouping and discounting within the promotion engine</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Assessing the model where bundles are constructed dynamically through promotion conditions —
              qualifying item sets matched at runtime with a corresponding discount applied —
              keeping bundle configuration entirely within the promotion domain
              and removing the dependency on catalogue structure.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-arrow-decision-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Cross-Domain Ownership</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Governance model when bundle spans product and promotion domains</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Investigating the governance and tooling implications when bundle composition is owned by the product domain
              while pricing incentives are governed by promotions —
              including synchronisation requirements, change management flows,
              and the operational surface area introduced by split ownership.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
const breadcrumbs = [
  { title: 'Promotions', to: '/promotions' },
  { title: 'Bundles' },
]
</script>
