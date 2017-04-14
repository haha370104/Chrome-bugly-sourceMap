/**
 * Created by haha370104 on 2017/4/11.
 */
const getSourceMapByGit = (version) => {
  return new Promise((resove, reject) => {
    getSourceMapLink(version).then((url) => {
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
  });
};
