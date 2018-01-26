/**
 * Created by haha370104 on 2017/4/10.
 */
function getDomainFromUrl(url) {
  let host = "null";
  if (typeof url === "undefined" || null == url)
    url = window.location.href;
  let regex = /.*\:\/\/([^\/]*).*/;
  let match = url.match(regex);
  if (typeof match !== "undefined" && null != match)
    host = match[1];
  return host;
}

chrome.runtime.onMessage.addListener(checkForValidUrl);

function checkForValidUrl(message, sender, sendResponse) {
  if (getDomainFromUrl(message.url).toLowerCase() !== "bugly.qq.com") {
    return;
  }
  if (message.type === 'stack') {
    stackListener(sendResponse)
  } else if (message.type === 'version') {
    versionListener(sendResponse)
  }
  return true;
}

function stackListener(sendResponse) {
  chrome.webRequest.onCompleted.addListener(
    (detail) => {
      sendResponse({result: 1});
      chrome.webRequest.onCompleted.removeListener()
    },
    {urls: ['https://bugly.qq.com/v2/crashDoc/appId/*/platformId/*']}
  );
}

function versionListener(sendResponse) {
  chrome.webRequest.onCompleted.addListener(
    (detail) => {
      sendResponse({result: 1});
      chrome.webRequest.onCompleted.removeListener()
    },
    {urls: ['https://bugly.qq.com/v2/appDetailCrash/appId/*/platformId/*']}
  );
}
