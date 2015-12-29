import writer from './writerSimple';

function saveJson(name, data, cb) {
  data = JSON.stringify(data, null, '\t');
  writer(name, data, cb);
}

export default saveJson;