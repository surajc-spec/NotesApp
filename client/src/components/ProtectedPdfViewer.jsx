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

const [searchText,setSearchText]=
useState("");

const [showSearch,setShowSearch]=
useState(false);



const scrollToPage=
(pageNumber)=>{

const canvas=
canvasRefs.current[
pageNumber-1
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
pageNumber
);

};



useEffect(()=>{

let cancelled=
false;

let loadingTask;

const renderPdf=
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
containerRef
.current
?.clientWidth
||
900
)-24,

980

);

for(

const pageNumber

of

pageList

){

if(cancelled)
return;

const page=
await pdf.getPage(
pageNumber
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
pageNumber-1
];

if(!canvas)
continue;

const context=
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
context,

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
renderPdf();

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

px-3

pt-0

pb-5

${

isFullscreen

?

"h-full"

:

"h-[78vh]"

}

`}

>

<div

className="

sticky

top-0

z-50

bg-surface-secondary

pt-0

pb-3

"

>

<div

className="

flex

items-center

justify-center

gap-3

rounded-b-xl

border

border-border

bg-surface

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

<span>

Page

</span>

<input

type="number"

value={
jumpPage
}

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

border

bg-white

text-black

dark:bg-[#171717]

dark:text-white

px-2

py-1

text-center

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

!showSearch

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

<span>

/ {pages.length}</span>

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

placeholder="Search"

value={
searchText
}

onChange={(e)=>

setSearchText(

e.target.value

)

}

className="

w-72

rounded

border

bg-surface

px-3

py-2

text-foreground

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
flex-col
items-center
gap-5
"
>

{

pages.map(

(pageNumber)=>(

<div
key={
pageNumber
}
className="
relative
"
>

<div
className="
absolute
left-3
top-3
z-10
rounded
bg-red-600
px-2
py-1
text-sm
text-white
"
>

{pageNumber}

</div>

<canvas

ref={(node)=>

canvasRefs.current[
pageNumber-1
]=node

}

className="

shadow-xl

dark:invert-[0.92]

"

draggable={
false
}

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