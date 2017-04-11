/**
 * Created by haha370104 on 2017/4/11.
 */
const getSourceMap = (version) => {
  return new Promise((resove, reject) => {
    const baseUrl = 'http://';
    throw new Error('123');
    $.get(baseUrl, {version: version}, (data, status) => {
      if (status === 'success') {
        resove(data);
      } else {
        reject(data);
      }
    })
  });
};
