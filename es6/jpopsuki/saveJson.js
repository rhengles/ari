import writer from './writer';

function saveJson(name, data) {
  data = JSON.stringify(data, null, '\t');
  writer(name, data);
}

export default saveJson;