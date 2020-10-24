<template>
  <div id="app">
    <div id="metadata">
      <label for="title">Title</label>
      <input type="text" id="title" value="No Title" />
      <label for="author">Author</label>
      <input type="text" id="author" value="No Author" />
      <label for="cover">Cover</label>
      <input type="text" id="cover" value="https://i.imgur.com/tb2oqpx.jpeg" />
      <img id="img_show" src="https://i.imgur.com/tb2oqpx.jpeg" />
    </div>
    <div id="chapters">
      <input type="text" id="na" value="test.html" readonly />
    </div>
    <div id="compile_result"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class App extends Vue {
  title: string;
  constructor() {
    super();
    this.title = "Epublifier";
  }
}
</script>
