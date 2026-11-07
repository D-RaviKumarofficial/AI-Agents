export const audiences=['All','Individuals','Visitors','Business','Students'];
export function filterGroups(groups,{category='all',audience='All',query=''}={}){
 const needle=query.trim().toLocaleLowerCase();
 return groups.filter(g=>(category==='all'||g.category===category)&&(audience==='All'||g.audiences.includes(audience))&&(!needle||[g.name,g.description,...g.services.map(s=>s.name)].join(' ').toLocaleLowerCase().includes(needle)));
}
export function audienceCounts(groups,category='all'){
 return Object.fromEntries(audiences.map(a=>[a,filterGroups(groups,{category,audience:a}).length]));
}
