import React,
{
useEffect,
useState,
useRef
}
from
'react';

import {
ShieldAlert,
EyeOff
}
from
'lucide-react';

const ScreenshotGuard=({

children,

isEnabled=true

})=>{

const [
isAlertActive,
setIsAlertActive
]=
useState(false);

const [
alertMessage,
setAlertMessage
]=
useState('');

const [
isBlurred,
setIsBlurred
]=
useState(false);

const dummyRef=
useRef(null);



useEffect(()=>{

if(
!isEnabled
)
return;

const styleId=
'preview-guard-style';

if(
!document.getElementById(
styleId
)
){

const style=
document.createElement(
'style'
);

style.id=
styleId;

style.textContent=`

.protected-preview,
.protected-preview *{

user-select:none!important;

-webkit-user-select:none!important;

-webkit-touch-callout:none!important;

-webkit-user-drag:none!important;

}

`;

document.head.appendChild(
style
);

}

},[
isEnabled
]);



useEffect(()=>{

if(
!isEnabled
)
return;

let timer;

const warn=
(msg)=>{

setAlertMessage(
msg
);

setIsAlertActive(
true
);

clearTimeout(
timer
);

timer=
setTimeout(()=>{

setIsAlertActive(
false
);

},2500);

};



const clearClipboard=
()=>{

try{

navigator
.clipboard
.writeText(
''
);

}

catch{}

};



const block=
(
e,
msg
)=>{

e.preventDefault();

e.stopPropagation();

clearClipboard();

warn(
msg
);

};



const keyDown=
(e)=>{

const key=
(
e.key||
''
)
.toLowerCase();

const mod=
e.ctrlKey||
e.metaKey;

const forbidden=

e.key==='PrintScreen'

||

(mod&&key==='c')

||

(mod&&key==='v')

||

(mod&&key==='x')

||

(mod&&key==='u')

||

(mod&&key==='s')

||

(mod&&key==='p')

||

(mod&&
e.shiftKey&&
key==='i')

||

(mod&&
e.shiftKey&&
key==='j')

||

(mod&&
e.shiftKey&&
key==='c')

||

(mod&&
e.shiftKey&&
key==='s')

||

e.key==='F11'

||

e.key==='F12';



if(
forbidden
){

block(

e,

'Protected preview'

);

}

};



const context=
(e)=>{

block(

e,

'Right click disabled'

);

};



const clip=
(e)=>{

block(

e,

'Copy disabled'

);

};



const drag=
(e)=>{

e.preventDefault();

};



const visibility=
()=>{

setIsBlurred(

document.hidden

);

};



const focus=()=>{

setIsBlurred(
false
);

};



const blur=()=>{

setIsBlurred(
true
);

};



window.addEventListener(
'keydown',
keyDown,
true
);

window.addEventListener(
'focus',
focus
);

window.addEventListener(
'blur',
blur
);

document.addEventListener(
'visibilitychange',
visibility
);

document.addEventListener(
'copy',
clip,
true
);

document.addEventListener(
'cut',
clip,
true
);

document.addEventListener(
'paste',
clip,
true
);

document.addEventListener(
'contextmenu',
context
);

document.addEventListener(
'dragstart',
drag
);



return()=>{

window.removeEventListener(
'keydown',
keyDown,
true
);

window.removeEventListener(
'focus',
focus
);

window.removeEventListener(
'blur',
blur
);

document.removeEventListener(
'visibilitychange',
visibility
);

document.removeEventListener(
'copy',
clip,
true
);

document.removeEventListener(
'cut',
clip,
true
);

document.removeEventListener(
'paste',
clip,
true
);

document.removeEventListener(
'contextmenu',
context
);

document.removeEventListener(
'dragstart',
drag
);

clearTimeout(
timer
);

};

},[
isEnabled
]);



return(

<div
className="
relative
w-full
h-full
protected-preview
"
>

<div
ref={
dummyRef
}
tabIndex={
-1
}
/>

<div

style={{

filter:

isBlurred||

isAlertActive

?

'blur(22px)'

:

'none',

opacity:

isBlurred||

isAlertActive

?

0.08

:

1

}}

className="

w-full

h-full

transition-all

duration-300

"

>

{children}

</div>



{

isAlertActive&&(

<div
className="
absolute
inset-0
z-50
flex
items-center
justify-center
bg-black/70
"
>

<div
className="
rounded-3xl
bg-surface
p-8
text-center
"
>

<ShieldAlert
size={
36
}
/>

<p>

{
alertMessage
}

</p>

</div>

</div>

)

}



{

isBlurred&&
!isAlertActive&&(

<div
className="
absolute
inset-0
z-50
flex
items-center
justify-center
bg-black/70
"
>

<div
className="
rounded-3xl
bg-surface
p-8
text-center
"
>

<EyeOff
size={
36
}
/>

<p>

View paused

</p>

</div>

</div>

)

}

</div>

);

};

export default ScreenshotGuard;