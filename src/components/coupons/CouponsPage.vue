<!-- src/components/coupons/CouponsPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-6 py-2">
      <h1 class="text-h5 font-weight-bold">Coupons</h1>
      <v-chip size="small" color="warning" variant="tonal" label class="ml-3">Exploring</v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      Evaluating the COMS-based coupon solution alongside alternative approaches to identify the most efficient and scalable configuration model for coupon management across markets.
    </p>

    <v-row>
      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-ticket-confirmation-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">COMS Integration</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Centralised coupon management via the COMS platform</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Assessing the COMS solution as the authoritative system for coupon issuance, validation, and lifecycle management —
              evaluating its configuration surface, API contract with the promotion engine,
              multi-market support, and the operational readiness required for adoption at scale.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-cog-transfer-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Native Promotion-Engine Coupons</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Coupon codes configured directly within the promotion rule engine</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Investigating the viability of handling coupon codes as a native trigger condition within the promotion engine —
              reducing external dependencies, simplifying the configuration model,
              and enabling marketing teams to manage coupon-backed rules
              within a single, unified interface without COMS coordination overhead.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-bullhorn-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Marketing Distribution Integration</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Connecting coupon issuance to marketing automation and CRM tooling</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Investigating integration points between the coupon system and existing marketing distribution tools —
              email platforms, CRM, loyalty programme engines, and campaign management systems —
              to enable targeted issuance without manual handoff, and to ensure coupon state
              is consistently reflected across all customer-facing channels.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-shield-check-outline" color="warning" size="28" class="mr-3" />
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold">Redemption Limits & Fraud Controls</span>
                  <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">Per-user limits, global caps, and abuse prevention mechanisms</div>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Evaluating the control mechanisms required to cap redemptions at both the global and per-customer level,
              detect misuse patterns, and enforce exclusivity constraints —
              and whether these controls are most reliably implemented within COMS,
              the promotion engine, or enforced at the checkout layer.
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
  { title: 'Coupons' },
]
</script>
