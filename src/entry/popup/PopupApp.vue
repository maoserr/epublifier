<template>
  <div id="app">
    <div class="content pure-u-1">
      <form class="pure-form pure-form-aligned">
        <div class="pure-control-group">
          <label for="page_type">Page Type</label>
          <select id="page_type">
            <option value="toc">Table of Contents</option>
            <option value="first">First Page</option>
          </select>
        </div>
        <div class="pure-control-group">
          <label for="url">Page URL:</label>
          <input type="text" id="url" style="width:70%" :value="url"/>
        </div>
        <div class="pure-control-group">
          <label for="css_selector">CSS Selector:</label>
          <input type="text" id="css_selector" style="width:70%"/>
        </div>
        <div class="pure-control-group">
          <label for="chapt_start">Chapter Start:</label>
          <input type="number" id="chapt_start" :value="start"/>
        </div>
        <div class="pure-control-group">
          <label for="chapt_cnt">Max Chapers:</label>
          <input type="number" id="chapt_cnt" :value="max_cnt"/>
        </div>
        <div class="pure-controls">
          <div id="msg">{{ status_txt }}</div>
          <input
              type="button"
              value="Start UI"
              class="pure-button"
              id="start_ui"
              v-on:click="start_main()"
          />
        </div>
      </form>
    </div>

    <div>
      <div class="content">
        <div class="feature-intro">
          <h1>Form Layout</h1>
          <p>Form layout is a CSS utility optimized for creating forms with ease. FormLayout is not included in PrimeVue as it is provided by <a href="https://github.com/primefaces/primeflex">PrimeFlex</a>,
            a shared grid library between PrimeFaces, PrimeNG, PrimeReact and PrimeVue projects.</p>
        </div>
        <AppDemoActions />
      </div>

      <div class="content-section implementation">
        <div class="card">
          <h5>Vertical</h5>
          <div class="p-fluid">
            <div class="p-field">
              <label for="firstname1">Firstname</label>
              <InputText id="firstname1" type="text" />
            </div>
            <div class="p-field">
              <label for="lastname1">Lastname</label>
              <InputText id="lastname1" type="text" />
            </div>
          </div>
        </div>

        <div class="card">
          <h5>Vertical and Grid</h5>
          <div class="p-fluid p-formgrid p-grid">
            <div class="p-field p-col">
              <label for="firstname2">Firstname</label>
              <InputText id="firstname2" type="text" />
            </div>
            <div class="p-field p-col">
              <label for="lastname2">Lastname</label>
              <InputText id="lastname2" type="text" />
            </div>
          </div>
        </div>

        <div class="card">
          <h5>Horizontal and Fixed Width</h5>
          <div class="p-field p-grid">
            <label for="firstname3" class="p-col-fixed" style="width:100px">Firstname</label>
            <div class="p-col">
              <InputText id="firstname3" type="text" />
            </div>
          </div>
          <div class="p-field p-grid">
            <label for="lastname3" class="p-col-fixed" style="width:100px">Lastname</label>
            <div class="p-col">
              <InputText id="lastname3" type="text" />
            </div>
          </div>
        </div>

        <div class="card">
          <h5>Horizontal and Fluid</h5>
          <div class="p-fluid">
            <div class="p-field p-grid">
              <label for="firstname4" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Firstname</label>
              <div class="p-col-12 p-md-10">
                <InputText id="firstname4" type="text" />
              </div>
            </div>
            <div class="p-field p-grid">
              <label for="lastname4" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Lastname</label>
              <div class="p-col-12 p-md-10">
                <InputText id="lastname4" type="text" />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h5>Inline</h5>
          <div class="p-formgroup-inline">
            <div class="p-field">
              <label for="firstname5" class="p-sr-only">Firstname</label>
              <InputText id="firstname5" type="text" placeholder="Firstname" />
            </div>
            <div class="p-field">
              <label for="lastname5" class="p-sr-only">Lastname</label>
              <InputText id="lastname5" type="text" placeholder="Lastname" />
            </div>
            <Button type="button" label="Submit" />
          </div>
        </div>

        <div class="card">
          <h5>Vertical Checkbox</h5>
          <div class="p-field-checkbox">
            <Checkbox id="city1" name="city1" value="Chicago" v-model="cities1" />
            <label for="city1">Chicago</label>
          </div>
          <div class="p-field-checkbox">
            <Checkbox id="city2" name="city1" value="Los Angeles" v-model="cities1" />
            <label for="city2">Los Angeles</label>
          </div>

          <h5>Horizontal Checkbox</h5>
          <div class="p-formgroup-inline">
            <div class="p-field-checkbox">
              <Checkbox id="city3" name="city2" value="Chicago" v-model="cities2" />
              <label for="city3">Chicago</label>
            </div>
            <div class="p-field-checkbox">
              <Checkbox id="city4" name="city2" value="Los Angeles" v-model="cities2" />
              <label for="city4">Los Angeles</label>
            </div>
          </div>
        </div>

        <div class="card">
          <h5>Vertical RadioButton</h5>
          <div class="p-field-radiobutton">
            <RadioButton id="city5" name="city1" value="Chicago" v-model="city1" />
            <label for="city5">Chicago</label>
          </div>
          <div class="p-field-radiobutton">
            <RadioButton id="city6" name="city1" value="Los Angeles" v-model="city1" />
            <label for="city6">Los Angeles</label>
          </div>

          <h5>Horizontal RadioButton</h5>
          <div class="p-formgroup-inline">
            <div class="p-field-radiobutton">
              <RadioButton id="city7" name="city2" value="Chicago" v-model="city2" />
              <label for="city7">Chicago</label>
            </div>
            <div class="p-field-radiobutton">
              <RadioButton id="city8" name="city2" value="Los Angeles" v-model="city2" />
              <label for="city8">Los Angeles</label>
            </div>
          </div>
        </div>

        <div class="card">
          <h5>Help Text</h5>
          <div class="p-field p-fluid">
            <label for="username">Username</label>
            <InputText id="username" type="username" aria-describedby="username-help" />
            <small id="username-help">Enter your username to reset your password.</small>
          </div>
        </div>

        <div class="card">
          <h5>Advanced</h5>
          <div class="p-fluid p-formgrid p-grid">
            <div class="p-field p-col-12 p-md-6">
              <label for="firstname6">Firstname</label>
              <InputText id="firstname6" type="text" />
            </div>
            <div class="p-field p-col-12 p-md-6">
              <label for="lastname6">Lastname</label>
              <InputText id="lastname6" type="text" />
            </div>
            <div class="p-field p-col-12">
              <label for="address">Address</label>
              <Textarea id="address" rows="4" />
            </div>
            <div class="p-field p-col-12 p-md-6">
              <label for="city">City</label>
              <InputText id="city" type="text" />
            </div>
            <div class="p-field p-col-12 p-md-3">
              <label for="state">State</label>
              <Dropdown inputId="state" v-model="selectedState" :options="states" optionLabel="name" placeholder="Select" />
            </div>
            <div class="p-field p-col-12 p-md-3">
              <label for="zip">Zip</label>
              <InputText id="zip" type="text" />
            </div>
          </div>
        </div>
      </div>

      <FormLayoutDoc />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IndexData, PopupMsg} from "../../common/novel_data";
