<script>
  let dropEvent = false, parsed = false;
  export let fields;

  function dragEnter() {
    // console.log("enter");
  }

  function dragLeave() {
    // console.log("leave");
  }

  function drop(e) {
    dropEvent = true;
    e.preventDefault();

    let fr = new FileReader();
    fr.onload = () => {
      // parse CSV
      fields = Papa.parse(fr.result);
      parsed = true;
    }
    fr.readAsText(e.dataTransfer.files[0])
  }
</script>

{#if !dropEvent}
  <div on:dragenter={dragEnter} on:dragleave={dragLeave} on:drop={drop} ondragover="return false" class="dropzone">
    CSV Datei hier hinein ziehen
  </div>
{:else if parsed}
  <div>Die Anzahl der Datensätze Beträgt: {fields.data.length-1}</div>
  {#each fields.data[0] as field, i}
    <div>{i+": "+field}</div>
  {/each}
{/if}

<style>
  .dropzone {
    padding: 1rem;
    width: 80%;
    border: thick dashed #ffbe76;
    border-width: 4px;
    border-radius: 8px;
  }

  .dropzone.dragover {
    border-color: rgb(255, 208, 0);
  }
</style>