<script>
  let dropEvent = false, parsed = false, box;
	export let fields;

  function dragEnter(el) {
    box.style.border = "thick dashed #cd6133";
    box.style.color = "gray";
  }

  function dragLeave() {
    box.style.border = "thick dashed #ffbe76";
    box.style.color = "#222f3e";
  }

  function drop(e) {
    dropEvent = true;
    e.preventDefault();

    let fr = new FileReader();
    fr.onload = () => {
      fields = Papa.parse(fr.result);
      parsed = true;
    }
    fr.readAsText(e.dataTransfer.files[0]);
  }
</script>

<div class="mt-5">
	{#if !dropEvent}
		<div class="dropzone text-center" bind:this={box} on:dragenter={dragEnter} on:dragleave={dragLeave} on:drop={drop} ondragover="return false">
			CSV Datei hier hinein ziehen
		</div>
	{:else if parsed}
		<div class="border rounded p-3">
			<h5 class="mb-3">Die Anzahl der Datensätze Beträgt: {fields.data.length-2}</h5>
			{#each fields.data[0] as field, i}
				<div class="alert alert-dark" role="alert">{i+": "+field}</div>
			{/each}
		</div>
	{/if}
</div>

<style>
  .dropzone {
    padding: 5rem;
    border: thick dashed #ffbe76;
    border-width: 4px;
    border-radius: 8px;
	}
</style>