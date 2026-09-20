import {timedRows} from './yellow-example.mjs';
import {planYellow} from '../../assets/caption-code/src/yellow.mjs';
// Exhaustive authored renderer fixture, not an editorial policy for real transcripts.
export function treatmentDemo(){
  const definitions=[
    ['People will pay.','plain-center',[[0,3,'ordinary','phrase-cut',0]]],
    ['Which are the three selling?','word-build',[[0,3,'ordinary','word-fade',0],[3,5,'ordinary','word-fade',1]]],
    ['People only spend money.','support-emphasis',[[0,2,'ordinary','phrase-cut',0],[2,4,'opening','line-rise',1]],{hook:true,fade:true}],
    ['1 Solutions.','numbered-heading',[[0,1,'numeral','number-settle',0],[1,2,'italic','heading-glide',0]]],
    ['Debt.','list-keyword',[[0,1,'italic','quick-rise',0]]],
    ['faster.','yellow-keyword',[[0,1,'emphasis','quick-rise',0]]],
    ['anything.','yellow-keyword',[[0,1,'hero','phrase-cut',0]]],
    ['The bigger the pain.','comparative-pair',[[0,2,'lead','phrase-cut',0],[2,4,'tail','phrase-cut',1]] ],
    ['The bigger the check.','comparative-pair',[[0,2,'lead','comparison-glide',0],[2,4,'tail','comparison-glide',1]],{upper:true}],
    ['They’re the most convenient.','support-emphasis',[[0,3,'ordinary','word-fade',0],[3,4,'emphasis','scattered-glyph-resolve',1]]],
    ['Fix that and the money shows up.','reverse-payoff',[[0,2,'hero','scattered-glyph-resolve',0],[2,7,'consequence','word-fade',1]]],
    ['The Wolf of Wall Street.','closing-title',[[0,5,'closing','word-fade',0]]],
    ['$10,000','amount-hero',[[0,1,'amount','scattered-glyph-resolve',0]],{fade:true}],
    ['The Richest Companies on the planet aren’t the smartest.','comparison-annotations',[[0,3,'annotationYellow','word-fade',0],[3,6,'annotation','word-fade',1],[6,8,'annotation','word-fade',2],[8,9,'annotationYellow','word-fade',3]],{panels:2}],
    ['a feeling.','plain-center',[[0,2,'small','phrase-cut',0]]],
  ];
  const sentences=timedRows(definitions.map(d=>d[0]),240,900,450);
  let offset=0;
  const groups=definitions.map(([text,template,spans,extra={}],i)=>{
    const from=offset;offset+=sentences[i].words.length;
    return {from,to:offset,template,reason:'individual treatment demonstration',...extra,
      spans:spans.map(([a,b,role,recipe,line])=>({from:from+a,to:from+b,role,recipe,line,...(template==='amount-hero'?{nominalDuration:333}:{})}))};
  });
  const editorialPlan={source:sentences.flatMap(s=>s.words).map(w=>w.text),groups};
  return {sentences,plan:planYellow(sentences,{editorialPlan})};
}
