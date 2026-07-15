<!-- src/components/promotions/PromotionForm.vue -->
<template>
  <v-container fluid class="pa-4 pa-sm-8 form-container">
    <Breadcrumbs :append-breadcrumbs="breadcrumbs" />

    <!-- Title + actions -->
    <div ref="titleActionsRef" class="d-flex flex-column flex-sm-row align-start align-sm-center mb-6 gap-3">
      <h1 class="text-h5 font-weight-bold">
        {{ isTemplateEdit ? 'Edit template' : (isEdit ? 'Edit promotion rule' : 'New promotion rule') }}
      </h1>
      <v-spacer class="d-none d-sm-flex" />
      <div class="action-btn-row flex-shrink-0">
        <v-btn variant="outlined" style="height: 48px" @click="openDiscardDialog">Discard</v-btn>
        <template v-if="isTemplateEdit">
          <v-btn color="success" style="height: 48px" :loading="saving" @click="openSaveConfirm('template')">Save template</v-btn>
        </template>
        <template v-else>
          <v-btn v-if="serbiaMode" variant="outlined" :loading="saving" data-testid="save-btn" style="height: 48px" @click="openSaveConfirm('draft')">Save as draft</v-btn>
          <v-btn-group v-else variant="outlined" divided style="height: 48px; --v-btn-border-color: rgba(0,0,0,0.87)">
            <v-btn :loading="saving" data-testid="save-btn" style="border-color: rgba(0,0,0,0.87)" @click="openSaveConfirm('draft')">Save as draft</v-btn>
            <v-menu location="bottom end">
              <template #activator="{ props: menuProps }">
                <v-btn v-bind="menuProps" icon="mdi-chevron-down" style="border-color: rgba(0,0,0,0.87)" />
              </template>
              <v-list density="compact" min-width="220">
                <v-list-item prepend-icon="mdi-file-document-plus-outline" title="Save and create template" @click="openSaveConfirm('template_from_rule')" />
              </v-list>
            </v-menu>
          </v-btn-group>
          <v-btn
            color="success"
            style="height: 48px"
            :loading="saving"
            :disabled="!draft.startDate"
            @click="openSaveConfirm('activate')"
          >
            <v-icon start :icon="isFutureDate(draft.startDate) ? 'mdi-calendar-clock' : 'mdi-lightning-bolt-outline'" />
            {{ dynamicActivateLabel }}
          </v-btn>
        </template>
      </div>
    </div>

    <!-- Template metadata (template edit mode only) -->
    <v-row v-if="isTemplateEdit" class="mb-5">
      <v-col cols="12" md="8">
        <v-card border elevation="0" class="pa-5">
          <div class="text-body-1 font-weight-bold mb-4">Template details</div>
          <TextInput v-model="tplLabel" label="Template name *" class="mb-3" />
          <TextInput v-model="tplDescription" label="Description" />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-card border elevation="0" class="pa-5">
          <div class="text-body-1 font-weight-bold mb-4">Basic information</div>

          <TextInput
            v-model="draft.name"
            label="Rule name *"
            :error-messages="validationErrors.name ? [validationErrors.name] : []"
            class="mb-3"
          />

          <v-textarea
            v-model="draft.description"
            label="Internal Description"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hint="What the promotion does (for internal use only)"
            persistent-hint
            class="mb-3"
          />

          <v-autocomplete
            v-if="!serbiaMode"
            :model-value="draft.internalTags"
            :items="internalTagsStore.items"
            :loading="internalTagsStore.loading || creatingInternalTag"
            item-title="name"
            item-value="id"
            multiple
            chips
            closable-chips
            chip-color="grey-darken-1"
            variant="outlined"
            density="compact"
            label="Internal tags"
            placeholder="Select or create tags…"
            hide-details
            no-data-text="Type a name to create a new tag"
            v-model:search="newInternalTagName"
            class="mb-3"
            @update:model-value="draft.internalTags = $event"
          >
            <template #prepend-item>
              <v-list-item
                v-if="newInternalTagName.trim() && !internalTagExists"
                prepend-icon="mdi-plus-circle-outline"
                :title="`Create '${newInternalTagName.trim()}'`"
                color="primary"
                @click="createInternalTag"
              />
            </template>
          </v-autocomplete>

          <v-row dense>
            <v-col cols="6">
              <DatePicker
                v-model="draft.startDate"
                label="Start date *"
                :min="todayIso"
              />
            </v-col>
            <v-col cols="6">
              <DatePicker
                v-model="draft.endDate"
                label="End date *"
                :min="todayIso"
              />
            </v-col>
          </v-row>

          <!-- Schedule pausing -->
          <div v-if="!uxTestMode" class="mt-3">
            <v-checkbox
              v-model="draft.pauseScheduled"
              density="compact"
              hide-details
              color="warning"
              class="mb-1"
              :disabled="!draft.startDate || !draft.endDate"
            >
              <template #label>
                <span class="mr-2">Schedule rule pausing</span>
                <v-chip size="x-small" color="warning" variant="tonal" label>Exploring</v-chip>
                <span v-if="!draft.startDate || !draft.endDate" class="text-caption text-medium-emphasis ml-2">Requires start and end date</span>
              </template>
            </v-checkbox>
            <template v-if="draft.pauseScheduled">
              <v-alert
                v-if="pauseAdjustWarning"
                type="warning"
                variant="tonal"
                density="compact"
                icon="mdi-clock-alert-outline"
                class="mb-3 text-caption"
                closable
                @click:close="pauseAdjustWarning = false"
              >
                Rule dates have changed — please review the scheduled pause period to ensure it still falls within the active range.
              </v-alert>
              <v-row dense class="mt-2">
                <v-col cols="6">
                  <DatePicker
                    v-model="draft.pauseStart"
                    label="Pause from *"
                    :allowed-dates="pauseStartAllowedDates"
                    :error-messages="pauseErrors.pauseStart"
                  />
                </v-col>
                <v-col cols="6">
                  <DatePicker
                    v-model="draft.pauseEnd"
                    label="Pause until *"
                    :allowed-dates="pauseEndAllowedDates"
                    :error-messages="pauseErrors.pauseEnd"
                  />
                </v-col>
              </v-row>
              <div class="text-caption text-medium-emphasis mt-1">
                While in Active status, the rule will be automatically paused during this period.
                Pause must fall within the rule's start and end date.
              </div>
            </template>
          </div>

          <!-- Channels -->
          <div v-if="!serbiaMode" class="mt-4">
            <div class="d-flex align-center gap-1 mb-2">
              <span class="text-caption font-weight-bold text-medium-emphasis">SALES CHANNELS *</span>
              <HelpTooltip text="Choose which sales channels this promotion applies to. At least one channel must be selected." />
            </div>
            <v-checkbox
              v-for="ch in channelOptions"
              :key="ch.value"
              :model-value="draft.channels.includes(ch.value)"
              :label="ch.title"
              :prepend-icon="ch.icon"
              density="compact"
              hide-details
              color="primary"
              class="mb-1"
              @update:model-value="val => {
                draft.channels = val
                  ? [...draft.channels, ch.value]
                  : draft.channels.filter(c => c !== ch.value)
                if (draft.channels.length) delete validationErrors.value.channels
              }"
            />
            <div v-if="validationErrors.channels" class="text-caption text-error mt-1">
              {{ validationErrors.channels }}
            </div>
          </div>

          <v-row dense class="mt-4">
            <v-col cols="12">
              <div class="d-flex align-center gap-1 mb-1">
                <span class="text-caption font-weight-bold text-medium-emphasis">RULE TYPE</span>
                <HelpTooltip :text="serbiaMode ? 'Discount — apply a fixed amount or percentage off the cart total.' : 'Discount — fixed or % off cart/items. Step Discount — tiered discount that grows with spend. Multi-buy — buy X get Y free. Gift — give a free product when a threshold is met.'" />
              </div>
              <SelectInput
                v-model="draft.type"
                :data="ruleTypeItems"
                label="Rule type *"
                hide-details="auto"
              />
            </v-col>
          </v-row>

        </v-card>

        <!-- Discount configuration (orange) -->
        <v-card v-if="draft.type === 'discount'" border elevation="0" class="pa-6 mt-6">
          <div class="d-flex align-center mb-3">
            <v-icon color="orange-darken-2" size="18" class="mr-2">mdi-tag-outline</v-icon>
            <span class="text-body-1 font-weight-bold text-orange-darken-2">Discount Configuration</span>
            <HelpTooltip :text="serbiaMode ? 'Applies a fixed amount or percentage discount to the cart total.' : 'Applies a fixed amount or percentage discount to the cart total or to each qualifying item. Use cart scope for basket-wide promotions, item scope for per-product discounts.'" class="ml-1" />
          </div>
          <div v-if="!serbiaMode" class="mb-4">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">RULE SCOPE</div>
            <v-btn-toggle v-model="draft.scope" mandatory density="compact" variant="outlined" color="primary" class="mb-1">
              <v-btn value="cart" size="small" prepend-icon="mdi-cart-outline">Cart</v-btn>
              <v-btn value="item" size="small" prepend-icon="mdi-package-variant">Item</v-btn>
            </v-btn-toggle>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ draft.scope === 'cart' ? 'Discount and conditions apply to the whole cart.' : 'Discount and conditions apply per item / line.' }}
            </div>
          </div>
          <v-row dense>
            <v-col cols="8">
              <NumberInput
                v-model="draft.value"
                label="Discount amount *"
                :error-messages="validationErrors.value ? [validationErrors.value] : []"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="4">
              <SelectInput v-model="draft.amountType" :data="amountTypeItems" label="Amount type" hide-details="auto" />
            </v-col>
          </v-row>
        </v-card>

        <!-- Step Discount configuration (green) -->
        <v-card v-if="draft.type === 'step_discount'" border elevation="0" class="pa-6 mt-6">
          <div class="d-flex align-center mb-4">
            <v-icon color="green-darken-2" size="18" class="mr-2">mdi-stairs</v-icon>
            <span class="text-body-1 font-weight-bold text-green-darken-2">Step Discount Configuration</span>
            <HelpTooltip text="Tiered discount that increases with spend or quantity. Define multiple steps — each step unlocks a bigger discount when the threshold is reached." class="ml-1" />
          </div>
          <div v-if="!serbiaMode" class="mb-4">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">RULE SCOPE</div>
            <v-btn-toggle v-model="draft.scope" mandatory density="compact" variant="outlined" color="primary" class="mb-1">
              <v-btn value="cart" size="small" prepend-icon="mdi-cart-outline">Cart</v-btn>
              <v-btn value="item" size="small" prepend-icon="mdi-package-variant">Item</v-btn>
            </v-btn-toggle>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ draft.scope === 'cart' ? 'Discount and conditions apply to the whole cart.' : 'Discount and conditions apply per item / line.' }}
            </div>
          </div>

          <v-row dense class="mb-3">
            <v-col cols="4">
              <SelectInput
                v-model="draft.stepType"
                :data="[{ value: 'SPENT', title: 'Amount spent (€)' }, { value: 'QTY', title: 'Quantity' }]"
                label="Step type"
              />
            </v-col>
            <v-col cols="4">
              <NumberInput
                v-model.number="draft.stepValue"
                :label="draft.stepType === 'QTY' ? 'Every (qty)' : 'Every (€)'"
                :help-text="draft.stepType === 'QTY' ? 'e.g. 20 items' : 'e.g. €50'"
              />
            </v-col>
            <v-col cols="4">
              <NumberInput v-model.number="draft.stepMaxSteps" label="Max steps" help-text="Empty = unlimited" />
            </v-col>
          </v-row>

          <v-row v-if="!draft.steps.length" dense class="mb-3">
            <v-col cols="6">
              <NumberInput
                v-model="draft.value"
                label="Discount per step *"
                :error-messages="validationErrors.value ? [validationErrors.value] : []"
              />
            </v-col>
            <v-col cols="6">
              <SelectInput v-model="draft.amountType" :data="amountTypeItems" label="Amount type" />
            </v-col>
          </v-row>

          <SelectInput
            v-if="draft.scope === 'item'"
            v-model="draft.stepApplyTo"
            :data="[{ value: 'all', title: 'All items' }, { value: 'cheapest', title: 'Cheapest item only' }]"
            label="Apply discount on"
            class="mb-4"
          />

          <div class="text-caption font-weight-bold text-medium-emphasis mb-2">DISCOUNT TIERS</div>
          <StepDiscountEditor
            v-model="draft.steps"
            :step-type="draft.stepType"
            :amount-type="draft.amountType"
            :step-value="draft.stepValue || null"
            :max-steps="draft.stepMaxSteps || null"
          />

        </v-card>

        <!-- Multi-buy configuration (blue) -->
        <v-card v-if="draft.type === 'multi_buy'" border elevation="0" class="pa-6 mt-6">
          <div class="d-flex align-center mb-3">
            <v-icon color="blue-darken-2" size="18" class="mr-2">mdi-cart-plus</v-icon>
            <span class="text-body-1 font-weight-bold text-blue-darken-2">Multi-buy Configuration</span>
            <HelpTooltip text="Buy X get Y free — customer buys the specified quantity and receives a set number of items free. Conditions define which products qualify as the 'buy' items." class="ml-1" />
          </div>
          <v-row dense class="mb-3">
            <v-col cols="6">
              <NumberInput v-model.number="draft.multiBuyQty" label="Buy quantity *" help-text="Items customer must buy" />
            </v-col>
            <v-col cols="6">
              <NumberInput v-model.number="draft.multiFreeQty" label="Free quantity *" help-text="Items given free" />
            </v-col>
          </v-row>
          <v-row dense class="mb-3">
            <v-col cols="6">
              <v-select
                v-model="draft.multiSelectionMode"
                :items="[{ value: 'CHEAPEST', title: 'Cheapest items free' }, { value: 'MOST_EXPENSIVE', title: 'Most expensive items free' }]"
                item-value="value"
                item-title="title"
                label="Free item selection"
                variant="outlined"
                density="compact"
              >
                <template #item="{ item, props: itemProps }">
                  <v-list-item v-bind="itemProps" :title="undefined">
                    <template #title>
                      <span>{{ item.raw.title }}</span>
                      <v-chip v-if="item.raw.value === 'MOST_EXPENSIVE'" size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="6">
              <NumberInput v-model.number="draft.multiMaxSteps" label="Max steps" help-text="0 = unlimited" />
            </v-col>
          </v-row>
          <div class="d-flex align-center gap-2 mt-3">
            <v-icon size="16" color="medium-emphasis">mdi-calculator</v-icon>
            <span class="text-caption text-medium-emphasis">Free item accounting price</span>
            <v-chip size="small" color="primary" variant="tonal">€{{ settingsStore.multiBuyFreePrice }}</v-chip>
            <a class="section-link ml-1" @click="openLeaveDialog(`${basePath}/settings/accounting`)">
              Configure in {{ serbiaMode ? 'Global' : 'General' }} Section
              <v-icon size="14" class="ml-1">mdi-open-in-new</v-icon>
            </a>
          </div>
        </v-card>

        <!-- Gift trigger configuration (purple) -->
        <v-card v-if="draft.type === 'gift'" border elevation="0" class="pa-6 mt-6">
          <div class="d-flex align-center mb-3">
            <v-icon color="purple-darken-2" size="18" class="mr-2">mdi-gift</v-icon>
            <span class="text-body-1 font-weight-bold text-purple-darken-2">Gift Configuration</span>
            <HelpTooltip text="Automatically adds a free gift product to the cart when a spend or quantity threshold is reached. The gift item is priced at the configured accounting price for reporting." class="ml-1" />
          </div>
          <div v-if="!serbiaMode" class="mb-4">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">RULE SCOPE</div>
            <v-btn-toggle v-model="draft.scope" mandatory density="compact" variant="outlined" color="primary" class="mb-1">
              <v-btn value="cart" size="small" prepend-icon="mdi-cart-outline">Cart</v-btn>
              <v-btn value="item" size="small" prepend-icon="mdi-package-variant">Item</v-btn>
            </v-btn-toggle>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ draft.scope === 'cart' ? 'Discount and conditions apply to the whole cart.' : 'Discount and conditions apply per item / line.' }}
            </div>
          </div>
          <v-row dense>
            <v-col cols="5">
              <SelectInput
                v-model="draft.giftStepType"
                :data="[{ value: 'SPENT', title: 'Amount spent' }, { value: 'QTY', title: 'Quantity' }]"
                label="Trigger type"
              />
            </v-col>
            <v-col cols="4">
              <NumberInput v-model="draft.giftStepValue" label="Threshold" />
            </v-col>
            <v-col cols="3">
              <NumberInput v-model="draft.giftMaxSteps" label="Repeat limit" />
            </v-col>
          </v-row>
          <div class="d-flex align-center gap-2 mt-3">
            <v-icon size="16" color="medium-emphasis">mdi-calculator</v-icon>
            <span class="text-caption text-medium-emphasis">Gift item accounting price</span>
            <v-chip size="small" color="purple" variant="tonal">€{{ settingsStore.giftFreePrice }}</v-chip>
            <a class="section-link ml-1" @click="openLeaveDialog(`${basePath}/settings/accounting`)">
              Configure in {{ serbiaMode ? 'Global' : 'General' }} Section
              <v-icon size="14" class="ml-1">mdi-open-in-new</v-icon>
            </a>
          </div>
          <v-divider class="my-4" />
          <GiftItemsSection v-model="draft.gifts" />
          <ConflictWarningBanner :conflicts="giftConflicts" />
        </v-card>

        <!-- Conditions -->
        <v-card border elevation="0" class="pa-6 mt-6">
          <ConditionsEditor
            v-model="draft.conditions"
            :scope="draft.scope"
            :title="serbiaMode ? 'Conditions' : 'Targeting conditions'"
            :help-text="serbiaMode ? 'Define the condition this rule applies to.' : 'Filter which products, customers, or cart state this rule applies to. All conditions in a group must match (AND). Groups are evaluated with OR between them.'"
            :show-preset="!serbiaMode"
          >
            <template #empty>No conditions set — this rule applies to all products.</template>
          </ConditionsEditor>

          <ReachEstimateBar v-if="!uxTestMode" :conditions="draft.conditions" :scope="draft.scope" class="mt-3" />

          <v-dialog v-model="overflowDialog" max-width="420">
            <v-card>
              <v-card-title class="text-body-1 font-weight-bold pa-5 pb-3">{{ overflowInfo.label }}</v-card-title>
              <v-card-text class="pa-5 pt-0">
                <div class="d-flex flex-wrap" style="gap: 8px">
                  <v-chip v-for="val in overflowInfo.values" :key="val" size="small" variant="tonal" color="grey-darken-1" label>{{ val }}</v-chip>
                </div>
              </v-card-text>
              <v-card-actions class="pa-4 pt-0">
                <v-spacer />
                <v-btn variant="text" @click="overflowDialog = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- Validation feedback -->
          <template v-if="conditionValidation.warnings.length || conditionValidation.suggestions.length">
            <v-alert
              v-if="conditionValidation.warnings.length"
              type="warning"
              variant="tonal"
              density="compact"
              class="mt-3"
            >
              <ul class="ma-0 pl-4">
                <li v-for="w in conditionValidation.warnings" :key="w">{{ w }}</li>
              </ul>
            </v-alert>
            <v-alert
              v-if="conditionValidation.suggestions.length"
              color="purple"
              variant="tonal"
              density="compact"
              icon="mdi-lightbulb"
              class="mt-2"
            >
              <ul class="ma-0 pl-4">
                <li v-for="s in conditionValidation.suggestions" :key="s">{{ s }}</li>
              </ul>
            </v-alert>
          </template>
        </v-card>

        <!-- Description and Action Labels -->
        <v-card border elevation="0" class="pa-6 mt-6">
          <div class="text-body-1 font-weight-bold mb-4">{{ serbiaMode ? 'Description' : 'Description and Action Labels' }}</div>
          <div class="text-caption font-weight-bold text-medium-emphasis mb-3">CUSTOMER-FACING DESCRIPTION</div>
          <TextInput
            v-model="draft.promotionTitle"
            label="Promotion title"
            help-text="Short headline shown to customers (e.g. '20% off Vichy')"
            class="mb-3"
          />
          <v-textarea
            v-model="draft.promotionText"
            label="Promotion text"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hint="Main description displayed on the storefront"
            persistent-hint
            class="mb-3"
          />
          <v-textarea
            v-model="draft.promotionLegal"
            label="Promotion legal description"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hint="Terms and conditions, fine print"
            persistent-hint
            class="mb-6"
          />
          <template v-if="!serbiaMode">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-3">ACTION LABELS</div>
            <v-autocomplete
              :model-value="draft.tags"
              :items="tagsStore.items"
              :loading="tagsStore.loading || creatingTag"
              item-title="name"
              item-value="id"
              multiple
              chips
              closable-chips
              chip-color="grey-darken-1"
              variant="outlined"
              density="compact"
              placeholder="Select existing or type a name to create new…"
              hint="Select from existing labels or type a new name and pick 'Create' to add it"
              persistent-hint
              no-data-text="Type a name to create a new label"
              v-model:search="newTagName"
              @update:model-value="draft.tags = $event"
            >
              <template #prepend-item>
                <v-list-item
                  v-if="newTagName.trim() && !tagExists"
                  prepend-icon="mdi-plus-circle-outline"
                  :title="`Create '${newTagName.trim()}'`"
                  color="primary"
                  @click="createTag"
                />
              </template>
            </v-autocomplete>
          </template>
        </v-card>

        <v-card v-if="!serbiaMode" border elevation="0" class="pa-5 mb-4 mt-6">
          <div class="d-flex align-center mb-1">
            <div class="text-body-1 font-weight-bold">Usage limits</div>
            <HelpTooltip text="Cap how many times this rule can fire. Per-customer limit prevents one shopper from using the same discount repeatedly. Total cap protects budget across all customers." class="ml-1" />
            <v-spacer />
            <v-switch v-model="draft.usageLimitsEnabled" density="compact" hide-details color="primary" />
          </div>
          <p class="text-caption text-medium-emphasis" :class="draft.usageLimitsEnabled ? 'mb-4' : 'mb-0'">
            Restrict how many times this rule can be applied.
          </p>
          <template v-if="draft.usageLimitsEnabled">
            <v-text-field
              v-if="draft.type === 'discount'"
              v-model.number="draft.maxUsagePerCustomer"
              label="Max usages per customer"
              type="number"
              min="1"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-3"
              placeholder="Unlimited"
            />
            <v-text-field
              v-model.number="draft.maxUsagePerRule"
              label="Max usages per rule (total)"
              type="number"
              min="1"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="Unlimited"
            />
          </template>
        </v-card>

        <!-- Reservation -->
        <v-card v-if="!serbiaMode" border elevation="0" class="pa-5 mb-4 mt-6">
          <div class="d-flex align-center mb-1">
            <div class="text-body-1 font-weight-bold">Allow for reservations</div>
            <HelpTooltip text="When enabled, this promotion rule also applies to orders placed as pharmacy reservations (click &amp; collect). Disable if the discount should only be valid for immediate online purchases." class="ml-1" />
            <v-spacer />
            <v-switch v-model="draft.reservationAllowed" density="compact" hide-details color="primary" />
          </div>
          <p class="text-caption text-medium-emphasis mb-0">
            Allow this rule to be applied on pharmacy reservations.
          </p>
        </v-card>

        <!-- ERP Voucher ID -->
        <v-card border elevation="0" class="pa-5 mb-4" :class="{ 'mt-6': serbiaMode }">
          <div class="d-flex align-center mb-1">
            <v-icon size="18" class="mr-2 card-section-icon">mdi-link-variant</v-icon>
            <span class="text-body-1 font-weight-bold">{{ serbiaMode ? 'ERP Promotion ID' : 'ERP Link' }}</span>
            <HelpTooltip :text="serbiaMode ? 'Enter the ERP promotion ID to link this rule for accounting reconciliation and reporting.' : 'Link this rule to an ERP voucher entry for accounting reconciliation and reporting.'" class="ml-1" />
          </div>
          <p class="text-caption text-medium-emphasis mb-3">
            {{ serbiaMode ? 'Connect this rule to an ERP promotion ID for accounting reconciliation.' : 'Connect this rule to an ERP voucher entry for accounting reconciliation.' }}
          </p>
          <TextInput
            v-if="serbiaMode"
            v-model="draft.erpId"
            label="ERP promotion ID"
            placeholder="e.g. 7631"
          />
          <v-autocomplete
            v-else
            v-model="draft.erpId"
            :items="erpEntriesStore.items"
            :loading="erpEntriesStore.loading"
            item-value="id"
            :item-title="entry => `${entry.id} — ${entry.name}`"
            label="ERP entry"
            variant="outlined"
            density="compact"
            clearable
            hide-details="auto"
            placeholder="Search by ID or name…"
            no-data-text="No matching ERP entries"
            prepend-inner-icon="mdi-database-search-outline"
          >
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" :title="undefined">
                <template #prepend>
                  <v-chip size="x-small" variant="flat" label class="mr-2 font-weight-bold erp-chip">
                    {{ item.raw.id }}
                  </v-chip>
                </template>
                <v-list-item-title class="text-body-2">{{ item.raw.name }}</v-list-item-title>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <v-chip size="small" variant="flat" label class="mr-1 erp-chip">{{ item.raw.id }}</v-chip>
              <span class="text-body-2">{{ item.raw.name }}</span>
            </template>
          </v-autocomplete>
        </v-card>

        <!-- Coupon -->
        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="d-flex align-center mb-1">
            <v-icon size="18" class="mr-2 card-section-icon">mdi-ticket-percent-outline</v-icon>
            <span class="text-body-1 font-weight-bold">Coupon</span>
            <HelpTooltip text="Attach a coupon code so customers must enter it at checkout to activate this promotion." class="ml-1" />
            <v-chip v-if="!uxTestMode" size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
          </div>
          <p class="text-caption text-medium-emphasis mb-3">
            Require customers to enter a coupon code to unlock this promotion.
          </p>

          <TextInput
            v-if="serbiaMode"
            v-model="draft.couponId"
            label="Coupon code"
            placeholder="e.g. SUMMER20"
          />
          <template v-else>
            <div class="d-flex align-center mb-2" style="gap: 8px">
              <v-icon size="20" color="medium-emphasis">mdi-information-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">No coupon is linked to this promotion.</span>
            </div>
            <a
              href="#"
              class="section-link"
              @click.prevent="openLeaveDialog(`${basePath}/coupons`)"
            >
              Manage coupon codes
              <v-icon size="14" class="ml-1">mdi-open-in-new</v-icon>
            </a>
          </template>
        </v-card>

        <template v-if="!serbiaMode">
          <template v-if="settingsStore.prioritizationMode === 'automatic'">
            <v-card border elevation="0" class="pa-5 mb-4">
              <div class="d-flex align-center gap-2 mb-2">
                <div class="text-body-1 font-weight-bold">Prioritization &amp; combinability</div>
                <v-chip size="x-small" color="default" variant="tonal" label>Auto</v-chip>
              </div>
              <v-alert color="grey" variant="tonal" density="compact">
                User gets the best sales rule based on cart items to always get the best value. All rules are non-combinable.
              </v-alert>
            </v-card>
          </template>
          <template v-else>
            <v-card border elevation="0" class="pa-5 mb-4">
              <div class="d-flex align-center mb-4">
                <span class="text-body-1 font-weight-bold">Priority group</span>
                <HelpTooltip text="Groups rules that can stack together. Rules in the same group compete with each other; rules in different groups can combine. Assign a group to control which promotions apply together at checkout." class="ml-1" />
              </div>
              <StackingGroupSelect v-model="draft.stackingGroupId" />
            </v-card>

            <v-card border elevation="0" class="pa-5 mb-4">
              <div class="d-flex align-center mb-4">
                <span class="text-body-1 font-weight-bold">Processing order</span>
                <HelpTooltip text="Controls which rule fires first when multiple rules apply to the same cart. Lower priority number = fires first." class="ml-1" />
                <v-chip v-if="processingOrderRef?.count" size="x-small" variant="tonal" color="grey-darken-1" label class="ml-2">{{ processingOrderRef.count }} promotions</v-chip>
              </div>
              <ProcessingOrderSelect
                ref="processingOrderRef"
                :stacking-group-id="draft.stackingGroupId"
                :priority="draft.priority"
                :current-name="draft.name"
                @update:priority="draft.priority = $event"
              />
            </v-card>

            <v-card border elevation="0" class="pa-5 mb-4">
              <div class="d-flex align-center mb-1">
                <span class="text-body-1 font-weight-bold">Non-combinable rules</span>
                <HelpTooltip text="Rules listed here cannot be applied together with this rule. If two matching rules conflict, only one will apply based on processing order." class="ml-1" />
              </div>
              <p class="text-caption text-medium-emphasis mb-4">
                Rules and groups listed here cannot apply together with this rule in the same cart.
              </p>
              <NonCombinableRulesSection v-model="draft.nonCombinableRules" :stacking-group-id="draft.stackingGroupId" />
            </v-card>
          </template>
        </template>

      </v-col>

      <v-col v-if="!serbiaMode" cols="12" md="4" class="d-none d-md-block">
        <div class="preview-sticky">
          <v-card border elevation="0" class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="18">mdi-eye-outline</v-icon>
              <span class="text-body-2 font-weight-bold ml-2">Live Preview</span>
            </div>
            <v-alert border="start" color="grey" variant="tonal" density="compact" icon="mdi-text-box-check-outline" class="text-caption">
              <template v-if="ruleDescriptionSegments">
                <template v-for="(seg, i) in ruleDescriptionSegments" :key="i">
                  <span v-if="seg.type === 'text'">{{ seg.text }}</span>
                  <v-chip
                    v-else
                    size="small"
                    variant="tonal"
                    color="grey-darken-1"
                    label
                    class="mx-1 overflow-chip"
                    @click="openOverflow(seg)"
                  >or {{ seg.count }} more</v-chip>
                </template>
              </template>
              <span v-else class="text-medium-emphasis">Start filling in the rule — a description will appear here as you configure it.</span>
            </v-alert>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <v-snackbar :model-value="!!saveError" color="error" timeout="6000" location="top" @update:model-value="saveError = null">
      {{ saveError }}
      <template #actions>
        <v-btn variant="text" @click="saveError = null">Dismiss</v-btn>
      </template>
    </v-snackbar>


    <!-- Template picker dialog -->
    <v-dialog v-model="templatePickerOpen" max-width="680" scrollable>
      <v-card>
        <v-card-title class="text-h6 pa-5 pb-3 d-flex align-center gap-3">
          <span>Choose a template</span>
          <v-spacer />
          <v-btn icon="mdi-close" size="x-small" variant="text" @click="templatePickerOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <div class="d-flex gap-3 mb-4">
            <v-text-field
              v-model="tplPickerSearch"
              placeholder="Search templates…"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="flex: 1"
            />
            <v-select
              v-model="tplPickerType"
              :items="tplPickerTypeItems"
              item-title="label"
              item-value="value"
              label="Type"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              style="max-width: 180px"
            />
          </div>
          <div v-if="filteredPickerTemplates.length" class="d-flex flex-column gap-2">
            <v-card
              v-for="tpl in filteredPickerTemplates"
              :key="tpl.id"
              border
              elevation="0"
              class="pa-4 tpl-picker-card"
              @click="applyPickerTemplate(tpl)"
            >
              <div class="d-flex align-center gap-3">
                <v-avatar :color="tplTypeColor(tpl.ruleType)" variant="tonal" size="36">
                  <v-icon :color="tplTypeColor(tpl.ruleType)" size="20">{{ tplTypeIcon(tpl.ruleType) }}</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-bold">{{ tpl.label }}</div>
                  <div class="text-caption text-medium-emphasis">{{ tpl.description }}</div>
                </div>
                <v-icon color="primary" size="20">mdi-arrow-right</v-icon>
              </div>
            </v-card>
          </div>
          <v-alert v-else color="grey" variant="tonal" density="compact">No templates match.</v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Save as template dialog -->
    <DialogCard v-model="templateDialogOpen" max-width="480">
      <template #title>Create template from rule</template>
      <v-alert color="grey" variant="tonal" density="compact" class="mb-4" icon="mdi-information-outline">
        The rule has been saved. Fill in the template details below.
      </v-alert>
      <TextInput v-model="templateLabel" label="Template name *" class="mb-3" />
      <TextInput v-model="templateDescription" label="Description" />
      <template #actions>
        <v-btn variant="text" @click="templateDialogOpen = false">Discard</v-btn>
        <v-btn
          color="success"
          :loading="creatingTemplate"
          :disabled="!templateLabel.trim()"
          @click="confirmCreateTemplate"
        >
          Create template
        </v-btn>
      </template>
    </DialogCard>

    <v-snackbar v-model="templateCreatedSnack" color="success" timeout="3000">
      Template "{{ templateLabel }}" created successfully.
    </v-snackbar>

    <!-- Leave section dialog -->
    <LeaveDialog
      v-model="leaveDialogOpen"
      @cancel="cancelLeave"
      @leave="leaveWithoutSaving"
    />

    <!-- Save confirm dialog -->
    <DialogCard v-model="saveConfirmOpen" max-width="400">
      <template #title>{{ saveConfirmTitle }}</template>
      <p class="text-body-2 text-medium-emphasis">{{ saveConfirmBody }}</p>
      <template #actions>
        <v-btn variant="text" @click="saveConfirmOpen = false">Cancel</v-btn>
        <v-btn color="success" :loading="saving" @click="doConfirmedSave">Confirm</v-btn>
      </template>
    </DialogCard>

    <!-- Sticky bottom bar — visible once title buttons scroll out of view -->
    <Transition name="slide-up">
      <div v-if="stickyBarVisible && !serbiaMode" class="sticky-save-bar">
      <div class="sticky-save-bar__inner">
        <v-btn variant="outlined" class="flex-shrink-0" style="height: 48px" @click="openDiscardDialog">Discard</v-btn>
        <template v-if="isTemplateEdit">
          <v-btn color="success" class="flex-shrink-0" style="height: 48px" :loading="saving" @click="openSaveConfirm('template')">Save template</v-btn>
        </template>
        <template v-else>
          <v-btn v-if="serbiaMode" variant="outlined" class="flex-shrink-0" :loading="saving" style="height: 48px" @click="openSaveConfirm('draft')">Save as draft</v-btn>
          <v-btn-group v-else variant="outlined" divided class="flex-shrink-0" style="height: 48px; --v-btn-border-color: rgba(0,0,0,0.87)">
            <v-btn :loading="saving" style="border-color: rgba(0,0,0,0.87)" @click="openSaveConfirm('draft')">Save as draft</v-btn>
            <v-menu location="top end">
              <template #activator="{ props: menuProps }">
                <v-btn v-bind="menuProps" icon="mdi-chevron-down" style="border-color: rgba(0,0,0,0.87)" />
              </template>
              <v-list density="compact" min-width="220">
                <v-list-item prepend-icon="mdi-file-document-plus-outline" title="Save and create template" @click="openSaveConfirm('template_from_rule')" />
              </v-list>
            </v-menu>
          </v-btn-group>
          <v-btn
            color="success"
            class="flex-shrink-0"
            style="height: 48px"
            :loading="saving"
            :disabled="!draft.startDate"
            @click="openSaveConfirm('activate')"
          >
            <v-icon start :icon="isFutureDate(draft.startDate) ? 'mdi-calendar-clock' : 'mdi-lightning-bolt-outline'" />
            {{ dynamicActivateLabel }}
          </v-btn>
        </template>
      </div>
    </div>
    </Transition>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useNavigationGuard } from '../../composables/useNavigationGuard'
