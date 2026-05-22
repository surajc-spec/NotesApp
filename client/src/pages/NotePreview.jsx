import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
ArrowLeft,
Loader2,
Maximize,
Minimize,
RefreshCw,
ShieldCheck,
} from 'lucide-react';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

import PasswordModal from '../components/PasswordModal';
import ScreenshotGuard from '../components/ScreenshotGuard';
import ProtectedPdfViewer from '../components/ProtectedPdfViewer';

const NotePreview=()=>{

const {id}=useParams();

const navigate=
useNavigate();

const {user}=
useContext(
AuthContext
);

const [note,setNote]=
useState(null);

const [previewUrl,setPreviewUrl]=
useState('');

const [loading,setLoading]=
useState(true);

const [error,setError]=
useState('');

const [isFullscreen,setIsFullscreen]=
useState(false);

const [
isPasswordModalOpen,
setIsPasswordModalOpen
]=
useState(false);

const [
enteredPassword,
setEnteredPassword
]=
useState('');

const [
isPasswordProtected,
setIsPasswordProtected
]=
useState(false);

const previewUrlRef=
useRef('');



const readApiError=
async(err)=>{

if(
!err.response?.data
){

return 'Preview unavailable';

}

try{

if(
err.response.data
instanceof Blob
){

const text=
await err.response.data.text();

return JSON.parse(
text
).message;

}

return (
err.response.data.message
);

}

catch{

return 'Preview unavailable';

}

};



const watermark=
useMemo(
()=>{

return `Viewed by ${
user?.name||
'User'
}`;

},
[user]
);



const loadPreview=
async(
pwd=
enteredPassword
)=>{

setLoading(
true
);

setError(
''
);

try{

if(
previewUrlRef.current
){

URL.revokeObjectURL(
previewUrlRef.current
);

}

const config={

headers:{}

};

if(
pwd
){

config.headers[
'x-note-password'
]=
pwd;

}



// FIXED

const info=
await api.get(

`/notes/${id}/preview-info`,

config

);

setNote(
info.data
);

setIsPasswordProtected(

info.data
.isPasswordProtected

);



// FIXED

const file=
await api.get(

`/notes/${id}/preview`,

{

responseType:
'blob',

...config,

headers:{

...(config.headers)

}

}

);

const url=
URL.createObjectURL(
file.data
);

previewUrlRef.current=
url;

setPreviewUrl(
url
);

setIsPasswordModalOpen(
false
);

}

catch(err){

const askPwd=

err.response?.status===401;

if(
askPwd
){

setIsPasswordProtected(
true
);

setIsPasswordModalOpen(
true
);

}

else{

setError(

await readApiError(
err
)

);

}

}

finally{

setLoading(
false
);

}

};



const handlePasswordSubmit=
async(
password
)=>{

await api.post(

`/notes/${id}/verify-password`,

{

password

}

);

setEnteredPassword(
password
);

await loadPreview(
password
);

};



useEffect(()=>{

loadPreview();

return ()=>{

if(
previewUrlRef.current
){

URL.revokeObjectURL(

previewUrlRef.current

);

}

};

},[
id
]);



if(
loading
){

return(

<div
className="
flex
min-h-screen
items-center
justify-center
"
>

<Loader2
size={48}
className="
animate-spin
"
/>

</div>

);

}



if(
error
){

return(

<div
className="
flex
min-h-screen
items-center
justify-center
"
>

<div>

<ShieldCheck/>

<p>

{error}

</p>

<button
onClick={()=>
navigate(
'/notes'
)
}
>

Back

</button>

</div>

</div>

);

}



return(

<ScreenshotGuard>

<div>

<div
className="
mb-5
flex
gap-3
"
>

<button
onClick={()=>
navigate(
-1
)
}
>

<ArrowLeft/>

</button>

<button
onClick={()=>
loadPreview()
}
>

<RefreshCw/>

</button>

<button
onClick={()=>

setIsFullscreen(
v=>!v
)

}
>

{

isFullscreen

?

<Minimize/>

:

<Maximize/>

}

</button>

</div>

<ProtectedPdfViewer

fileUrl={
previewUrl
}

title={
note?.title
}

isFullscreen={
isFullscreen
}

watermark={
watermark
}

/>

</div>

<PasswordModal

isOpen={
isPasswordModalOpen
}

onSubmit={
handlePasswordSubmit
}

onClose={()=>
navigate(
-1
)
}

/>

</ScreenshotGuard>

);

};

export default NotePreview;