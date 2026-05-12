<!-- src/components/promotions/ReportingDetailPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs :append-breadcrumbs="breadcrumbs" />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">{{ promotion?.name ?? 'Rule detail' }}</h1>
      <template #right>
        <v-btn variant="outlined" to="/promotions/reporting">Back to reporting</v-btn>
      </template>
    </ContentHeader>

    <!-- Summary stats -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card border elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">Total usages</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ promotion?.usageCount?.toLocaleString() ?? '—' }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card border elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">Completed orders</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ promotion?.completedOrders?.toLocaleString() ?? '—' }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search -->
    <TextInput
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search by customer name, order ID, voucher ID or coupon code"
      hide-details
      class="mb-4"
      :class="mobile ? '' : 'search-input'"
    />

    <!-- Filter row -->
    <div class="d-flex align-center flex-wrap filter-row">
      <v-select
        v-model="dateFilter"
        :items="dateFilterItems"
        item-title="title"
        item-value="value"
        label="Order created"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 175px"
      />
      <template v-if="dateFilter === 'custom'">
        <DatePicker v-model="customDateFrom" label="From" style="max-width: 175px" />
        <DatePicker v-model="customDateTo" label="To" style="max-width: 175px" />
      </template>
      <v-btn
        v-if="hasActiveFilters"
        variant="text"
        size="small"
        color="primary"
        @click="clearFilters"
      >
        <v-icon size="16" class="mr-1">mdi-close-circle</v-icon>
        Clear filters
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
import DatePicker from '../_common/DatePicker.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'

const route = useRoute()
const store = usePromotionsStore()
const { mobile } = useDisplay()

const orders = ref([])
const loading = ref(false)

const promotion = computed(() => store.items.find(p => p.id === route.params.id))

const breadcrumbs = computed(() => [
  { title: promotion.value?.name ?? String(route.params.id), disabled: true },
])

// ── Filter state ──────────────────────────────────────────────────────────────
const search = ref('')
const dateFilter = ref('any')
const customDateFrom = ref(null)
const customDateTo = ref(null)

const dateFilterItems = [
  { value: 'any',     title: 'Any date' },
  { value: 'last_7',  title: 'Last 7 days' },
  { value: 'last_14', title: 'Last 14 days' },
  { value: 'last_30', title: 'Last 30 days' },
  { value: 'custom',  title: 'Custom period' },
]

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' ||
  dateFilter.value !== 'any' ||
  !!customDateFrom.value || !!customDateTo.value
)

function clearFilters() {
  search.value = ''
  dateFilter.value = 'any'
  customDateFrom.value = null
  customDateTo.value = null
}

// ── Filtered orders ───────────────────────────────────────────────────────────
const filteredOrders = computed(() => {
  let result = [...orders.value]
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(o =>
      o.customerName.toLowerCase().includes(q) ||
      String(o.orderIncrementId).includes(q) ||
      (o.voucherId && String(o.voucherId).toLowerCase().includes(q)) ||
      (o.ruleCouponCode && o.ruleCouponCode.toLowerCase().includes(q))
    )
  }
  if (dateFilter.value !== 'any') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dateFilter.value === 'last_7' || dateFilter.value === 'last_14' || dateFilter.value === 'last_30') {
      const days = dateFilter.value === 'last_7' ? 7 : dateFilter.value === 'last_14' ? 14 : 30
      const cutoff = new Date(today)
      cutoff.setDate(cutoff.getDate() - days)
      result = result.filter(o => new Date(o.orderCreatedDate) >= cutoff)
    } else if (dateFilter.value === 'custom') {
      if (customDateFrom.value) result = result.filter(o => o.orderCreatedDate >= customDateFrom.value)
      if (customDateTo.value) result = result.filter(o => o.orderCreatedDate <= customDateTo.value)
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

<style scoped>
.search-input {
  max-width: 480px;
}

.filter-row {
  gap: 16px;
  padding: 20px 0;
}
</style>
