// Authored demonstration timing, NOT an aligned transcript of the supplied video.
const word=(text,startMs,endMs)=>({text,startMs,endMs,timestampMs:null,confidence:null});
export const sentences=[
  {words:[word('Soll',0,180),word(' ich',180,360),word(' jetzt',360,550),word(' noch',550,740),word(' Backflip',740,1040),word(' machen',1040,1400)]},
  {words:[word('Hi.',1600,1850),word(' Mein',1900,2150),word(' Name',2200,2450)]},
  {words:[word('Ich',2600,2750),word(' bin',2750,2900),word(' 18',2900,3100),word(' Jahre',3100,3500)]},
  {words:[word('„Es',3800,3980),word(' hat',3980,4150),word(' mir',4150,4300),word(' auch',4300,4500),word(' gezeigt,“',4500,5000)]},
];
export const styleOptions={phrases:{
  0:{mode:'hero',endMs:1500,regions:{
    upper:{anchor:{x:.5,y:.245},wordGap:45},lower:{anchor:{x:.5,y:.65},rowGap:12,wordGap:40},
    accent:{anchor:{x:.5,y:.713}},
  },groups:[
    {from:0,to:1,role:'headline',region:'upper',size:270},
    {from:1,to:2,role:'headline',region:'upper',size:270},
    {from:2,to:3,role:'headline',region:'lower',line:0,size:165},
    {from:3,to:4,role:'headline',region:'lower',line:0,size:165},
    {from:4,to:5,role:'headline',region:'lower',line:1,size:215},
    {from:5,to:6,role:'script',region:'accent',size:125,zIndex:3},
  ]},
  1:{mode:'default',groups:[{from:0,to:1},{from:1,to:2},{from:2,to:3}]},
  2:{mode:'default',groups:[{from:0,to:4}]},
  3:{mode:'default',groups:[{from:0,to:5,size:66}]},
}};
