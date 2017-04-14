let SourceMap = require('source-map');

console.log('启动');

function mapper(sourceMap, line, column) {
  let smc = new SourceMap.SourceMapConsumer(sourceMap);
  return smc.originalPositionFor({
    line: line,
    column: column
  });
}

const sendMessage = (message) => {
  return new Promise((resove, reject) => {
    chrome.runtime.sendMessage(message, (result) => {
      resove(result);
    })
  })
};

const parseExceptionStack = async() => {
  let exceptionReason = $(await getExceptionSelector()).eq(0).text();

  if (exceptionReason.indexOf('Unhandled JS Exception') === -1 && exceptionReason.indexOf('JavascriptException') === -1) {
    return;
  }

  let exceptionText = $(await getExceptionStackSelector()).eq(0).text();
  let stack = exceptionText.split('\n').slice(1);
  stack.pop();
  let resultStack = [];
  stack.forEach((exception, index) => {
    if (!exception) {
      return;
    }
    let e = exception.split('@');
    if (e.length < 2) {
      return;
    }
    let e2 = e[1].split(':');
    if (e2.length < 2) {
      return;
    }

    let ex = {fun: e[0], line: e2[0], column: e2[1]};
    resultStack.push(ex);
  });

  return resultStack;
};

const parsePegasusVersion = () => {
  let versionDOM = $('tr[data-reactid$="userkey0"]')[0]
  let versionText = versionDOM && versionDOM.innerText;
  if (!versionText) {
    return null;
  }
  if (versionText.indexOf('PegasusVersion') === -1 || versionText.indexOf('	') === -1) {
    return null;
  }
  return versionText.split('	')[1];
};

const fetchStackInfo = async() => {
  let result = await sendMessage({url: document.URL, type: 'stack'});
  if (!result.result) {
    return;
  }

  return await parseExceptionStack();
  // resultStack.forEach((exception, index) => {
  //   console.log(mapper(exception.fun, exception.line, exception.column));
  // });
};

const fetchVersionInfo = async() => {
  let result = await sendMessage({url: document.URL, type: 'version'});
  if (!result.result) {
    return;
  }

  return parsePegasusVersion()
};

const parseMinStack = (sourceMap, stack) => {
  let resultInfos = [];
  stackInfo.forEach((exception) => {
    resultInfos.push(mapper(sourceMap, exception.line, exception.column));
  });
  return resultInfos;
};

const insertStackInDom = async(stackInfos) => {
  let innerHTML = `</br>---------------------------------------------</br>
     sourceMap解析后：</br>
  `;
  console.log(stackInfos);
  stackInfos.forEach((stack) => {
    innerHTML += `${stack.name || ''}@${stack.line}:${stack.column}(${stack.source})</br>`;
  });
  let exceptionDiv = $(await getExceptionStackSelector())[0];
  exceptionDiv.innerHTML += innerHTML;
};

const insertInputInDom = async() => {
  let errorStackDiv = $('#error_stack')[0];
  errorStackDiv.innerHTML += '<div class="cfR1aMZlBkE_yK7jWGQ-C"><input type="file" id="sourceMapFile"/></div>';
  document.getElementById('sourceMapFile').addEventListener('change', () => {
    let sourceMapFile = document.getElementById('sourceMapFile').files[0];
    let reader = new FileReader();
    reader.readAsText(sourceMapFile);
    reader.onload = (evt) => {
      let sourceMap = JSON.parse(evt.target.result);
      let resultInfos = parseMinStack(sourceMap, stackInfo);
      insertStackInDom(resultInfos).then(() => {
        console.log('加载成功');
      });
    };
  });
};

const main = async() => {
  stackInfo = await fetchStackInfo();
  let extraData = $('#error_stack div[data-reactid$="跟踪数据"]')[0];
  extraData.click();

  version = await fetchVersionInfo();
  let stackData = $('#error_stack div[data-reactid$="出错堆栈"]')[0];
  stackData.click();

  try {
    let resultInfos;
    try {
      let sourceMap = await getSourceMapByGit(version);
      resultInfos = parseMinStack(sourceMap, stackInfo);
    } catch (e) {
      let sourceMap = await getSourceMap();
      resultInfos = parseMinStack(sourceMap, stackInfo);
    }

    await insertStackInDom(resultInfos);
  } catch (e) {
    await insertInputInDom();
    console.log('未找到对应文件，请自行上传')
  }
};

let stackInfo;
let version;
main();
