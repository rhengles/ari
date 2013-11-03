
function dirName(s) {
	return s
    .replace(/[:*]/g, '-')
    .replace(/\.+$/g, ''); // To avoid problems in Windows
  // see http://support.microsoft.com/?kbid=320081
};

export default dirName;