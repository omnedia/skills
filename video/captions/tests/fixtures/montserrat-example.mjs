// Exact user-supplied word timing, in seconds; no estimated or redistributed timing.
export const transcript = {duration:9.0,time_unit:'seconds',words:[
  ['Every',0,.35],['great',.35,.65],['idea',.65,1.15],
  ['starts',1.15,1.5],['with',1.5,1.7],['a',1.7,1.8],['spark.',1.8,2.5],
  ['Add',2.8,3.1],['a',3.1,3.2],['little',3.2,3.5],['motion,',3.5,4.1],
  ['turn',4.3,4.6],['up',4.6,4.8],['the',4.8,5],['energy,',5,5.7],
  ['and',6,6.2],['watch',6.2,6.6],['your',6.6,6.85],['words',6.85,7.35],
  ['come',7.35,7.7],['to',7.7,7.9],['life.',7.9,9],
].map(([text,start,end])=>({text,start,end}))};
const boundaries = [[0,3],[3,7],[7,11],[11,15],[15,19],[19,22]];
export const sentences=boundaries.map(([from,to])=>({words:transcript.words.slice(from,to).map((w,i)=>({
  text:(i?' ':'')+w.text,startMs:Math.round(w.start*1000),endMs:Math.round(w.end*1000),timestampMs:null,confidence:null,
}))}));
const one=(from,extra={})=>({from,to:from+1,shadow:true,...extra});
export const styleOptions={phrases:{
  0:{layout:'asymmetric',groups:[one(0),one(1,{emphasis:true}),one(2,{italic:true})]},
  1:{layout:'stacked',groups:[one(0),one(1,{line:1}),one(2,{line:1}),one(3,{line:2,emphasis:true,colorRole:'blue'})]},
  2:{layout:'stacked',groups:[one(0,{line:0}),one(1,{line:0}),one(2,{line:1,italic:true}),one(3,{line:2,emphasis:true,colorRole:'turquoise',size:110})]},
  3:{layout:'stacked',groups:[one(0,{line:0}),one(1,{line:0}),one(2,{line:1}),one(3,{line:2,emphasis:true,colorRole:'gold',size:110})]},
  4:{layout:'single',behavior:'replace',reveal:'instant',groups:[0,1,2,3].map(i=>one(i,{size:108}))},
  5:{layout:'stacked',groups:[one(0),one(1,{italic:true}),one(2,{emphasis:true,size:150})]},
}};
