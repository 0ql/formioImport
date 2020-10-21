<script>
  export let fields, apiPath, recource, keyArray, indexArray;
  let data = [];
  fields = fields.data;
  console.log(fields)
  for (let j = 1; j < fields.length-1; j++) {
    // Upload to Formio

    data = [];
    for (let i = 0; i < indexArray.length; i++) {
      let ob = {};
      ob[keyArray[i]] = fields[j][indexArray[i]];
      data.push(ob);
    }
    console.log(data);

    // fetch(apiPath+"/"+recource+"/submission", {
    //   method: 'POST',
    //   body: 
    // })
  };
</script>