import { useMaxik } from '../../composables/useMaxik'
import LeaveDialog from '../_common/LeaveDialog.vue'
import { usePromotionsStore } from '../../stores/promotions'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { useSettingsStore } from '../../stores/settings'
import { validateConditions } from '../../utils/conditionValidator'
import { serbiaConditionOverrides } from '../../mock/seed'
import { detectGiftConflicts } from '../../utils/giftConflictDetector'
import ConditionsEditor from './ConditionsEditor.vue'
import { v4 as uuid } from 'uuid'
import ReachEstimateBar from './ReachEstimateBar.vue'
import StepDiscountEditor from './StepDiscountEditor.vue'
import GiftItemsSection from './GiftItemsSection.vue'
import ConflictWarningBanner from './ConflictWarningBanner.vue'
import StackingGroupSelect from './StackingGroupSelect.vue'
import ProcessingOrderSelect from './ProcessingOrderSelect.vue'
import NonCombinableRulesSection from './NonCombinableRulesSection.vue'
import TextInput from '../_common/TextInput.vue'
import NumberInput from '../_common/NumberInput.vue'
import SelectInput from '../_common/SelectInput.vue'
import DialogCard from '../_common/DialogCard.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import HelpTooltip from '../_common/HelpTooltip.vue'
import DatePicker from '../_common/DatePicker.vue'
import { useTemplatesStore } from '../../stores/templates'
import { useErpEntriesStore } from '../../stores/erpEntries'
import { useInternalTagsStore } from '../../stores/internalTags'
import { useTagsStore } from '../../stores/tags'

