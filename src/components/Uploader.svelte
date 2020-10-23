<script>
  export let fields, apiPath, recource, keyArray, indexArray, components;
  let j = 1, pressed = false, error = false, errorMsg, progress = 0, onePercent;
  let progressBar, done = false;

  function startUpload() {
    fields = fields.data;
    pressed = true;

    // compute Progress
    onePercent = (fields.length-2) / 100;
    upload();
  }

  function updateProgress() {
    progress = j / onePercent;
    progressBar.style.width = progress+"%";
  }

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
        let pointCounter = 0, str = fields[j][indexArray[i]];
        for (let k = 0; k < str.length; k++) {
          switch(str.charAt(k)) {
            case ",":
              error = true;
              errorMsg = "Komma statt Punkt verwendet in Zeile: "+(j+1);
              return;
            case ".":
              pointCounter++;
              if (pointCounter > 1) {
                error = true;
                errorMsg = "Mehrere Punkte in einer Nummer in Zeile: "+(j+1);
                return;
              } else {
                break;
              }
          }
        }
        data[keyArray[i]] = parseFloat(fields[j][indexArray[i]]);
      } else {
        error = true;
        errorMsg = "Component nicht Unterstützt.";
        return;
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
      // console.log("Antwort", body);
      updateProgress();
      if (j === fields.length-2) {
        done = true;
        return;
      }; // NOTE: Papaparse Bug verursacht noch eine lehre Array am ende
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

</script>

{#if error}
  <div class="alert alert-danger" role="alert">{errorMsg}</div>
{:else if !pressed}
  <button type="button" class="btn btn-success mt-3" on:click={startUpload}>Upload Starten</button>
{:else}
  <div class="mt-3">
    {j} / {fields.length-2} Datensätze hochgeladen
  </div>
  <div class="progress mt-3">
    <div bind:this={progressBar} class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
  </div>
  {#if done}
    <div class="alert alert-success mt-3" role="alert">
      Datenbank erfolgreich hochgeladen
    </div>
  {/if}
{/if}
