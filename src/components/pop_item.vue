<template>
  <div class="pure-g">
    <div class="pure-u-1-3">
      <label for="{{ name }}">{{ title }}</label>
    </div>
    <div class="pure-u-2-3">
      <input type="{{ type }}" id="{{name}}" value="{{value}}" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class PopItem extends Vue {
  name: string;
  title: string;
  type: string;
  value: string;

  constructor() {
    super();
  }
}
</script>
