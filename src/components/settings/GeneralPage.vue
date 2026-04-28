<!-- src/components/settings/GeneralPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center flex-wrap mb-5 gap-3">
      <h1 class="text-h5 font-weight-bold">General</h1>
      <v-spacer />
      <v-btn color="primary" class="text-uppercase" :loading="saving" @click="save">Save</v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="6">

        <!-- Products & stock -->
        <div class="text-overline text-medium-emphasis mb-3">Products &amp; stock</div>
        <v-card border elevation="0" class="pa-5 mb-6">
          <div class="text-body-1 font-weight-bold mb-1">Gift SKU out-of-stock behaviour</div>
          <p class="text-caption text-medium-emphasis mb-5">
            Controls what happens to a gift rule when one of its gift SKUs goes out of stock.
          </p>

          <v-alert type="info" variant="tonal" density="compact" class="mb-5">
            Rules with a single gift SKU are always paused when that SKU goes out of stock.
          </v-alert>

          <div class="text-body-2 font-weight-medium mb-2">Rule with multiple gift SKUs</div>
          <v-radio-group v-model="form.giftOosMulti" density="compact" hide-details>
            <v-radio value="remove">
              <template #label>
                <div>
                  <div class="text-body-2">Remove the out-of-stock SKU</div>
                  <div class="text-caption text-medium-emphasis">The rule stays active with the remaining gift options.</div>
                </div>
              </template>
            </v-radio>
            <v-radio value="pause">
              <template #label>
                <div>
                  <div class="text-body-2">Pause the rule</div>
                  <div class="text-caption text-medium-emphasis">The whole promotion is suspended even if other gift SKUs are still available.</div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </v-card>

        <!-- Ineligible products -->
        <v-card border elevation="0" class="pa-5 mb-6">
          <div class="text-body-1 font-weight-bold mb-1">Products not eligible for promotions</div>
          <p class="text-caption text-medium-emphasis mb-5">
            Items matching any of these values are excluded from all promotion rules globally.
          </p>

          <v-combobox
            v-model="form.excludedCategories"
            label="Product categories"
            placeholder="Type and press Enter to add…"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
            class="mb-4"
          />

          <v-combobox
            v-model="form.excludedSkus"
            label="Product SKUs"
            placeholder="Type and press Enter to add…"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
            class="mb-4"
          />

          <v-combobox
            v-model="form.excludedProductTypes"
            label="Product types"
            placeholder="Type and press Enter to add…"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
          />
        </v-card>

        <!-- Prioritization & combinability -->
        <div class="text-overline text-medium-emphasis mb-3">Prioritization &amp; combinability</div>
        <v-card border elevation="0" class="pa-5 mb-6">
          <div class="text-body-1 font-weight-bold mb-1">Rule prioritization mode</div>
          <p class="text-caption text-medium-emphasis mb-5">
            Controls how promotion rules are prioritized and whether they can combine in a single cart.
          </p>

          <v-radio-group v-model="form.prioritizationMode" density="compact" hide-details>
            <v-radio value="manual">
              <template #label>
                <div>
                  <div class="text-body-2">Manual</div>
                  <div class="text-caption text-medium-emphasis">Stacking groups, processing order, and non-combinable rules are configured per rule.</div>
                </div>
              </template>
            </v-radio>
            <v-radio value="automatic">
              <template #label>
                <div>
                  <div class="text-body-2">Automatic</div>
                  <div class="text-caption text-medium-emphasis">Prioritization and combinability are resolved by the system. Stacking groups are disabled.</div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>

          <v-alert v-if="form.prioritizationMode === 'automatic'" type="info" variant="tonal" density="compact" class="mt-4">
            User gets the best sales rule based on cart items to always get the best value. All rules are non-combinable.
          </v-alert>
        </v-card>

        <!-- Accounting -->
        <div class="text-overline text-medium-emphasis mb-3">Accounting</div>
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
      Settings saved.
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const store = useSettingsStore()

const form = reactive({
  giftOosMulti: store.giftOosMulti,
  excludedCategories: [...store.excludedCategories],
  excludedSkus: [...store.excludedSkus],
  excludedProductTypes: [...store.excludedProductTypes],
  prioritizationMode: store.prioritizationMode,
  multiBuyFreePrice: store.multiBuyFreePrice,
  giftFreePrice: store.giftFreePrice,
  cartDiscountCalculation: store.cartDiscountCalculation,
})

const saving = ref(false)
const savedSnack = ref(false)

const breadcrumbs = [
  { title: 'Settings', disabled: true },
  { title: 'General', disabled: true },
]

async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  store.save({
    giftOosMulti: form.giftOosMulti,
    excludedCategories: form.excludedCategories,
    excludedSkus: form.excludedSkus,
    excludedProductTypes: form.excludedProductTypes,
    prioritizationMode: form.prioritizationMode,
    multiBuyFreePrice: form.multiBuyFreePrice,
    giftFreePrice: form.giftFreePrice,
    cartDiscountCalculation: form.cartDiscountCalculation,
  })
  saving.value = false
  savedSnack.value = true
}
</script>
