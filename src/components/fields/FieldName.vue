<script setup lang="ts">
import { onMounted } from 'vue'
import { nameSchema } from '@/types/core'
import { Limit } from '@/types/general'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

onMounted(() => {
  actionStore.record.name = actionStore.record.name ?? ''
})

function inspectFormat(val: string) {
  return `${val || '-'}`
}
</script>

<template>
  <div class="text-weight-bold text-body1">Name</div>

  <div v-if="inspecting">{{ inspectFormat(actionStore.record.name) }}</div>

  <QInput
    v-else
    v-model="actionStore.record.name"
    :rules="[(val: string) => nameSchema.safeParse(val).success || `Name must be between ${Limit.MIN_NAME} and ${Limit.MAX_NAME} characters`]"
    :maxlength="Limit.MAX_NAME"
    type="text"
    lazy-rules
    counter
    dense
    outlined
    color="primary"
    @blur="actionStore.record.name = actionStore.record.name?.trim()"
  />
</template>
