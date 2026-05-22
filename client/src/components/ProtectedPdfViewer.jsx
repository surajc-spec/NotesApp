import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc =
pdfWorker;

const ProtectedPdfViewer = ({
fileUrl,
title,
isFullscreen=false,
})=>{

const containerRef=
useRef(null);

const canvasRefs=
useRef([]);

const [pages,setPages]=
useState([]);

const [currentPage,setCurrentPage]=
useState(1);

const [jumpPage,setJumpPage]=
useState("");

const [error,setError]=
useState("");

const [showSearch,setShowSearch]=
useState(false);

const [searchText,setSearchText]=
useState("");



const scrollToPage=
(page)=>{

const canvas=
canvasRefs.current[
page-1
];

if(!canvas)
return;

canvas.scrollIntoView({

behavior:
"smooth",

block:
"start"

});

setCurrentPage(
page
);

};



useEffect(()=>{

let cancelled=
false;

let loadingTask;

const render=
async()=>{

setError("");

setPages([]);

canvasRefs.current=
[];

try{

loadingTask=
pdfjs.getDocument(
fileUrl
);

const pdf=
await loadingTask.promise;

if(cancelled)
return;

const pageList=
Array.from(

{
length:
pdf.numPages
},

(_,i)=>
i+1

);

setPages(
pageList
);

requestAnimationFrame(

async()=>{

const width=

Math.min(

(
containerRef.current
?.clientWidth
||
900
)-40,

900

);

for(

const num

of

pageList

){

if(cancelled)
return;

const page=

await pdf.getPage(
num
);

const viewport=
page.getViewport({

scale:
1

});

const scale=
width/
viewport.width;

const scaled=
page.getViewport({

scale

});

const canvas=

canvasRefs.current[
num-1
];

if(!canvas)
continue;

const ctx=
canvas.getContext(
"2d"
);

const ratio=
window.devicePixelRatio
||
1;

canvas.width=
scaled.width*
ratio;

canvas.height=
scaled.height*
ratio;

canvas.style.width=
`${scaled.width}px`;

canvas.style.height=
`${scaled.height}px`;

await page.render({

canvasContext:
ctx,

viewport:
scaled,

transform:

ratio!==1

?

[
ratio,
0,
0,
ratio,
0,
0
]

:

null

}).promise;

}

}

);

}

catch(err){

if(!cancelled){

setError(

err.message||

"Unable to render PDF"

);

}

}

};

if(fileUrl)
render();

return()=>{

cancelled=
true;

loadingTask
?.destroy();

};

},[
fileUrl
]);



return(

<div

ref={
containerRef
}

title={
title
}

className={`

overflow-y-auto

bg-surface-secondary

pb-6

${
isFullscreen

?

"fixed inset-0 z-[9999] bg-black px-8 py-6"

:

"h-[78vh] px-3"

}

`}

>

{/* TOP BAR */}

<div

className="

sticky

top-4

z-50

mb-4

"

>

<div

className="

mx-auto

flex

max-w-[900px]

items-center

justify-center

gap-3

rounded-xl

border

border-border

bg-black/80

backdrop-blur

p-3

"

>

<button

onClick={()=>

scrollToPage(

Math.max(
1,
currentPage-1
)

)

}

className="
rounded
bg-gray-700
px-3
py-1
text-white
"

>

←

</button>

<span
className="
text-white
"
>

Page

</span>

<input

value={
jumpPage
}

type="number"

onChange={(e)=>

setJumpPage(

e.target.value

)

}

onKeyDown={(e)=>{

if(

e.key===

"Enter"

){

const p=
Number(
jumpPage
);

if(

p>=1&&

p<=pages.length

){

scrollToPage(
p
);

}

}

}}

className="
w-20
rounded
bg-black
px-2
py-1
text-center
text-white
border
"

/>

<button

onClick={()=>{

const p=
Number(
jumpPage
);

if(

p>=1&&

p<=pages.length

){

scrollToPage(
p
);

}

}}

className="
rounded
bg-green-500
px-4
py-1
text-white
"

>

Go

</button>

<button

onClick={()=>

setShowSearch(
v=>!v
)

}

className="
rounded
bg-red-500
px-3
py-1
text-white
"

>

<Search
size={18}
/>

</button>

<span
className="
text-white
"
>

/ {pages.length}

</span>

<button

onClick={()=>

scrollToPage(

Math.min(

pages.length,

currentPage+1

)

)

}

className="
rounded
bg-gray-700
px-3
py-1
text-white
"

>

→

</button>

</div>

</div>



{

showSearch&&(

<div
className="
mb-4
flex
justify-center
"
>

<input

placeholder="
Search
"

value={
searchText
}

onChange={(e)=>

setSearchText(

e.target.value

)

}

className="
w-80
rounded
border
bg-surface
px-4
py-2
"

/>

</div>

)

}



{

error

?

<div
className="
text-red-500
"
>

{error}

</div>

:

<div

className="

mx-auto

flex

max-w-[900px]

flex-col

items-center

gap-8

"

>

{

pages.map(

(page)=>(

<div

key={
page
}

className="
relative
"

>

<div

className="
absolute
left-4
top-4
z-20
rounded
bg-red-600
px-3
py-1
text-white
"

>

{page}

</div>

<canvas

ref={(el)=>

canvasRefs.current[
page-1
]=el

}

draggable={
false
}

className="

mx-auto

rounded-xl

shadow-2xl

dark:invert-[0.92]

"

/>

</div>

)

)

}

</div>

}

</div>

);

};

export default ProtectedPdfViewer;