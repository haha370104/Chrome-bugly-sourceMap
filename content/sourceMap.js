/**
 * Created by haha370104 on 2017/4/11.
 */
const getSourceMapByGit = (version) => {
  return new Promise((resove, reject) => {
    const url = `https://gitlab.baixing.cn/app/pegasus/raw/v${version}/ios/Assets/Pegasus.js.map`;
    $.get(url, (data, status) => {
      if (status === 'success') {
        resove(JSON.parse(data));
      } else {
        reject(data);
      }
    }).fail(() => {
      reject();
    })
  });
};
