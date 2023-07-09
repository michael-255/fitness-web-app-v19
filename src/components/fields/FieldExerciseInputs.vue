<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { ExerciseInput, exerciseInputsSchema } from '@/types/core'
import { Icon, RouteName } from '@/types/general'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import useRoutables from '@/composables/useRoutables'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const { route } = useRoutables()
const actionStore = useActionStore()

const options: Ref<{ value: ExerciseInput; label: ExerciseInput }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record.exerciseInputs = actionStore.record.exerciseInputs ?? []

    options.value = Object.values(ExerciseInput).map((o: ExerciseInput) => ({
      value: o,
      label: o,
    }))
  } catch (error) {
    log.error('Error with exercise inputs field', error)
  }
})
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Inputs</div>

  <div v-if="inspecting">
    <li v-for="(input, i) in actionStore.record.exerciseInputs" :key="i" class="q-ml-sm">
      {{ input }}
    </li>
  </div>

  <div v-else>
    <p>
      Select inputs that represents the type of data you want to record. Select no inputs if you
      want the exercise to be purely instructional. This cannot be updated once set during record
      creation.
    </p>

    <QSelect
      :disable="route.name === RouteName.EDIT"
      v-model="actionStore.record.exerciseInputs"
      :rules="[(val: ExerciseInput[]) => exerciseInputsSchema.safeParse(val).success || 'Required']"
      :options="options"
      lazy-rules
      multiple
      counter
      emit-value
      map-options
      options-dense
      dense
      outlined
      color="primary"
    >
      <template v-if="route.name === RouteName.EDIT" v-slot:prepend>
        <QIcon color="warning" :name="Icon.LOCK" />
      </template>
    </QSelect>
  </div>
</template>
