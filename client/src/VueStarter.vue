<script setup lang="ts">

import {Environment} from "@/Environment";
import { Redirect } from "./Redirect";

async function init() {
    document.body.innerHTML = null; // necessary for hot-deployment (npm run dev)
    Redirect.redirectIfNecassary();
    let html = await Environment.create().createApp().createStarter().fullStart();
    document.body.appendChild(html);
}

init();

</script>

<template>
</template>

<style scoped>
</style>