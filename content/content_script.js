console.log('启动');

function mapper(sourceMap, line, column) {
  let lineMap = {};

  sourceMap.sections.forEach((map, index) => {
    if (map.offset.line == line - 1) {
      lineMap = map;
    }
  });

  let mappingStr = lineMap.map.mappings;

  let mappingFile = mappingStr.split(';');
  let mappingLine = [];
  mappingFile.forEach((line, index) => {
    mappingLine.push(line.split(','));
  });
  let columnNum = 0;
  let sourceLineNum = 0;
  let sourceFileNum = 0;
  let sourceColumnNum = 0;

  mappingLine.forEach((m, index) => {
    for (let index in m) {
      let mapping = m[index];
      try {
        let oneResult = decode(mapping);
        columnNum += oneResult[0];
        sourceFileNum += oneResult[1];
        sourceLineNum += oneResult[2];
        sourceColumnNum += oneResult[3];
        if (columnNum == column) {
          break;
        }
      } catch (e) {
        console.log(mappingStr)
      }
    }
  });
  return {source: lineMap.map.sources[sourceFileNum], line: sourceLineNum, column: sourceColumnNum};
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
  let versionText = $('tr[data-reactid$="userkey0"]')[0].innerText;
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
    innerHTML += `${stack.source}@${stack.line}:${stack.column}</br>`;
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
