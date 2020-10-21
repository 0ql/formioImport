<script>
  export let components;
  let error = false, errorMsg
  export let indexArray = [];
  export let keyArray = [];

  // durch components loopen, daten Objekt vorbereiten
  // console.log(components);
  components.forEach(component => {
    if (component.type === "textfield") {
      let key = component.key;
      keyArray.push(key);
    } else if (component.type === "textarea") {
      let key = component.key;
      keyArray.push(key);
    } else if (component.type === "number") {
      let key = component.key;
      keyArray.push(key);
    } else if (component.type === "button") {
      keyArray.push(null)
    } else {
      error = true;
      errorMsg = "Component art nicht Unterstützt";
    }
  });
</script>

{#if !error}
  <div class="form">
    {#each components as component, i}
      {#if component.type === "textfield"}
        <div class="flex">
          <input type="number" class="small" bind:value={indexArray[i]}>
          <!-- <input type="text" bind:value={data[i][keyArray[i]]}> -->
          <div>Text Feld</div>
        </div>
      {:else if component.type === "textarea"}
        <div class="flex">
          <input type="number" class="small" bind:value={indexArray[i]}>
          <div>Text Area Feld</div>
        </div>
      {:else if component.type === "number"}
        <div class="flex">
          <input type="number" class="small" bind:value={indexArray[i]}>
          <div>Number Feld</div>
        </div>
      {/if}
    {/each}
  </div>
{:else}
  <div>
    {errorMsg}
  </div>
{/if}

<style>
  .form {
    padding: 2rem;
    background-color: #ecf0f1;
    border-radius: 8px;
    margin-top: 2rem;
    margin-left: 10%;
    margin-right: 10%;
  }

  .small {
    width: 3rem;
  }
</style>