<!-- src/components/promotions/PromotionPlannerPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-6 py-2">
      <h1 class="text-h5 font-weight-bold">Promotion Planner</h1>
      <v-chip size="small" color="warning" variant="tonal" label class="ml-3">Exploring</v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      These features are under exploration. Share your feedback to help shape the direction.
    </p>

    <v-row>
      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-creation" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">AI Recommendations</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Smart suggestions based on your catalog, history, and market signals</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Smart suggestions based on your catalog and history, news, and current market situations.
              Surface promotion ideas tailored to seasonal trends, competitor activity, and past performance —
              with confidence scores and one-click apply to speed up rule creation.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-calendar-clock" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Promotion Planner</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Calendar-based campaign scheduling and planning</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Plan promotions across a visual calendar, manage campaign timelines, detect overlaps,
              and coordinate discounts across markets — before they go live.
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
  { title: 'Promotion Planner' },
]
</script>
