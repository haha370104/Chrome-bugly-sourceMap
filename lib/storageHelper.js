/**
 * Created by haha370104 on 2017/4/12.
 */

const getStorageItem = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (item) => {
      resolve(item[key]);
    })
  })
};

const getExceptionSelector = async() => {
  let result = await getStorageItem('exceptionSelector');
  if (result) {
    return result;
  }
  return '._38UPJ0HCvsWEDOny-zMwDY ._2iGgBDqpRh7LIm9lL58dZ4 ._1tJ29qz4XbUW1oOYooxUuh';
};

const getExceptionStackSelector = async() => {
  let result = await getStorageItem('exceptionStackSelector');
  if (result) {
    return result;
  }
  return '._38UPJ0HCvsWEDOny-zMwDY ._2iGgBDqpRh7LIm9lL58dZ4 ._2FtamqAUTU4gVAw6A479iM';
};

const getSourceMap = async() => {
  return await getStorageItem('sourceMap');
};
