export const mockFields = [
 {id:'fullName',label:'Full name',type:'text',required:true,provenance:'demo-only'},
 {id:'email',label:'Email address (.test)',type:'email',required:true,provenance:'demo-only'},
 {id:'subject',label:'Request subject',type:'text',required:true,provenance:'demo-only'},
 {id:'details',label:'Request details',type:'textarea',required:true,provenance:'demo-only'}
];
export function serviceFields(service,variant){
 if(service.variants)return service.variants.find(v=>v.id===variant)?.fields??null;
 return service.fields.length?service.fields:mockFields;
}
export function validateServiceSubmission(catalog,body){
 const errors={};
 if(!body||typeof body!=='object'||Array.isArray(body))return {errors:{form:'A submission object is required.'}};
 const service=catalog.groups.flatMap(g=>g.services).find(s=>s.id===body.serviceId);
 if(!service)return {errors:{serviceId:'Unknown service.'}};
 const fields=serviceFields(service,body.variant);
 if(!fields)return {errors:{variant:'Choose a known lookup tab.'}};
 if(body.demoOnly!==true)errors.demoOnly='Confirm the details entered are for testing purposes.';
 if(body.consent!==true)errors.consent='Confirm this request is not submitted to any authority.';
 const values=body.values??{},clean={};
 for(const field of fields){const value=field.disabled?field.value:values[field.id];
 if(typeof value!=='string'){if(field.required)errors[field.id]=`Enter ${field.label}.`;continue;}
 const v=value.trim();if(field.required&&!v)errors[field.id]=`Enter ${field.label}.`;
 if(v.length>3000)errors[field.id]=`${field.label} exceeds 3000 characters.`;
 if(v&&field.type==='number'&&!/^\d{1,20}$/.test(v))errors[field.id]=`Use a nonnegative test number for ${field.label}.`;
 if(v&&field.syntheticId&&!/^DEMO[-_A-Za-z0-9]*$/.test(v))errors[field.id]='Use a test ID starting with DEMO; never enter a real identity number.';
 if(v&&field.type==='checkbox'&&v!=='yes')errors[field.id]=`Confirm ${field.label}.`;
 if(v&&field.type==='file'){try{const f=JSON.parse(v);if(typeof f.name!=='string'||f.name.length>200||!Number.isInteger(f.size)||f.size<0||f.size>5*1024*1024||!['text/plain','image/png','image/jpeg','application/pdf'].includes(f.type)||Object.keys(f).some(k=>!['name','size','type'].includes(k)))throw Error();}catch{errors[field.id]='Select a file of up to 5 MB (TXT, PNG, JPG or PDF).';}}
 if(v&&field.type==='email'&&!/^[^\s@]+@[^\s@]+\.test$/.test(v))errors[field.id]='Use an email ending in .test.';
 if(v&&field.type==='select'&&field.options?.length&&!field.options.includes(v))errors[field.id]=`Choose a known ${field.label}.`;
 clean[field.id]=v;
 }
 return {errors,service,values:clean,variant:service.variants?body.variant:null};
}
