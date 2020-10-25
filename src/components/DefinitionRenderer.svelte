<script>
	import Feld from "./Feld.svelte";
  export let components, indexArray = [], keyArray = [];
  let error = false, errorMsg;

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
  <div class="border rounded pl-3 pr-3 pb-3 mt-3">
    {#each components as component, i}
      {#if component.type === "textfield"}
        <!-- <input type="text" bind:value={data[i][keyArray[i]]}> -->
				<Feld bind:index={indexArray[i]} msg={"Text Feld"} label={component.label}/>
      {:else if component.type === "textarea"}
        <Feld bind:index={indexArray[i]} msg={"Text Area Feld"} label={component.label}/>
      {:else if component.type === "number"}
				<Feld bind:index={indexArray[i]} msg={"Number Feld"} label={component.label}/>
      {/if}
    {/each}
  </div>
{:else}
  <div>
    {errorMsg}
  </div>
{/if}