// ==================================================================================================================
// This is a demo for uploading image and data file pairs:
// i.e. 'a.jpg' + 'a.json' + 'b.png' + 'b.json' + ...
// files is an array of file names selected for uploading.
// This function `checkFiles` checks whether all images have corresponding data (json) files, respectively.
// It gives error if there is at least one image that is found with no matching json file.

const checkFiles = (files) => {
  const ret = { error: null };
  if (files.length < 1) {
    ret.error = 'No file selected!';
    return ret;
  }
  const filenamesImgs = [];
  const filenameJsons = [];
  let matchImg = null;
  let matchJson = null;
  for (let i = 0; i < files.length; i++) {
    matchImg = /(.+)(\.jpe?g|\.png)$/i.exec(files[i].name);
    if (matchImg) {
      filenamesImgs.push(matchImg[1]);
    } else {
      matchJson = /(.+)\.json$/i.exec(files[i].name);
      if (matchJson) {
        filenameJsons.push(matchJson[1]);
      }
    }
  }
  if (filenamesImgs.length < 1) {
    ret.error = 'No valid image file!';
    return ret;
  }
  for (let i = 0; i < filenamesImgs.length; i++) {
    if (filenameJsons.indexOf(filenamesImgs[i]) < 0) {
      ret.error = `Cannot find ${filenamesImgs[i]}.json!`;
      return ret;
    }
  }
  return ret;
};

const uploadFiles = (files) => {
  const formData = new FormData();
  // Can't simple attach the file array as the value...
  // Will have to append one by one
  // formData.append('marks', files);
  for (let i = 0; i < files.length; i++) {
    formData.append('marks', files[i]);
  }

  fetch('/api/images', {
    method: 'POST',
    body: formData,
  })
    .then(res => res.json())
    .catch(err => console.error('Error: ', err))
    .then(res => console.log('Success: ', res));
};

const main = () => {
  // Get the input.
  const inputFs = document.querySelector('input[name="marks"]');
  inputFs.addEventListener('change', () => {
    const files = inputFs.files;
    const ret = checkFiles(files);
    if (ret.error) {
      alert(ret.error);
      return;
    }
    uploadFiles(files);
  });
};

window.addEventListener('load', main);
