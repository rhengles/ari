import read from './read';
import saveJson from '../jpopsuki/saveJson';

function fmt(obj) {
	return JSON.stringify(obj, null, '\t');
}
function store(data) {
	var eol = '\r\n'
		, eolen = eol.length;
	return function() {
		if ( !data ) {
			return;
		}
		var p = data.indexOf(eol)
			, res;
		if (p == -1) {
			res = data;
			data = null;
		} else {
			res = data.substr(0, p);
			data = data.substr(p+eolen);
		}
		return res.split('\t');
	}
}
var estados = {};
var estadosMun = {};
var regioes =
		{ '1': 'Norte'
		, '2': 'Nordeste'
		, '3': 'Sudeste'
		, '4': 'Sul'
		, '5': 'Centro-Oeste'
		};

for ( var k in regioes ) {
	if ( regioes.hasOwnProperty(k) ) {
		regioes[k] =
			{ id: k
			, nome: regioes[k]
			, estados: {}
			};
	}
}

read(
	{ path: '../../ibge/dtb_2013.txt'
	, cb: function(data) {
			var getline = store(data)
				, line = getline();
			console.log(fmt(line));
			while ( line = getline() ) {
				var cEst = line[0]
					, nEst = line[1]
					, est  = null
					, estMun = null
					, cReg = cEst[0]
					, reg = null
					, rEst = null
					, cMes = line[2]
					, nMes = line[3]
					, mes  = null
					, cMic = line[4]
					, nMic = line[5]
					, mic  = null
					, cMun = line[6]
					, nMun = line[7]
					, mun  = null
					, cDis = line[8]
					, nDis = line[9]
					, dis  = null
					, cSub = line[10]
					, nSub = line[11]
					, sub  = null;

				if ( !+cEst ) continue;
				est = estados[cEst];
				if ( !est ) {
					console.log('Estado '+cEst+' '+nEst);
					est =
						{ id: cEst
						, nome: nEst
						, mesorregioes: {}
						};
					estados[cEst] = est;
				} else if ( est.nome != nEst ) {
					console.log('ND ESTADO "'+est.nome+'" "'+nEst+'"');
				}

				estMun = estadosMun[cEst];
				if ( !estMun ) {
					estMun = {};
					estadosMun[cEst] = estMun;
				}

				if ( cReg && regioes[cReg] ) {
					reg = regioes[cReg];
					rEst = reg.estados;
					if ( !rEst[cEst] ) {
						rEst[cEst] = est;
					}
				}

				if ( !+cMes ) continue;
				mes = est.mesorregioes[cMes];
				if ( !mes ) {
					console.log('..Mesorregião '+cMes+' '+nMes);
					mes =
						{ id: cMes
						, nome: nMes
						, microrregioes: {}
						};
					est.mesorregioes[cMes] = mes;
				} else if ( mes.nome != nMes ) {
					console.log('ND MESORREGIÃO "'+mes.nome+'" "'+nMes+'"');
				}

				if ( !+cMic ) continue;
				mic = mes.microrregioes[cMic];
				if ( !mic ) {
					console.log('....Microrregião '+cMic+' '+nMic);
					mic =
						{ id: cMic
						, nome: nMic
						, municipios: {}
						};
					mes.microrregioes[cMic] = mic;
				} else if ( mic.nome != nMic ) {
					console.log('ND MICRORREGIÃO "'+mic.nome+'" "'+nMic+'"');
				}

				if ( !+cMun ) continue;
				mun = mic.municipios[cMun];
				if ( !mun ) {
					console.log('......Município '+cMun+' '+nMun);
					mun =
						{ id: cMun
						, nome: nMun
						, distritos: {}
						};
					mic.municipios[cMun] = mun;
				} else if ( mun.nome != nMun ) {
					console.log('ND MUNICÍPIO "'+mun.nome+'" "'+nMun+'"');
				}

				estMun[cMun.substr(0, 4)] = nMun;

				if ( !+cDis ) continue;
				dis = mun.distritos[cDis];
				if ( !dis ) {
					console.log('........Distrito '+cDis+' '+nDis);
					dis =
						{ id: cDis
						, nome: nDis
						, subdistritos: {}
						};
					mun.distritos[cDis] = dis;
				} else if ( dis.nome != nDis ) {
					console.log('ND DISTRITO "'+dis.nome+'" "'+nDis+'"');
				}

				if ( !+cSub ) continue;
				sub = dis.subdistritos[cSub];
				if ( !sub ) {
					console.log('..........Subdistrito '+cSub+' '+nSub);
					sub =
						{ id: cSub
						, nome: nSub
						};
					dis.subdistritos[cSub] = sub;
				} else if ( sub.nome != nSub ) {
					console.log('ND SUBDISTRITO "'+sub.nome+'" "'+nSub+'"');
				}

			}
			saveJson({dir: '../../ibge/', name: 'dtb_2013.json'}, estados);
			saveJson({dir: '../../ibge/', name:  'regioes.json'}, regioes);
			saveJson({dir: '../../ibge/', name:   'estmun.json'}, estadosMun);
		}
	});