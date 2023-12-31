<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import { type Ref, ref, onUnmounted } from 'vue'
import type { Subscription } from 'dexie'
import { Icon } from '@/types/general'
import { useMeta } from 'quasar'
import { AppName } from '@/constants/global'
import { getRecordsCountDisplay } from '@/utils/common'
import { hiddenColumnNames } from '@/services/table-columns'
import { Field, RecordGroup, type RecordType, type AnyRecord } from '@/types/core'
import DataSchema from '@/services/DataSchema'
import useLogger from '@/composables/useLogger'
import useRoutables from '@/composables/useRoutables'
import useDialogs from '@/composables/useDialogs'
import DB from '@/services/Database'

useMeta({ title: `${AppName} - Records Data` })

const { log } = useLogger()
const { routeGroup, routeType, goToEdit, goToCreate, goBack } = useRoutables()
const { confirmDialog, inspectDialog, chartsDialog } = useDialogs()

const searchFilter: Ref<string> = ref('')
const rows: Ref<any[]> = ref([])
const columns: Ref<QTableColumn[]> = ref(
  DataSchema.getTableColumns(routeGroup as RecordGroup, routeType as RecordType) as QTableColumn[]
)
const columnOptions: Ref<QTableColumn[]> = ref(
  columns.value.filter((col: QTableColumn) => !col.required)
)
const visibleColumns: Ref<Field[]> = ref(columnOptions.value.map((col) => col.name) as Field[])
let subscription: Subscription | null = null

if (routeGroup === RecordGroup.CORE) {
  subscription = DB.liveCoreRecords(routeType as RecordType).subscribe({
    next: (records) => {
      rows.value = records
    },
    error: (error) => {
      log.error('Error fetching live parent data', error)
    },
  })
} else {
  subscription = DB.liveSubRecords(routeType as RecordType).subscribe({
    next: (records) => {
      rows.value = records
    },
    error: (error) => {
      log.error('Error fetching live child data', error)
    },
  })
}

onUnmounted(() => {
  subscription?.unsubscribe()
})

async function onDelete(group: RecordGroup, id: string) {
  let dialogMessage = ''

  if (group === RecordGroup.CORE) {
    dialogMessage = `Permanently delete ${DataSchema.getLabel(
      routeGroup as RecordGroup,
      routeType as RecordType,
      'singular'
    )} with id ${id}? This will also delete all associated sub-records.`
  } else {
    dialogMessage = `Permanently delete ${DataSchema.getLabel(
      routeGroup as RecordGroup,
      routeType as RecordType,
      'singular'
    )} with id ${id}?`
  }

  confirmDialog('Delete', dialogMessage, Icon.DELETE, 'negative', async () => {
    try {
      await DB.deleteRecord(group, id)
      log.info('Successfully deleted record', { type: routeType, id })
    } catch (error) {
      log.error('Delete failed', error)
    }
  })
}

async function onInspect(type: RecordType, id: string) {
  const title = DataSchema.getLabel(routeGroup as RecordGroup, type, 'singular') as string
  const record = (await DB.getRecord(routeGroup as RecordGroup, id)) as AnyRecord
  const fields = DataSchema.getFields(routeGroup as RecordGroup, type)
  inspectDialog(title, record, fields)
}

async function onCharts(type: RecordType, id: string) {
  const title = DataSchema.getLabel(
    routeGroup as RecordGroup,
    routeType as RecordType,
    'singular'
  ) as string
  chartsDialog(title, type, id)
}
</script>

<template>
  <QTable
    :rows="rows"
    :columns="columns"
    :visible-columns="visibleColumns"
    :rows-per-page-options="[0]"
    :filter="searchFilter"
    virtual-scroll
    fullscreen
    row-key="id"
  >
    <!-- Column Headers -->
    <template v-slot:header="props">
      <QTr :props="props">
        <!-- Do not show hidden columns -->
        <QTh
          v-for="col in props.cols"
          v-show="!hiddenColumnNames.includes(col.name)"
          :key="col.name"
          :props="props"
        >
          {{ col.label }}
        </QTh>
        <QTh auto-width class="text-left">Actions</QTh>
      </QTr>
    </template>

    <!-- Rows -->
    <template v-slot:body="props">
      <QTr :props="props">
        <QTd v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </QTd>
        <QTd auto-width>
          <!-- CHARTS -->
          <QBtn
            v-if="routeGroup === RecordGroup.CORE"
            flat
            round
            dense
            class="q-ml-xs"
            color="accent"
            :icon="Icon.CHARTS"
            @click="onCharts(routeType as RecordType, props.cols[0].value)"
          />
          <!-- INSPECT -->
          <QBtn
            flat
            round
            dense
            class="q-ml-xs"
            color="primary"
            :icon="Icon.INSPECT"
            @click="onInspect(routeType as RecordType, props.cols[0].value)"
          />
          <!-- EDIT -->
          <QBtn
            flat
            round
            dense
            class="q-ml-xs"
            color="orange-9"
            :icon="Icon.EDIT"
            @click="
              goToEdit(routeGroup as RecordGroup, routeType as RecordType, props.cols[0].value)
            "
          />
          <!-- DELETE -->
          <QBtn
            flat
            round
            dense
            class="q-ml-xs"
            color="negative"
            @click="onDelete(routeGroup as RecordGroup, props.cols[0].value)"
            :icon="Icon.DELETE"
          />
        </QTd>
      </QTr>
    </template>

    <template v-slot:top>
      <div class="row justify-start full-width q-mb-md">
        <!-- Table Title -->
        <div class="col-10 text-h6 text-bold ellipsis">
          {{ DataSchema.getLabel(routeGroup as RecordGroup, routeType as RecordType, 'plural') }}
        </div>
        <!-- Go Back Button -->
        <QBtn
          round
          flat
          class="absolute-top-right q-mr-sm q-mt-sm"
          :icon="Icon.CLOSE"
          @click="goBack()"
        />
      </div>

      <div class="row justify-start full-width">
        <div class="col-12">
          <!-- SEARCH -->
          <QInput
            :disable="!rows.length"
            outlined
            dense
            clearable
            debounce="300"
            v-model="searchFilter"
            placeholder="Search"
          >
            <template v-slot:before>
              <!-- CREATE - Child records cannot be created alone on the data table -->
              <QBtn
                color="positive"
                class="q-px-sm q-mr-xs"
                :icon="Icon.ADD"
                @click="goToCreate(routeGroup as RecordGroup, routeType as RecordType)"
              />
              <!-- COLUMN OPTIONS (Visible Columns) -->
              <QSelect
                v-model="visibleColumns"
                :options="columnOptions"
                :disable="!rows.length"
                bg-color="primary"
                standout
                multiple
                dense
                options-dense
                emit-value
                map-options
                option-value="name"
                display-value=""
              >
                <template v-slot:prepend>
                  <QIcon color="white" :name="Icon.OPTIONS" />
                </template>
              </QSelect>
            </template>

            <template v-slot:append>
              <QIcon name="search" />
            </template>
          </QInput>
        </div>
      </div>
    </template>

    <template v-slot:bottom>{{ getRecordsCountDisplay(rows) }}</template>
  </QTable>
</template>
