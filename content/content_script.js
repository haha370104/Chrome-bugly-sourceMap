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

const parseExceptionStack = () => {
  let exceptionReason = $('._38UPJ0HCvsWEDOny-zMwDY ._2iGgBDqpRh7LIm9lL58dZ4 ._1tJ29qz4XbUW1oOYooxUuh').eq(0).text();

  if (exceptionReason.indexOf('Unhandled JS Exception') === -1 && exceptionReason.indexOf('JavascriptException') === -1) {
    return;
  }

  let exceptionText = $('._38UPJ0HCvsWEDOny-zMwDY ._2iGgBDqpRh7LIm9lL58dZ4 ._2FtamqAUTU4gVAw6A479iM').eq(0).text();
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

  return parseExceptionStack();
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

const main = async() => {
  let stackInfo = await fetchStackInfo();
  console.log(stackInfo);
  let extraData = $('#error_stack div[data-reactid$="跟踪数据"]')[0];
  extraData.click();

  let version = await fetchVersionInfo();
  try {
    let sourceMap = await getSourceMap(version);
    stackInfo.forEach((exception) => {
      console.log(mapper(sourceMap, exception.line, exception.column));
    });
  } catch (e) {
    console.log('后端无法拉取，选取默认map');
    stackInfo.forEach((exception) => {
      console.log(mapper(sourceMapJson, exception.line, exception.column));
    });
  }
};

main();
