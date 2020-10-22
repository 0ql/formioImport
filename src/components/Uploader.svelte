<script>
  export let fields, apiPath, recource, keyArray, indexArray, components;

  fields = fields.data;
	let error = false, errorMsg;
  let j = 1; // Das erste Feld soll ausgelassen werden

  function upload() {

    // Daten Objekt erstellen
    let data = {};
    // console.log(keyArray, components, fields);
    for (let i = 0; i < indexArray.length; i++) { // sollte gleiche Länge wie die Components haben

      if (components[i].type === "textfield") {
        data[keyArray[i]] = fields[j][indexArray[i]];
      } else if (components[i].type === "textarea") {
        data[keyArray[i]] = fields[j][indexArray[i]];
      } else if (components[i].type === "number") {
        // TODO: parseFloat parsed nummern weg
        data[keyArray[i]] = parseFloat(fields[j][indexArray[i]]);
      } else {
        error = true;
      }
    }

    data = JSON.stringify({"data": data});

    fetch("https://wpjilvsfrouawvl.form.io/in/submission", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
		})
		.then(res => res.json())
		.then(body => {
			console.log("Antwort", body);
      if (j === fields.length-2) return;
      j++;
      upload();
		})
		.catch(er => {
			// TODO: errorhandling
			console.log(er);
			error = true;
			errorMsg = er;
    });
    
  }

  upload();

</script>

{#if error}
  <div class="alert alert-danger" role="alert">
		{errorMsg}
	</div>
{/if}