<!-- src/components/settings/AccountingPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center flex-wrap mb-5 gap-3">
      <h1 class="text-h5 font-weight-bold">Accounting</h1>
      <v-spacer />
      <v-btn color="primary" class="text-uppercase" :loading="saving" @click="save">Save</v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="text-body-1 font-weight-bold mb-1">Cart-scope discount calculation</div>
          <p class="text-caption text-medium-emphasis mb-5">
            Controls how discounts from cart-scoped rules are calculated and shown to the customer on the frontend.
          </p>

          <v-radio-group v-model="form.cartDiscountCalculation" density="compact" hide-details>
            <v-radio value="per_item">
              <template #label>
                <div>
                  <div class="text-body-2">Distribute per item</div>
                  <div class="text-caption text-medium-emphasis">
                    The discount is split proportionally across all eligible items. Each item shows its adjusted price.
                    Preferred for accurate per-line tax handling and itemised invoices.
                  </div>
                </div>
              </template>
            </v-radio>
            <v-radio value="cart_total" class="mt-3">
              <template #label>
                <div>
                  <div class="text-body-2">Single cart-level deduction</div>
                  <div class="text-caption text-medium-emphasis">
                    Items keep their original prices. The total discount appears as one "Promotions" line in the cart summary.
                    Simpler frontend display; tax is calculated before the deduction.
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>

          <v-alert
            v-if="form.cartDiscountCalculation === 'cart_total'"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            Tax is applied to original item prices. Verify this complies with local tax regulations before using in production.
          </v-alert>
        </v-card>

        <v-card border elevation="0" class="pa-5">
          <div class="text-body-1 font-weight-bold mb-1">Free product prices</div>
          <p class="text-caption text-medium-emphasis mb-5">
            Nominal accounting prices assigned to free items. Each rule type can have a
            different value for compliance purposes (typically €0.01).
          </p>

          <v-text-field
            v-model.number="form.multiBuyFreePrice"
            label="Multi-buy free item price"
            type="number"
            prefix="€"
            variant="outlined"
            density="compact"
            hint="Applied to free items in multi-buy rules"
            persistent-hint
            class="mb-4"
            style="max-width: 260px"
          />

          <v-text-field
            v-model.number="form.giftFreePrice"
            label="Gift free item price"
            type="number"
            prefix="€"
            variant="outlined"
            density="compact"
            hint="Applied to free items in gift rules"
            persistent-hint
            style="max-width: 260px"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="savedSnack" color="success" timeout="2500">
      Accounting settings saved.
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const store = useSettingsStore()

const form = reactive({
  multiBuyFreePrice: store.multiBuyFreePrice,
  giftFreePrice: store.giftFreePrice,
  cartDiscountCalculation: store.cartDiscountCalculation,
})

const saving = ref(false)
const savedSnack = ref(false)

const breadcrumbs = [
  { title: 'Settings', disabled: true },
  { title: 'Accounting', disabled: true },
]

async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  store.save({ multiBuyFreePrice: form.multiBuyFreePrice, giftFreePrice: form.giftFreePrice, cartDiscountCalculation: form.cartDiscountCalculation })
  saving.value = false
  savedSnack.value = true
}
</script>
