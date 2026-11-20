<template>
  <v-dialog v-model="open" width="600" max-width="90%">
    <v-card>
      <v-card-title>Apply filter</v-card-title>

      <v-card-text>
        <v-radio-group v-model="picked" hide-details>
          <v-list v-model:opened="openedGroups">
            <v-list-group value="mine">
              <template #activator="{ props: groupProps }">
                <v-list-item v-bind="groupProps" prepend-icon="mdi-account-outline" title="My filters" />
              </template>

              <v-list-item v-for="f in mine" :key="f.id" density="compact" data-testid="my-filter">
                <v-radio :value="f.id" :ripple="false">
                  <template #label>
                    <span>{{ f.name }}</span>
                    <v-icon
                      v-if="f.sharedGroups.length"
                      size="small"
                      class="ml-2"
                      :title="`Filter is shared to groups ${f.sharedGroups.join(', ')}`"
                    >mdi-share-variant-outline</v-icon>
                  </template>
                </v-radio>
                <template #append>
                  <v-menu>
                    <template #activator="{ props: menuProps }">
                      <v-btn v-bind="menuProps" icon="mdi-cog-outline" variant="plain" size="small" aria-label="Filter settings" />
                    </template>
                    <v-card>
                      <v-list>
                        <v-list-item>
                          <v-btn color="warning" variant="text" block prepend-icon="mdi-pencil" @click="emit('edit', f)">Edit</v-btn>
                        </v-list-item>
                        <v-list-item>
                          <v-btn color="error" variant="text" block prepend-icon="mdi-delete" @click="askRemove(f)">Remove</v-btn>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </template>
              </v-list-item>
              <v-list-item v-if="!mine.length" class="text-disabled text-center">
                <v-list-item-title>No data</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-group value="shared">
              <template #activator="{ props: groupProps }">
                <v-list-item v-bind="groupProps" prepend-icon="mdi-share-variant-outline" title="Shared filters" />
              </template>

              <v-list-item v-for="f in shared" :key="f.id" density="compact" data-testid="shared-filter">
                <v-radio :value="f.id" :label="f.name" :ripple="false" />
                <template #append>
                  <span class="text-caption text-medium-emphasis">{{ f.user.name }}</span>
                </template>
              </v-list-item>
              <v-list-item v-if="!shared.length" class="text-disabled text-center">
                <v-list-item-title>No data</v-list-item-title>
              </v-list-item>
            </v-list-group>
          </v-list>
        </v-radio-group>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="black" variant="text" @click="open = false">Cancel</v-btn>
        <v-btn color="primary" :disabled="!picked" data-testid="apply-saved-filter" @click="submit">Confirm</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>

  <ConfirmModal ref="removeModal" confirm-text="Remove" confirm-color="error">
    <template #header>Remove filter?</template>
    <template #body="{ item }">
      Remove filter <strong>{{ item.name }}</strong>?
      <span v-if="item.sharedGroups.length">Filter is shared to groups {{ item.sharedGroups.join(', ') }}.</span>
    </template>
  </ConfirmModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import ConfirmModal from '../_common/ConfirmModal.vue'

const props = defineProps({
  mine: { type: Array, required: true },
  shared: { type: Array, required: true },
  selectedId: { type: String, default: null },
})
const emit = defineEmits(['submit', 'edit', 'remove'])

const open = defineModel({ type: Boolean, default: false })
const picked = ref(null)
const openedGroups = ref(['mine'])
const removeModal = ref(null)

watch(open, isOpen => {
  if (isOpen) picked.value = props.selectedId
})

async function askRemove(filter) {
  const confirmed = await removeModal.value.open(filter)
  if (!confirmed) return
  if (picked.value === filter.id) picked.value = null
  emit('remove', filter)
}

function submit() {
  const all = [...props.mine, ...props.shared]
  emit('submit', all.find(f => f.id === picked.value))
  open.value = false
}
</script>
