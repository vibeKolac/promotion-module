<!-- src/components/promotions/ReportingDetailPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center flex-wrap mb-5 gap-3">
      <h1 class="text-h5 font-weight-bold">{{ promotion?.name ?? 'Rule detail' }}</h1>
      <v-spacer />
      <v-btn variant="outlined" to="/promotions/reporting" class="text-uppercase">
        Back to reporting
      </v-btn>
    </div>

    <!-- Summary stats -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card border elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">Performance</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ promotion?.performance !== undefined ? `${promotion.performance}%` : '—' }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card border elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">Estimated Revenue</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ promotion?.revenue ?? '—' }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card border elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">Total usages</div>
          <div class="text-h6 font-weight-bold">
            {{ promotion?.usageCount?.toLocaleString() ?? '—' }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card border elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">Orders in export</div>
          <div class="text-h6 font-weight-bold">
            {{ filteredOrders.length }}
            <span v-if="hasActiveFilters" class="text-body-2 font-weight-regular text-medium-emphasis">/ {{ orders.length }}</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search -->
    <TextInput
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search by customer name or order ID"
      hide-details
      class="mb-4"
      :style="mobile ? '' : 'max-width: 480px'"
    />

    <!-- Filter bar -->
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <span class="text-caption text-medium-emphasis mr-1">Order type:</span>
      <v-chip
        v-for="t in availableOrderTypes"
        :key="t"
        :color="orderTypeFilter.includes(t) ? 'primary' : undefined"
        :variant="orderTypeFilter.includes(t) ? 'flat' : 'outlined'"
        size="small"
        style="cursor:pointer"
        @click="toggleOrderType(t)"
      >{{ t }}</v-chip>

      <v-divider v-if="!mobile" vertical class="mx-1" style="align-self:stretch; opacity:.3" />

      <SelectInput
        v-model="dateFilter"
        :data="dateFilterItems"
        label="Order created"
        hide-details
        style="max-width: 200px; min-width: 160px"
      />

      <v-btn
        v-if="hasActiveFilters"
        variant="text"
        size="small"
        color="primary"
        @click="clearFilters"
      >
        <v-icon size="16" class="mr-1">mdi-close-circle</v-icon>
        Clear filters
        <v-chip size="x-small" color="primary" class="ml-1">{{ activeFilterCount }}</v-chip>
      </v-btn>
    </div>

    <!-- Orders table -->
    <v-card border elevation="0">
      <div class="text-body-1 font-weight-bold pa-4 pb-0">Order detail</div>
      <v-data-table
        :headers="headers"
        :items="filteredOrders"
        :loading="loading"
        item-value="orderIncrementId"
        hover
      >
        <template #item.discountAmount="{ item }">
          <span v-if="item.discountAmount">{{ item.discountAmount.toFixed(2) }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #item.rowTotalInclTax="{ item }">
          {{ item.rowTotalInclTax.toFixed(2) }}
        </template>
        <template #item.rowTotalInclTaxAfterDiscount="{ item }">
          {{ item.rowTotalInclTaxAfterDiscount.toFixed(2) }}
        </template>
        <template #item.orderGrandTotal="{ item }">
          {{ item.orderGrandTotal.toFixed(2) }}
        </template>
        <template #item.ruleDiscount="{ item }">
          {{ item.ruleDiscount.toFixed(2) }}
        </template>
        <template #item.ruleBaseDiscount="{ item }">
          {{ item.ruleBaseDiscount.toFixed(2) }}
        </template>
        <template #item.voucherId="{ item }">
          <span v-if="item.voucherId">{{ item.voucherId }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #item.ruleCouponCode="{ item }">
          <span v-if="item.ruleCouponCode">{{ item.ruleCouponCode }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #item.giftPdk="{ item }">
          <span v-if="item.giftPdk">{{ item.giftPdk }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #item.giftName="{ item }">
          <span v-if="item.giftName">{{ item.giftName }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #item.giftPrice="{ item }">
          <span v-if="item.giftPrice !== ''">{{ item.giftPrice }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #no-data>
          <div class="text-center pa-8 text-medium-emphasis">No orders match the current filters</div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import axios from 'axios'
import { usePromotionsStore } from '../../stores/promotions'
import TextInput from '../_common/TextInput.vue'
import SelectInput from '../_common/SelectInput.vue'

const route = useRoute()
const store = usePromotionsStore()
const { mobile } = useDisplay()

const orders = ref([])
const loading = ref(false)

const promotion = computed(() => store.items.find(p => p.id === route.params.id))

const breadcrumbs = computed(() => [
  { title: 'Promotions', disabled: true },
  { title: 'Reporting', to: '/promotions/reporting' },
  { title: promotion.value?.name ?? route.params.id, disabled: true },
])

// ── Filter state ──────────────────────────────────────────────────────────────
const search = ref('')
const orderTypeFilter = ref([])
const dateFilter = ref('any')

const availableOrderTypes = computed(() => [...new Set(orders.value.map(o => o.orderType))].sort())

const dateFilterItems = [
  { value: 'any', title: 'Any date' },
  { value: 'last_30', title: 'Last 30 days' },
  { value: 'last_90', title: 'Last 90 days' },
  { value: 'this_year', title: 'This year' },
]

function toggleOrderType(t) {
  const idx = orderTypeFilter.value.indexOf(t)
  if (idx === -1) orderTypeFilter.value.push(t)
  else orderTypeFilter.value.splice(idx, 1)
}

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' ||
  orderTypeFilter.value.length > 0 ||
  dateFilter.value !== 'any'
)

const activeFilterCount = computed(() => {
  let n = 0
  if (search.value.trim()) n++
  if (orderTypeFilter.value.length) n++
  if (dateFilter.value !== 'any') n++
  return n
})

function clearFilters() {
  search.value = ''
  orderTypeFilter.value = []
  dateFilter.value = 'any'
}

// ── Filtered orders ───────────────────────────────────────────────────────────
const filteredOrders = computed(() => {
  let result = [...orders.value]
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(o =>
      o.customerName.toLowerCase().includes(q) ||
      String(o.orderIncrementId).includes(q)
    )
  }
  if (orderTypeFilter.value.length) {
    result = result.filter(o => orderTypeFilter.value.includes(o.orderType))
  }
  if (dateFilter.value !== 'any') {
    const now = new Date()
    if (dateFilter.value === 'last_30') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      result = result.filter(o => new Date(o.orderCreatedDate) >= cutoff)
    } else if (dateFilter.value === 'last_90') {
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      result = result.filter(o => new Date(o.orderCreatedDate) >= cutoff)
    } else if (dateFilter.value === 'this_year') {
      result = result.filter(o => new Date(o.orderCreatedDate).getFullYear() === now.getFullYear())
    }
  }
  return result
})

const headers = [
  { title: 'Order Type', key: 'orderType' },
  { title: 'Order Increment Id', key: 'orderIncrementId', sortable: true },
  { title: 'Customer Name', key: 'customerName' },
  { title: 'Order Created Date', key: 'orderCreatedDate', sortable: true },
  { title: 'Order Shipment Date', key: 'orderShipmentDate', sortable: true },
  { title: 'Order Close Date', key: 'orderCloseDate', sortable: true },
  { title: 'Row Total Incl Tax', key: 'rowTotalInclTax', sortable: true },
  { title: 'Quantity', key: 'quantity', sortable: true },
  { title: 'Discount Amount', key: 'discountAmount', sortable: true },
  { title: 'Row Total Incl Tax After Discount', key: 'rowTotalInclTaxAfterDiscount', sortable: true },
  { title: 'Order Grand Total', key: 'orderGrandTotal', sortable: true },
  { title: 'Voucher Id', key: 'voucherId' },
  { title: 'Rule Usage', key: 'ruleUsage', sortable: true },
  { title: 'Rule Discount', key: 'ruleDiscount', sortable: true },
  { title: 'Rule Base Discount', key: 'ruleBaseDiscount', sortable: true },
  { title: 'Rule Coupon Code', key: 'ruleCouponCode' },
  { title: 'Gift PDK', key: 'giftPdk' },
  { title: 'Gift Name', key: 'giftName' },
  { title: 'Gift Price', key: 'giftPrice' },
]

onMounted(async () => {
  loading.value = true
  try {
    if (!store.items.length) await store.fetchAll()
    const { data } = await axios.get(`/api/promotions/${route.params.id}/orders`)
    orders.value = data
  } finally {
    loading.value = false
  }
})
</script>