import browser from "webextension-polyfill";
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import Card from 'primevue/card';

export default defineComponent({
  name: 'App',
  components: {
    InputText,
    Checkbox,
    RadioButton,
    Card
  },
  data() {
    return {
      title: "Epublifier",
      url: "",
      start: 1,
      max_cnt: 300,
      status_txt: "",
      ind_data: null as IndexData,
    }
  },
  /**
   * Mounted hook
   */
  mounted() {
    let vm = this
    browser.tabs.query({active: true, currentWindow: true}).then(
        tabs => {
          vm.url = tabs[0].url;
        }
    );
    browser.runtime.onMessage.addListener(
        request => {
          if (request.action == "getSource") {
            vm.ind_data = request.data;
          }
        }
    );
    this.check_curr_page();
  },
  methods: {
    start_main() {
      let vm = this
      browser.tabs.create({url: "main.html", active: true}).then(
          t => {
            vm.send_msg(t, {ind_data: vm.ind_data, start: vm.start, cnt: vm.max_cnt});
          }
      );
    },
    check_curr_page() {
      let vm = this
      vm.status_txt = "Injecting...";
      browser.tabs.executeScript(null, {file: "js/getPageSource.js",}).then(
          () => {
            // If you try and inject into an extensions page or the webstore/NTP you'll get an error
            if (browser.runtime.lastError) {
              vm.status_txt = "There was an error injecting script : \n" +
                  browser.runtime.lastError.message;
            } else {
              vm.status_txt = "Script success.";
            }
          }
      );
    },
    /**
     * Statis function to send parsed data/config to Main UI
     * @param tab
     * @param data
     */
    send_msg(
        tab: browser.Tabs.Tab,
        data: PopupMsg
    ) {
      let msg = document.getElementById("msg");
      msg.innerText += data.start
      let tab_msg = {
        action: "newTabSource",
        data: data
      }
      let handler = function (tabid: number, changeInfo: any) {
        if (tabid === tab.id && changeInfo.status === "complete") {
          browser.tabs.onUpdated.removeListener(handler);
          browser.tabs.sendMessage(tabid, tab_msg);
        }
      };
      // in case we're faster than page load (usually):
      browser.tabs.onUpdated.addListener(handler);
      // just in case we're too late with the listener:
      browser.tabs.sendMessage(tab.id, tab_msg);
      msg.innerText += "Done";
    }
  }
})
</script>
<style>
@import 'primeflex/primeflex.css';
@import 'primevue/resources/themes/saga-blue/theme.css';
@import 'primevue/resources/primevue.min.css';
@import 'primeicons/primeicons.css'
</style>