const { mobile } = useDisplay()
const route = useRoute()
const router = useRouter()
const uxTestMode = computed(() => route.path.startsWith('/uxtest') || route.path.startsWith('/serbia'))
const serbiaMode = computed(() => route.path.startsWith('/serbia'))
const basePath = computed(() => route.path.startsWith('/uxtest') ? '/uxtest' : route.path.startsWith('/serbia') ? '/serbia' : '')
const store = usePromotionsStore()
const sgStore = useStackingGroupsStore()
const settingsStore = useSettingsStore()
const templatesStore = useTemplatesStore()
const erpEntriesStore = useErpEntriesStore()
const internalTagsStore = useInternalTagsStore()
const tagsStore = useTagsStore()

const newInternalTagName = ref('')
const creatingInternalTag = ref(false)
const internalTagExists = computed(() =>
  internalTagsStore.items.some(t => t.name.toLowerCase() === newInternalTagName.value.trim().toLowerCase())
)
async function createInternalTag() {
  const name = newInternalTagName.value.trim()
  if (!name || internalTagExists.value) return
  creatingInternalTag.value = true
  try {
    const tag = await internalTagsStore.create({ name })
    draft.internalTags = [...(draft.internalTags ?? []), tag.id]
    newInternalTagName.value = ''
  } finally {
    creatingInternalTag.value = false
  }
}

