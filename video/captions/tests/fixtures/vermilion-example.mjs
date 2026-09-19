// Synthetic developer timing, never inserted into the user's gallery transcript.
const texts=['STOP using your MUSIC wrong.','DID YOU hear that.','PERFECT for BUILDING Tension.',
  'PERFECT FOR CREATING Rhythm.','WHY? YOU ASK?','MAKE SURE TO MAKE THEM WEAR SUNGLASSES.','FOLLOW for MORE.'];
let offset=0,index=0;
export const phraseRanges=[];
export const sentences=texts.map(text=>{
  const words=text.split(' ').map((text,i)=>({text:(i?' ':'')+text,startMs:offset+i*400,endMs:offset+(i+1)*400,timestampMs:null,confidence:null}));
  phraseRanges.push([index,index+words.length]);index+=words.length;offset=words.at(-1).endMs+600;return {words};
});
const group=(from,to,role,line,extra={})=>({from,to,role,line,...extra});
export const styleOptions={phraseRanges,phrases:{
  0:{mode:'decorative',template:'split-hook',groups:[group(0,1,'hero',0),group(1,3,'connector',1),group(3,4,'hero',2),group(4,5,'emphasis',3,{size:150,travel:140})]},
  1:{mode:'decorative',template:'compact',anchor:{x:.5,y:.37},groups:[group(5,7,'hero',0,{size:240}),group(7,9,'connector',1)]},
  2:{mode:'decorative',template:'compact',groups:[group(9,10,'hero',0,{anchor:{x:.5,y:.25}}),group(10,11,'connector',1,{anchor:{x:.58,y:.35}}),group(11,12,'hero',2,{anchor:{x:.5,y:.65},size:240}),group(12,13,'emphasis',3,{anchor:{x:.55,y:.69}})]},
  3:{mode:'decorative',template:'overlap',groups:[group(13,14,'hero',0),group(14,16,'supporting',1),group(16,17,'emphasis',2)]},
  4:{mode:'stack',template:'stagger',groups:[group(17,18,'supporting',0),group(18,19,'supporting',1),group(19,20,'supporting',2)]},
  5:{mode:'stack',template:'downward',defaults:{color:'#FFFFFF',size:100},groups:[group(20,22,'supporting',0),group(22,23,'supporting',1),group(23,25,'supporting',2),group(25,26,'supporting',3),group(26,27,'supporting',4)]},
  6:{mode:'decorative',template:'callout',groups:[group(27,28,'hero',0,{size:220}),group(28,29,'connector',1,{offset:{x:120,y:-20}}),group(29,30,'hero',2,{size:330})]},
}};
