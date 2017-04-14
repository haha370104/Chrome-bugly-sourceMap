/**
 * Created by haha370104 on 2017/4/12.
 */

const submit = () => {
  let exceptionSelector = document.getElementById('exception_selector').value;
  let exceptionStackSelector = document.getElementById('exception_stack_selector').value;
  let sourceMapLink = document.getElementById('source_map_link').value;
  let sourceMapFile = document.getElementById('source_map_file').files[0];

  let reader = new FileReader();
  reader.readAsText(sourceMapFile);
  reader.onload = (evt) => {
    let sourceMap = JSON.parse(evt.target.result);
    chrome.storage.local.set({
      exceptionSelector: exceptionSelector,
      exceptionStackSelector: exceptionStackSelector,
      sourceMapLink: sourceMapLink,
      sourceMap: sourceMap
    }, () => {
      alert('成功');
    });
  };
};

document.getElementById('confirm').addEventListener('click', () => {
  submit();
});

document.getElementById('clear').addEventListener('click', () => {
  chrome.storage.local.clear(() => {
    alert('清空成功');
  })
});
