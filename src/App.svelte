<script>
	import Header from "./components/Header.svelte";
	import LiveEndPoint from "./components/LiveEndPoint.svelte";
	import Recource from "./components/Recource.svelte";
	import DefinitionRenderer from "./components/DefinitionRenderer.svelte";
	import DropZone from "./components/DropZone.svelte";
	import Uploader from "./components/Uploader.svelte";

	let recource, apiPath, error = false, errorMsg, definition;
	let fields, keyArray, indexArray;

	async function fetchDefinition() {
		// Definition von formio holen
		// validierung der Inputs
		if (!recource || !apiPath) {
			error = true;
			errorMsg = "Bitte füllen sie zuerst die Felder aus";
		} else {
			error = false;
			await fetch(apiPath+'/'+recource)
			.then(res => res.json())
			.then(body => definition = body)
			.catch((msg) => {
				console.log(msg)
				error = true;
				errorMsg = "Die angegebene Url ist fehlerhaft";
			})
		}
	}
</script>

<Header />
<main class="container">
	<div class="mt-5">
		<LiveEndPoint bind:val={apiPath}/>
		<Recource bind:val={recource}/><br>
		{#if error}
			<div class="alert alert-danger" role="alert">
				{errorMsg}
			</div>
		{/if}
		<button type="button" class="btn btn-primary" on:click={fetchDefinition}>Bestätigen</button>
	</div>
	<div class="mt-3">
		<DropZone bind:fields={fields}/>
	</div>
	{#if definition}
		<DefinitionRenderer bind:indexArray={indexArray} bind:keyArray={keyArray} bind:components={definition.components}/>
	{/if}
	{#if definition && fields}
		<Uploader components={definition.components} indexArray={indexArray} keyArray={keyArray} fields={fields} apiPath={apiPath} recource={recource}/>
		{/if}
</main>