const newTagName = ref('')
const creatingTag = ref(false)
const tagExists = computed(() =>
  tagsStore.items.some(t => t.name.toLowerCase() === newTagName.value.trim().toLowerCase())
)
async function createTag() {
  const name = newTagName.value.trim()
  if (!name || tagExists.value) return
  creatingTag.value = true
  try {
    const tag = await tagsStore.create({ name })
    draft.tags = [...(draft.tags ?? []), tag.id]
    newTagName.value = ''
  } finally {
    creatingTag.value = false
  }
}

const isTemplateEdit = computed(() => route.path.includes('/templates/'))
const isEdit = computed(() => !!route.params.id && !isTemplateEdit.value)

const saving = ref(false)

// ── Conditions overflow dialog ────────────────────────────────────────────────
const overflowDialog = ref(false)
const overflowInfo = ref({ label: '', values: [] })
function openOverflow(seg) {
  overflowInfo.value = { label: seg.label, values: seg.allValues }
  overflowDialog.value = true
}

// ── Sticky bar visibility ─────────────────────────────────────────────────────
const titleActionsRef = ref(null)
const processingOrderRef = ref(null)
const stickyBarVisible = ref(false)
const { stickyBarActive } = useMaxik()
watch(stickyBarVisible, (v) => { stickyBarActive.value = v })
onUnmounted(() => { stickyBarActive.value = false })
let titleObserver = null
const saveError = ref(null)

