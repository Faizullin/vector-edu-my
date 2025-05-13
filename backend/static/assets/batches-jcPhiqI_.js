import{r as c,j as s,L as l}from"./index-BFkE31IL.js";import{b as d,s as m}from"./use-auth-DHccd34A.js";import{H as x,T as u,P as h,M as p}from"./theme-switch-DqUBxbL4.js";import{C as j,a as g,b as f,d as N}from"./card-BnRcE97p.js";import{c as t,a9 as y}from"./IconSun-DCedqkE3.js";import{B as v}from"./book-open-3HDu-dIr.js";import"./createReactComponent-D3fbIqZl.js";/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3",key:"1xhozi"}]],k=t("headphones",b);/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]],C=t("message-square",w);/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],_=t("pencil",L),M=[{slug:"writing",icon:s.jsx(_,{className:"text-muted-foreground h-4 w-4"})},{slug:"listening",icon:s.jsx(k,{className:"text-muted-foreground h-4 w-4"})},{slug:"reading",icon:s.jsx(v,{className:"text-muted-foreground h-4 w-4"})},{slug:"speaking",icon:s.jsx(C,{className:"text-muted-foreground h-4 w-4"})}];function q(){const{data:a,isLoading:o}=d({queryKey:["lesson-batches"],queryFn:()=>m({url:"/lessons/batches/",method:"GET",query:{disablePagination:!0}})}),i=c.useMemo(()=>a?a.map(e=>{const n=M.find(r=>r.slug===e.title);return{...e,icon:(n==null?void 0:n.icon)??null}}):[],[a]);return s.jsxs(s.Fragment,{children:[s.jsxs(x,{fixed:!0,children:[s.jsx(y,{}),s.jsxs("div",{className:"ml-auto flex items-center space-x-4",children:[s.jsx(u,{}),s.jsx(h,{})]})]}),s.jsx(p,{children:s.jsxs("div",{className:"container py-10",children:[s.jsx("div",{className:"mb-8",children:s.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Lesson Batches"})}),s.jsx("div",{className:"grid gap-4 sm:grid-cols-2 lg:grid-cols-4",children:o?s.jsx("div",{className:"flex items-center justify-center",children:s.jsx("p",{children:"Loading..."})}):i.map(e=>s.jsx(l,{to:"/lessons/lessons/?batch_id="+e.id,children:s.jsxs(j,{className:"hover:bg-accent/5 transition-colors",children:[s.jsxs(g,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[s.jsx(f,{className:"text-sm font-medium",children:e.title}),e.icon]}),s.jsx(N,{children:s.jsxs("div",{className:"text-2xl font-bold",children:[e.lesson_count," Lessons"]})})]})},e.id))})]})})]})}const R=function(){return s.jsx(q,{})};export{R as component};
