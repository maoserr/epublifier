<template>
  <div id="app">
    <Dialog header="Parser Edit" v-model:visible="diagparser_show" :modal="true" class="p-fluid">
      <div class="p-field">
        <TabView v-model:activeIndex="activePIndex">
          <TabPanel header="Parser">
            <ParserEditor
                :parser_obj="parsers"
                :parser="selectedParser"
                v-model:txt="parser_txt"
                @status="status_txt=$event"></ParserEditor>
          </TabPanel>
        </TabView>
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="save_options"/>
      </template>
    </Dialog>
    <Dialog header="Chapter Edit" v-model:visible="diag_show" :modal="true" class="p-fluid">
      <div class="p-field">
        <label for="title">Name</label>
        <InputText id="title" v-model.trim="chap.title" required="true" autofocus :class="{'p-invalid': !chap.title}"/>
        <small class="p-error" v-if="!chap.title">Title is required.</small>
      </div>
      <div class="p-field">
        <TabView v-model:activeIndex="activeIndex">
          <TabPanel header="Preview">
            <iframe :srcdoc="chap.html_parsed" width="900px" height="600px"></iframe>
          </TabPanel>
          <TabPanel header="Parsed Source">
            <label for="innerhtml">Parsed HTML</label>
            <Textarea id="innerhtml" v-model="chap.html_parsed" required="true" rows="30" cols="150"/>
          </TabPanel>
          <TabPanel header="Full Source">
            <label for="allhtml">Full HTML</label>
            <Textarea id="allhtml" v-model="chap.html" required="true" rows="30" cols="150" disabled="disabled"/>
          </TabPanel>
        </TabView>
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="save_chap"/>
      </template>
    </Dialog>
    <div class="p-fluid p-formgrid p-grid">
      <NovelMetadata
          v-model:tit="title"
          v-model:auth="author"
          v-model:cov="cover"
          v-model:pub="publisher"
          v-model:desc="description"></NovelMetadata>
      <div class="p-field p-col-3">
        <Button icon="pi pi-times" class="p-button-danger" label="Delete Selected" @click="deleteSel($event)"
                :disabled="btn_disabled"/>
      </div>
      <div class="p-field p-col-2">
        <ParserSelector
            :chap_only="true"
            :parser_obj="parsers"
            v-model="selectedParser"></ParserSelector>
      </div>
      <div class="p-field p-col-2">
        <Button class="p-button-info" label="Set Parser" @click="setParser"
                :disabled="btn_disabled"/>
      </div>
      <div class="p-field p-col-2">
        <Button icon="pi pi-user-edit" class="p-button-info" label="Edit Parser" @click="edit_parser"/>
      </div>
      <div class="p-field p-col-3">
        <Button icon="pi pi-external-link" class="p-button-info" label="Export CSV" @click="exportCSV"/>
      </div>
      <div class="p-field p-col-12">
        <DataTable :value="chapts"
                   ref="dt"
                   v-model:selection="selected_chaps"
                   :reorderableColumns="true"
                   @rowReorder="onRowReorder"
                   selectionMode="multiple"
                   :metaKeySelection="false"
                   scrollable scrollHeight="500px"
                   :paginator="true" :rows="100"
                   class="p-datatable-sm"
                   paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                   :rowsPerPageOptions="[100, 200,500]"
                   responsiveLayout="scroll"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false"/>
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column field="url_title" header="URL Title" :sortable="true"></Column>
          <Column field="url" header="URL" :sortable="true">
            <template #body="{ values }: { values: any }">
<!--              <a :href="slotProps.data.url" target="_blank" rel="noopener noreferrer">{{ slotProps.data.url }}</a>-->
            </template>
          </Column>
          <Column field="parser" header="Parser">
<!--            <template #body="slotProps">-->
<!--              {{ slotProps.data.parser ? slotProps.data.parser : "Auto" }}-->
<!--            </template>-->
          </Column>
          <Column field="title" header="Parsed Title" :sortable="true"></Column>
          <Column :exportable="false" style="min-width:8rem" header="Edit Content">
<!--            <template #body="slotProps">-->
<!--              <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm"-->
<!--                      @click="edit_chap(slotProps.data)" :disabled='slotProps.data.html_parsed?null:"disabled"'/>-->
<!--            </template>-->
          </Column>
        </DataTable>
      </div>
      <div class="p-field p-col-12">
        <Message :closable="false">{{ status_txt }}</Message>
        <ProgressBar :value="progress_val" :showValue="true" style="height: .5em"/>
      </div>
      <div class="p-field p-col-6">
        <Button label="Extract Chapters" class="p-button-success" @click="extract_chaps()" :disabled="btn_disabled"/>
      </div>
      <div class="p-field p-col-6">
        <Button label="Compile Epub" class="p-button-success" @click="gen_epub()" :disabled="btn_comp_disabled"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// variable
const msg = 'Hello!'
const chapts:string[] = []
// functions
function log() {
  console.log(msg)
}

</script>