// Template edit metadata
const tplLabel = ref('')
const tplDescription = ref('')

// ── Template picker ───────────────────────────────────────────────────────────
const templatePickerOpen = ref(false)
const tplPickerSearch = ref('')
const tplPickerType = ref([])
watch(templatePickerOpen, v => { if (v && !templatesStore.items.length) templatesStore.fetchAll() })

const tplPickerTypeItems = [
  { value: 'discount',      label: 'Standard discount' },
  { value: 'step_discount', label: 'Step discount' },
  { value: 'multi_buy',     label: 'Multi-buy' },
  { value: 'gift',          label: 'Free gift' },
]

const filteredPickerTemplates = computed(() => {
  const q = tplPickerSearch.value.toLowerCase()
  const base = uxTestMode.value
    ? templatesStore.items.filter(t => templatesStore.sessionIds.has(t.id))
    : templatesStore.items
  return base
    .filter(t => !tplPickerType.value.length || tplPickerType.value.includes(t.ruleType))
    .filter(t => !q || t.label.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
})

function tplTypeColor(type) {
  return { discount: 'primary', step_discount: 'success', multi_buy: 'warning', gift: 'purple' }[type] ?? 'default'
}

function tplTypeIcon(type) {
  return { discount: 'mdi-tag-outline', step_discount: 'mdi-stairs', multi_buy: 'mdi-package-variant', gift: 'mdi-gift' }[type] ?? 'mdi-tag-outline'
}

function applyPickerTemplate(tpl) {
  store.resetDraft()
  if (tpl.ruleSnapshot) {
    Object.assign(draft, tpl.ruleSnapshot, { name: tpl.label, status: 'draft', startDate: null, endDate: null })
  } else {
    Object.assign(draft, {
      type: tpl.ruleType ?? 'discount',
      value: tpl.defaultValue ?? '',
      valueUnit: tpl.defaultValueUnit ?? '%',
      conditions: tpl.defaultConditions ? [...tpl.defaultConditions] : [],
      name: tpl.label,
    })
  }
  templatePickerOpen.value = false
}

// ── Save as template ──────────────────────────────────────────────────────────
const rulePersisted = ref(false)
const templateDialogOpen = ref(false)
const templateLabel = ref('')
const templateDescription = ref('')
const creatingTemplate = ref(false)
const templateCreatedSnack = ref(false)

async function openSaveAsTemplate() {
  if (!validate()) {
    saveError.value = 'Please fix the highlighted errors before saving.'
    return
  }
  saving.value = true
  saveError.value = null
  try {
    const payload = JSON.parse(JSON.stringify(toRaw(draft)))
    payload.status = resolveStatus(payload.status, payload.startDate, payload.endDate, payload.pauseScheduled, payload.pauseStart, payload.pauseEnd)
    if (isEdit.value) {
      await store.update(route.params.id, payload)
    } else {
      await store.create(payload)
    }
    rulePersisted.value = true
    templateLabel.value = draft.name
    templateDescription.value = ''
    templateDialogOpen.value = true
  } catch (e) {
    saveError.value = e?.response?.data?.error ?? e?.message ?? 'Failed to save rule'
  } finally {
    saving.value = false
  }
}

async function confirmCreateTemplate() {
  creatingTemplate.value = true
  try {
    const snapshot = JSON.parse(JSON.stringify(toRaw(draft)))
    const INSTANCE_FIELDS = ['name', 'status', 'startDate', 'endDate', 'pauseScheduled', 'pauseStart', 'pauseEnd', 'processingOrder', 'nonCombinableRules']
    INSTANCE_FIELDS.forEach(f => delete snapshot[f])
    await templatesStore.create({
      label: templateLabel.value,
      description: templateDescription.value,
      ruleType: draft.type,
      ruleSnapshot: snapshot,
    })
    templateDialogOpen.value = false
    templateCreatedSnack.value = true
    setTimeout(() => router.push(`${basePath.value}/promotions`), 1500)
  } catch (e) {
    saveError.value = e?.response?.data?.error ?? e?.message ?? 'Failed to create template'
  } finally {
    creatingTemplate.value = false
  }
}
const validationErrors = ref({})
const pauseAdjustWarning = ref(false)
const pauseErrors = ref({})

const draft = store.formDraft

const _now = new Date()
const todayIso = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`

function isFutureDate(dateStr) {
  return !!dateStr && dateStr > todayIso
}

function isPastDate(dateStr) {
  return !!dateStr && dateStr < todayIso
}

function resolveStatus(currentStatus, startDate, endDate, pauseScheduled, pauseStart, pauseEnd) {
  if (isPastDate(endDate)) return 'ended'
  if (isFutureDate(startDate)) return 'scheduled'
  if (currentStatus === 'scheduled' || currentStatus === 'ended') return 'active'
  if (pauseScheduled && pauseStart && pauseEnd) {
    const now = new Date(new Date().toDateString())
    const ps = new Date(pauseStart)
    const pe = new Date(pauseEnd)
    if (now >= ps && now <= pe && currentStatus === 'active') return 'paused'
  }
  return currentStatus
}

function validatePause() {
  const errors = {}
  if (!draft.pauseScheduled) return errors
  if (!draft.pauseStart) errors.pauseStart = 'Pause start date is required'
  if (!draft.pauseEnd) errors.pauseEnd = 'Pause end date is required'
  if (draft.pauseStart && draft.pauseEnd && draft.pauseStart >= draft.pauseEnd) {
    errors.pauseEnd = 'Pause end must be after pause start'
  }
  if (draft.pauseStart && draft.startDate && draft.pauseStart < draft.startDate) {
    errors.pauseStart = 'Pause must start on or after rule start date'
  }
  if (draft.pauseEnd && draft.endDate && draft.pauseEnd > draft.endDate) {
    errors.pauseEnd = 'Pause must end on or before rule end date'
  }
  if (draft.pauseStart && !draft.startDate) {
    errors.pauseStart = 'Rule start date must be set before scheduling a pause'
  }
  if (draft.pauseEnd && !draft.endDate) {
    errors.pauseEnd = 'Rule end date must be set before scheduling a pause'
  }
  return errors
}

watch(() => draft.type, (type) => {
  if (type === 'multi_buy') draft.scope = 'item'
  if (type !== 'discount') draft.maxUsagePerCustomer = null
})

watch(() => draft.startDate, () => {
  draft.status = resolveStatus(draft.status, draft.startDate, draft.endDate, draft.pauseScheduled, draft.pauseStart, draft.pauseEnd)
  if (!draft.startDate || !draft.endDate) {
    draft.pauseScheduled = false
    draft.pauseStart = null
    draft.pauseEnd = null
  } else if (draft.pauseScheduled && (draft.pauseStart || draft.pauseEnd)) {
    pauseAdjustWarning.value = true
  }
})

watch(() => draft.endDate, () => {
  draft.status = resolveStatus(draft.status, draft.startDate, draft.endDate, draft.pauseScheduled, draft.pauseStart, draft.pauseEnd)
  if (!draft.startDate || !draft.endDate) {
    draft.pauseScheduled = false
    draft.pauseStart = null
    draft.pauseEnd = null
  } else if (draft.pauseScheduled && (draft.pauseStart || draft.pauseEnd)) {
    pauseAdjustWarning.value = true
  }
})

watch(() => draft.pauseScheduled, (val) => {
  if (!val) {
    draft.pauseStart = null
    draft.pauseEnd = null
    pauseErrors.value = {}
    pauseAdjustWarning.value = false
  }
})

function toIsoDate(val) {
  if (!val) return null
  if (typeof val === 'string') return val.split('T')[0]
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function pauseStartAllowedDates(d) {
  const iso = toIsoDate(d)
  if (!iso) return false
  if (draft.startDate && iso < draft.startDate) return false
  if (draft.endDate && iso > draft.endDate) return false
  if (draft.pauseEnd && iso > draft.pauseEnd) return false
  return true
}

function pauseEndAllowedDates(d) {
  const iso = toIsoDate(d)
  if (!iso) return false
  if (draft.startDate && iso < draft.startDate) return false
  if (draft.endDate && iso > draft.endDate) return false
  if (draft.pauseStart && iso < draft.pauseStart) return false
  return true
}


const ALL_RULE_TYPE_ITEMS = [
  { value: 'discount', title: 'Discount' },
  { value: 'step_discount', title: 'Step Discount' },
  { value: 'multi_buy', title: 'Multi-buy' },
  { value: 'gift', title: 'Gift' },
]
const ruleTypeItems = computed(() =>
  serbiaMode.value
    ? ALL_RULE_TYPE_ITEMS.filter(t => t.value === 'discount' || t.value === draft.type)
    : ALL_RULE_TYPE_ITEMS
)

// ── Multi-buy ─────────────────────────────────────────────────────────────────

const multiBuyDescription = computed(() => {
  if (draft.type !== 'multi_buy') return ''
  const hasBuy = !!draft.multiBuyQty
  const hasFree = !!draft.multiFreeQty
  if (!hasBuy && !hasFree) return ''

  const missing = []
  if (!hasBuy) missing.push('buy quantity')
  if (!hasFree) missing.push('free quantity')

  const freeMode = draft.multiSelectionMode === 'CHEAPEST' ? 'cheapest' : 'most expensive'
  const repeats = draft.multiMaxSteps ? `up to ${draft.multiMaxSteps} time(s)` : 'unlimited times'

  let sentence
  if (hasBuy && hasFree) {
    sentence = `Buy ${draft.multiBuyQty}, get ${draft.multiFreeQty} ${freeMode} item(s) free — repeats ${repeats}.`
  } else if (hasBuy) {
    sentence = `Buy ${draft.multiBuyQty} item(s) — repeats ${repeats}.`
  } else {
    sentence = `Get ${draft.multiFreeQty} ${freeMode} item(s) free — repeats ${repeats}.`
  }

  if (missing.length) sentence += ` Not yet set: ${missing.join(', ')}.`
  return sentence
})

// ── Step discount ─────────────────────────────────────────────────────────────

const stepDescription = computed(() => {
  if (draft.type !== 'step_discount') return ''
  const isQty = draft.stepType === 'QTY'
  const isPercent = draft.amountType === 'PERCENT'
  const fmt = v => isPercent ? `${v}%` : `€${v}`
  const thr = v => isQty ? `${v} item(s)` : `€${v}`
  const applyLabel = draft.stepApplyTo === 'cheapest' ? 'the cheapest item' : (draft.scope === 'item' ? 'each qualifying item' : 'the cart total')
  const unlimited = !draft.stepMaxSteps || Number(draft.stepMaxSteps) === 0
  const maxLabel = unlimited ? 'indefinitely' : `up to ${draft.stepMaxSteps} time(s)`

  const validTiers = draft.steps.filter(s => s.threshold !== '' && s.value !== '')
  const hasDiscount = !!draft.value || validTiers.length > 0
  const hasStep = !!draft.stepValue

  if (!hasDiscount && !hasStep) return ''

  const missing = []
  if (!hasStep) missing.push('step threshold (Every X)')
  if (!hasDiscount) missing.push('discount amount or tiers')

  let discPart
  if (validTiers.length) {
    const tierList = validTiers.map((s, i) => {
      const threshold = hasStep ? thr((i + 1) * Number(draft.stepValue)) : thr(s.threshold)
      return `${threshold} → ${fmt(s.value)} off`
    }).join(', ')
    discPart = `tiers: ${tierList}`
  } else if (draft.value) {
    discPart = `get ${fmt(draft.value)} off ${applyLabel}`
  }

  let sentence
  if (hasStep && discPart) {
    sentence = `Every ${thr(draft.stepValue)} purchased: ${discPart}. Repeats ${maxLabel}.`
  } else if (hasStep) {
    sentence = `Every ${thr(draft.stepValue)} purchased. Repeats ${maxLabel}.`
  } else {
    sentence = `${discPart.charAt(0).toUpperCase() + discPart.slice(1)}. Repeats ${maxLabel}.`
  }

  if (missing.length) sentence += ` Not yet set: ${missing.join(', ')}.`

  return sentence
})

const amountTypeItems = [
  { value: 'PERCENT', title: 'Percentage (%)' },
  { value: 'FIXED', title: 'Fixed amount (€)' },
]

const channelOptions = [
  { value: 'web', title: 'Web', icon: 'mdi-web' },
  { value: 'mobile_app', title: 'Mobile App', icon: 'mdi-cellphone' },
]


const breadcrumbs = computed(() => [{
  title: isTemplateEdit.value ? 'Edit template' : (isEdit.value ? 'Edit rule' : 'New promotion rule'),
  disabled: true,
}])

const conditionValidation = computed(() => validateConditions(draft.conditions))


const giftConflicts = computed(() => detectGiftConflicts(draft.gifts, draft.conditions))

// ── Conditions plain-English description ──────────────────────────────────────

function _opLabel(op) {
  return { '>=': 'bigger than or equal', '>': 'bigger than', '<=': 'lower than or equal', '<': 'lower than', '=': 'equal to' }[op] ?? op
}

function _fmtList(vals) {
  if (!vals?.length) return '—'
  if (vals.length === 1) return `"${vals[0]}"`
  if (vals.length === 2) return `"${vals[0]}" or "${vals[1]}"`
  return `"${vals[0]}", "${vals[1]}" or ${vals.length - 2} more`
}

const MAX_SHOWN_VALUES = 2

function _fmtListSegments(vals, overflowLabel) {
  if (!vals?.length) return [{ type: 'text', text: '—' }]
  const shown = vals.slice(0, MAX_SHOWN_VALUES)
  const rest = vals.slice(MAX_SHOWN_VALUES)
  const shownText = shown.map(v => `"${v}"`).join(', ')
  if (!rest.length) {
    return [{ type: 'text', text: vals.length === 1 ? `"${vals[0]}"` : `${shown.map(v => `"${v}"`).join(' or ')}` }]
  }
  return [
    { type: 'text', text: `${shownText} ` },
    { type: 'overflow', count: rest.length, allValues: vals, label: overflowLabel },
  ]
}

function _describeLeafSegments(c, scope) {
  const vals = c.values ?? []
  if (!vals.length || (vals.length === 1 && vals[0] === '')) return null
  const inc = c.mode !== 'exclude'

  function wrap(prefix, label) {
    return [{ type: 'text', text: prefix }, ..._fmtListSegments(vals, label)]
  }

  switch (c.field) {
    case 'categories':
      return wrap(inc ? `product is in ${vals.length > 1 ? 'categories' : 'category'} ` : `product is NOT in ${vals.length > 1 ? 'categories' : 'category'} `, 'Categories')
    case 'brands':
      return wrap(inc ? 'brand is ' : 'brand is NOT ', 'Brands')
    case 'skus':
      return wrap(inc ? 'SKU is ' : 'SKU is NOT ', 'SKUs')
    case 'product_lines':
      return wrap(inc ? 'product line is ' : 'product line is NOT ', 'Product lines')
    case 'subtotal': {
      if (!vals[0]) return null
      const label = scope === 'cart' ? 'cart subtotal' : 'item price'
      return [{ type: 'text', text: `${label} is ${_opLabel(c.operator)} €${vals[0]}` }]
    }
    case 'quantity': {
      if (!vals[0]) return null
      const label = scope === 'cart' ? 'total cart quantity' : 'item line quantity'
      return [{ type: 'text', text: `${label} is ${_opLabel(c.operator)} ${vals[0]}` }]
    }
    case 'weight': {
      if (!vals[0]) return null
      const label = scope === 'cart' ? 'total cart weight' : 'item weight'
      return [{ type: 'text', text: `${label} is ${_opLabel(c.operator)} ${vals[0]} kg` }]
    }
    case 'customer_group':
      return wrap(inc ? 'customer is in group ' : 'customer is NOT in group ', 'Customer groups')
    case 'coupon_code':
      return vals[0] ? wrap('coupon code is ', 'Coupon codes') : null
    case 'pim_status':
      return wrap(inc ? 'PIM status is ' : 'PIM status is NOT ', 'PIM statuses')
    case 'attribute_set':
      return wrap(inc ? 'attribute set is ' : 'attribute set is NOT ', 'Attribute sets')
    case 'seller':
      return wrap(inc ? 'seller is ' : 'seller is NOT ', 'Sellers')
    case 'warehouse_type':
      return wrap(inc ? 'warehouse type is ' : 'warehouse type is NOT ', 'Warehouse types')
    default:
      return null
  }
}

const conditionsDescriptionSegments = computed(() => {
  const allConds = draft.conditions ?? []
  if (!allConds.length) return null

  const segments = [{ type: 'text', text: `Applies to ${draft.scope === 'cart' ? 'the cart' : 'each qualifying item'} where ` }]
  let hasContent = false

  for (let i = 0; i < allConds.length; i++) {
    const c = allConds[i]
    const sep = i > 0 ? (c.logicalOp === 'OR' ? ' OR ' : ' AND ') : ''

    if (c.type === 'group') {
      const innerSegs = []
      for (let j = 0; j < (c.conditions ?? []).length; j++) {
        const inner = c.conditions[j]
        const innerSep = j > 0 ? (inner.logicalOp === 'OR' ? ' OR ' : ' AND ') : ''
        const segs = _describeLeafSegments(inner, draft.scope)
        if (segs) {
          if (innerSep) innerSegs.push({ type: 'text', text: innerSep })
          innerSegs.push(...segs)
        }
      }
      if (innerSegs.length) {
        if (sep) segments.push({ type: 'text', text: sep })
        segments.push({ type: 'text', text: '(' }, ...innerSegs, { type: 'text', text: ')' })
        hasContent = true
      }
    } else {
      const segs = _describeLeafSegments(c, draft.scope)
      if (segs) {
        if (sep) segments.push({ type: 'text', text: sep })
        segments.push(...segs)
        hasContent = true
      }
    }
  }

  if (!hasContent) return null
  segments.push({ type: 'text', text: '.' })
  return segments
})

function _describeLeaf(c, scope) {
  const vals = c.values ?? []
  if (!vals.length || (vals.length === 1 && vals[0] === '')) return null
  const inc = c.mode !== 'exclude'
  switch (c.field) {
    case 'categories':
      return inc
        ? `product is in categor${vals.length > 1 ? 'ies' : 'y'} ${_fmtList(vals)}`
        : `product is NOT in categor${vals.length > 1 ? 'ies' : 'y'} ${_fmtList(vals)}`
    case 'brands':
      return inc ? `brand is ${_fmtList(vals)}` : `brand is NOT ${_fmtList(vals)}`
    case 'skus':
      return vals.length <= 3
        ? (inc ? `SKU is ${_fmtList(vals)}` : `SKU is NOT ${_fmtList(vals)}`)
        : (inc ? `SKU is one of ${vals.length} specific products` : `${vals.length} specific SKUs are excluded`)
    case 'product_lines':
      return inc ? `product line is ${_fmtList(vals)}` : `product line is NOT ${_fmtList(vals)}`
    case 'subtotal': {
      if (!vals[0]) return null
      const label = scope === 'cart' ? 'cart subtotal' : 'item price'
      return `${label} is ${_opLabel(c.operator)} €${vals[0]}`
    }
    case 'quantity': {
      if (!vals[0]) return null
      const label = scope === 'cart' ? 'total cart quantity' : 'item line quantity'
      return `${label} is ${_opLabel(c.operator)} ${vals[0]}`
    }
    case 'weight': {
      if (!vals[0]) return null
      const label = scope === 'cart' ? 'total cart weight' : 'item weight'
      return `${label} is ${_opLabel(c.operator)} ${vals[0]} g`
    }
    case 'customer_group':
      return inc ? `customer is in group ${_fmtList(vals)}` : `customer is NOT in group ${_fmtList(vals)}`
    case 'coupon_code':
      return vals[0] ? `coupon code is ${_fmtList(vals)}` : null
    case 'pim_status':
      return inc ? `PIM status is ${_fmtList(vals)}` : `PIM status is NOT ${_fmtList(vals)}`
    case 'attribute_set':
      return inc ? `attribute set is ${_fmtList(vals)}` : `attribute set is NOT ${_fmtList(vals)}`
    case 'seller':
      return inc ? `seller is ${_fmtList(vals)}` : `seller is NOT ${_fmtList(vals)}`
    case 'warehouse_type':
      return inc ? `warehouse type is ${_fmtList(vals)}` : `warehouse type is NOT ${_fmtList(vals)}`
    default:
      return null
  }
}

const conditionsDescription = computed(() => {
  const allConds = draft.conditions ?? []
  if (!allConds.length) return null

  const topParts = []

  for (let i = 0; i < allConds.length; i++) {
    const c = allConds[i]
    const sep = i > 0 ? (c.logicalOp === 'OR' ? ' OR ' : ' AND ') : ''

    if (c.type === 'group') {
      const innerParts = []
      for (let j = 0; j < (c.conditions ?? []).length; j++) {
        const inner = c.conditions[j]
        const innerSep = j > 0 ? (inner.logicalOp === 'OR' ? ' OR ' : ' AND ') : ''
        const desc = _describeLeaf(inner, draft.scope)
        if (desc) innerParts.push(innerSep + desc)
      }
      if (innerParts.length) topParts.push(sep + `(${innerParts.join('')})`)
    } else {
      const desc = _describeLeaf(c, draft.scope)
      if (desc) topParts.push(sep + desc)
    }
  }

  if (!topParts.length) return null

  const scopePhrase = draft.scope === 'cart' ? 'the cart' : 'each qualifying item'
  return `Applies to ${scopePhrase} where ${topParts.join('')}.`
})

const ruleDescription = computed(() => {
  const sentences = []

  // Action
  if (draft.type === 'discount') {
    if (draft.value) {
      const disc = draft.amountType === 'PERCENT' ? `${draft.value}% off` : `€${draft.value} off`
      const target = draft.scope === 'cart' ? 'the cart total' : 'each qualifying item'
      sentences.push(`Apply ${disc} to ${target}.`)
    }
  } else if (draft.type === 'step_discount') {
    if (stepDescription.value) sentences.push(stepDescription.value)
  } else if (draft.type === 'multi_buy') {
    if (draft.multiBuyQty && draft.multiFreeQty) {
      const freeMode = draft.multiSelectionMode === 'CHEAPEST' ? 'cheapest' : 'most expensive'
      const repeats = draft.multiMaxSteps ? `up to ${draft.multiMaxSteps} time(s)` : 'unlimited times'
      sentences.push(`Buy ${draft.multiBuyQty}, get ${draft.multiFreeQty} ${freeMode} item(s) free — repeats ${repeats}.`)
    }
  } else if (draft.type === 'gift') {
    if (draft.giftStepValue) {
      const trigger = draft.giftStepType === 'SPENT' ? `€${draft.giftStepValue} spent` : `${draft.giftStepValue} items purchased`
      const giftCount = draft.gifts?.filter(g => g.sku)?.length ?? 0
      const giftStr = giftCount ? `${giftCount} gift item${giftCount !== 1 ? 's' : ''} will be given` : 'gift items configured separately'
      const limit = draft.giftMaxSteps ? `, repeats up to ${draft.giftMaxSteps} time(s)` : ''
      sentences.push(`When ${trigger} is reached, ${giftStr}${limit}.`)
    }
  }

  if (conditionsDescription.value) {
    sentences.push(conditionsDescription.value)
  } else if (sentences.length) {
    sentences.push('No conditions set — applies to all products.')
  }

  if (draft.channels?.length) {
    const channelMap = { web: 'Web', mobile_app: 'Mobile App' }
    const chs = draft.channels.map(c => channelMap[c] || c)
    const chStr = chs.length === 1 ? chs[0] : chs.slice(0, -1).join(', ') + ' and ' + chs[chs.length - 1]
    sentences.push(`Available on ${chStr}.`)
  }

  if (draft.startDate || draft.endDate) {
    if (draft.startDate && draft.endDate) sentences.push(`Active from ${draft.startDate} to ${draft.endDate}.`)
    else if (draft.startDate) sentences.push(`Starts on ${draft.startDate}, no end date set.`)
    else sentences.push(`Active until ${draft.endDate}.`)
  }

  if (draft.pauseScheduled && draft.pauseStart && draft.pauseEnd) {
    sentences.push(`Paused from ${draft.pauseStart} to ${draft.pauseEnd}.`)
  }

  if (draft.usageLimitsEnabled) {
    const lp = []
    if (draft.type === 'discount' && draft.maxUsagePerCustomer) lp.push(`${draft.maxUsagePerCustomer}× per customer`)
    if (draft.maxUsagePerRule) lp.push(`${draft.maxUsagePerRule}× total`)
    if (lp.length) sentences.push(`Limited to ${lp.join(', ')}.`)
  }

  return sentences.length ? sentences.join(' ') : null
})

const ruleDescriptionSegments = computed(() => {
  const segs = []

  if (draft.type === 'discount') {
    if (draft.value) {
      const disc = draft.amountType === 'PERCENT' ? `${draft.value}% off` : `€${draft.value} off`
      const target = draft.scope === 'cart' ? 'the cart total' : 'each qualifying item'
      segs.push({ type: 'text', text: `Apply ${disc} to ${target}. ` })
    }
  } else if (draft.type === 'step_discount') {
    if (stepDescription.value) segs.push({ type: 'text', text: stepDescription.value + ' ' })
  } else if (draft.type === 'multi_buy') {
    if (draft.multiBuyQty && draft.multiFreeQty) {
      const freeMode = draft.multiSelectionMode === 'CHEAPEST' ? 'cheapest' : 'most expensive'
      const repeats = draft.multiMaxSteps ? `up to ${draft.multiMaxSteps} time(s)` : 'unlimited times'
      segs.push({ type: 'text', text: `Buy ${draft.multiBuyQty}, get ${draft.multiFreeQty} ${freeMode} item(s) free — repeats ${repeats}. ` })
    }
  } else if (draft.type === 'gift') {
    if (draft.giftStepValue) {
      const trigger = draft.giftStepType === 'SPENT' ? `€${draft.giftStepValue} spent` : `${draft.giftStepValue} items purchased`
      const giftCount = draft.gifts?.filter(g => g.sku)?.length ?? 0
      const giftStr = giftCount ? `${giftCount} gift item${giftCount !== 1 ? 's' : ''} will be given` : 'gift items configured separately'
      const limit = draft.giftMaxSteps ? `, repeats up to ${draft.giftMaxSteps} time(s)` : ''
      segs.push({ type: 'text', text: `When ${trigger} is reached, ${giftStr}${limit}. ` })
    }
  }

  const condSegs = conditionsDescriptionSegments.value
  if (condSegs) {
    segs.push(...condSegs)
    segs.push({ type: 'text', text: ' ' })
  } else if (segs.length) {
    segs.push({ type: 'text', text: 'No conditions set — applies to all products. ' })
  }

  if (draft.channels?.length) {
    const channelMap = { web: 'Web', mobile_app: 'Mobile App' }
    const chs = draft.channels.map(c => channelMap[c] || c)
    const chStr = chs.length === 1 ? chs[0] : chs.slice(0, -1).join(', ') + ' and ' + chs[chs.length - 1]
    segs.push({ type: 'text', text: `Available on ${chStr}. ` })
  }

  if (draft.startDate || draft.endDate) {
    if (draft.startDate && draft.endDate) segs.push({ type: 'text', text: `Active from ${fmtDate(draft.startDate)} to ${fmtDate(draft.endDate)}. ` })
    else if (draft.startDate) segs.push({ type: 'text', text: `Starts on ${fmtDate(draft.startDate)}, no end date set. ` })
    else segs.push({ type: 'text', text: `Active until ${fmtDate(draft.endDate)}. ` })
  }

  if (draft.pauseScheduled && draft.pauseStart && draft.pauseEnd) {
    segs.push({ type: 'text', text: `Paused from ${fmtDate(draft.pauseStart)} to ${fmtDate(draft.pauseEnd)}. ` })
  }

  if (draft.usageLimitsEnabled) {
    const lp = []
    if (draft.type === 'discount' && draft.maxUsagePerCustomer) lp.push(`${draft.maxUsagePerCustomer}× per customer`)
    if (draft.maxUsagePerRule) lp.push(`${draft.maxUsagePerRule}× total`)
    if (lp.length) segs.push({ type: 'text', text: `Limited to ${lp.join(', ')}. ` })
  }

  return segs.length ? segs : null
})

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function validate() {
  const errors = {}
  if (!draft.name?.trim()) errors.name = 'Rule name is required'
  if (!serbiaMode.value && !draft.channels?.length) errors.channels = 'At least one channel must be selected'
  if (draft.type === 'discount' && !draft.value) errors.value = 'Discount value is required'
  validationErrors.value = errors
  const pErrors = validatePause()
  pauseErrors.value = pErrors
  return Object.keys(errors).length === 0 && Object.keys(pErrors).length === 0
}

const dynamicActivateLabel = computed(() =>
  isFutureDate(draft.startDate) ? 'Save and schedule' : 'Save and activate'
)

async function _persistRule(statusOverride) {
  if (!validate()) {
    saveError.value = 'Please fix the highlighted errors before saving.'
    return
  }
  saving.value = true
  saveError.value = null
  try {
    if (isTemplateEdit.value) {
      const snapshot = JSON.parse(JSON.stringify(toRaw(draft)))
      const INSTANCE_FIELDS = ['name', 'status', 'startDate', 'endDate', 'pauseScheduled', 'pauseStart', 'pauseEnd', 'processingOrder', 'nonCombinableRules']
      INSTANCE_FIELDS.forEach(f => delete snapshot[f])
      const tplPayload = { label: tplLabel.value, description: tplDescription.value, ruleType: draft.type, ruleSnapshot: snapshot }
      if (route.params.id) {
        await templatesStore.update(route.params.id, tplPayload)
      } else {
        await templatesStore.create(tplPayload)
      }
      rulePersisted.value = true
      router.push(`${basePath.value}/templates`)
    } else {
      const payload = JSON.parse(JSON.stringify(toRaw(draft)))
      payload.status = statusOverride ?? resolveStatus(payload.status, payload.startDate, payload.endDate, payload.pauseScheduled, payload.pauseStart, payload.pauseEnd)
      if (!isEdit.value && !payload.createdBy) payload.createdBy = 'User'
      if (isEdit.value) {
        await store.update(route.params.id, payload)
      } else {
        await store.create(payload)
      }
      rulePersisted.value = true
      router.push(`${basePath.value}/promotions?tab=${tabForStatus(payload.status)}`)
    }
  } catch (e) {
    saveError.value = e?.response?.data?.error ?? e?.message ?? 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function save() { await _persistRule() }
async function saveAsDraft() { await _persistRule('draft') }
async function saveAndActivate() {
  await _persistRule(isFutureDate(draft.startDate) ? 'scheduled' : 'active')
}

const { leaveDialogOpen, openLeaveDialog, cancelLeave, leaveWithoutSaving } =
  useNavigationGuard({
    dirty: computed(() => !rulePersisted.value),
  })

function tabForStatus(status) {
  if (status === 'active' || status === 'scheduled') return 'active'
  if (status === 'paused') return 'paused'
  if (status === 'ended') return 'ended'
  if (status === 'archived') return 'archived'
  return 'draft'
}

function openDiscardDialog() {
  const target = isTemplateEdit.value
    ? `${basePath.value}/templates`
    : `${basePath.value}/promotions${isEdit.value ? `?tab=${tabForStatus(draft.status)}` : ''}`
  openLeaveDialog(target)
}

// ── Save confirm ──────────────────────────────────────────────────────────────
const saveConfirmOpen = ref(false)
const pendingSaveAction = ref(null)

const saveConfirmTitle = computed(() => {
  if (pendingSaveAction.value === 'draft') return 'Save as draft?'
  if (pendingSaveAction.value === 'activate') return `${dynamicActivateLabel.value}?`
  if (pendingSaveAction.value === 'template') return 'Save template?'
  if (pendingSaveAction.value === 'template_from_rule') return 'Save and create template?'
  return 'Save changes?'
})

const saveConfirmBody = computed(() => {
  if (pendingSaveAction.value === 'draft') return 'The rule will be saved as a draft and will not be applied at checkout.'
  if (pendingSaveAction.value === 'activate') return isFutureDate(draft.startDate)
    ? 'The rule will be saved and scheduled to activate on the configured start date.'
    : 'The rule will be saved and immediately activated at checkout.'
  if (pendingSaveAction.value === 'template') return 'The template changes will be saved.'
  if (pendingSaveAction.value === 'template_from_rule') return 'The rule will be saved and a reusable template will be created from it.'
  return 'Are you sure you want to save?'
})

function openSaveConfirm(action) {
  pendingSaveAction.value = action
  saveConfirmOpen.value = true
}

async function doConfirmedSave() {
  saveConfirmOpen.value = false
  if (pendingSaveAction.value === 'draft') await saveAsDraft()
  else if (pendingSaveAction.value === 'activate') await saveAndActivate()
  else if (pendingSaveAction.value === 'template') await save()
  else if (pendingSaveAction.value === 'template_from_rule') await openSaveAsTemplate()
}

async function loadFromRoute() {
  if (isTemplateEdit.value) {
    if (!route.params.id) {
      tplLabel.value = ''
      tplDescription.value = ''
      store.resetDraft()
    } else {
      if (!templatesStore.items.length) await templatesStore.fetchAll()
      const tpl = templatesStore.items.find(t => t.id === route.params.id)
      if (tpl) {
        tplLabel.value = tpl.label ?? ''
        tplDescription.value = tpl.description ?? ''
        store.resetDraft()
        if (tpl.ruleSnapshot) {
          Object.assign(draft, tpl.ruleSnapshot)
        } else {
          Object.assign(draft, {
            type: tpl.ruleType ?? 'discount',
            value: tpl.defaultValue ?? '',
            valueUnit: tpl.defaultValueUnit ?? '%',
            conditions: tpl.defaultConditions ? [...tpl.defaultConditions] : [],
          })
        }
      }
    }
  } else if (isEdit.value) {
    await store.fetchOne(route.params.id)
    if (serbiaMode.value && serbiaConditionOverrides[route.params.id]) {
      draft.conditions = serbiaConditionOverrides[route.params.id].map(c => ({ ...c }))
    }
  } else if (!route.query.fromTemplate) {
    store.resetDraft()
    if (serbiaMode.value) draft.channels = channelOptions.map(c => c.value)
  }
}

// Vue Router reuses this component instance when navigating between two
// routes that both resolve to PromotionForm (e.g. one rule's edit page to
// another's) — onMounted alone won't fire again, so re-run the load whenever
// the route we're editing actually changes.
watch(() => route.fullPath, () => { loadFromRoute() })

onMounted(async () => {
  titleObserver = new IntersectionObserver(
    ([entry]) => { stickyBarVisible.value = !entry.isIntersecting },
    { threshold: 0 }
  )
  if (titleActionsRef.value) titleObserver.observe(titleActionsRef.value)
  await Promise.all([sgStore.fetchAll(), store.fetchAll(), erpEntriesStore.fetchAll(), internalTagsStore.fetchAll(), tagsStore.fetchAll()])
  await loadFromRoute()
})

onUnmounted(() => {
  if (titleObserver) titleObserver.disconnect()
})

defineExpose({ store })
</script>

<style scoped>
.form-container {
  padding-bottom: 120px !important;
}

.preview-sticky {
  position: sticky;
  top: 68px;
}

.tpl-picker-card {
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.tpl-picker-card:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.04);
}

.overflow-chip {
  cursor: pointer;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
